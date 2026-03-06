import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import { usePracticeStore } from '../../store/practiceStore';
import { SRSService } from '../../services/practice/SRSService';
import FlashcardComponent from '../../components/practice/FlashcardComponent';
import { PracticeResult } from '../../types/practice';

type FlashcardScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'FlashcardScreen'
>;
type FlashcardScreenRouteProp = RouteProp<PracticeStackParamList, 'FlashcardScreen'>;

export default function FlashcardScreen() {
  const navigation = useNavigation<FlashcardScreenNavigationProp>();
  const route = useRoute<FlashcardScreenRouteProp>();
  const { kanjiData } = useKanjiStore();
  const { kanjiProgress, updateKanjiProgress, updateStudyStats, studyStats } = useProgressStore();
  const {
    currentSession,
    startSession,
    endSession,
    addResult,
    nextCard,
    getSessionProgress,
  } = usePracticeStore();

  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    // Get kanji IDs from route params or use review queue
    let kanjiIds = route.params?.kanjiIds;

    if (!kanjiIds || kanjiIds.length === 0) {
      // Get due kanji for review
      const dueKanji = SRSService.getDueKanji(kanjiProgress);

      // Add new kanji if needed
      const allKanjiIds = kanjiData.map((k) => k.id);
      const newKanji = SRSService.getNewKanji(allKanjiIds, kanjiProgress, 5);

      kanjiIds = [...dueKanji, ...newKanji].slice(0, 10); // Max 10 cards per session
    }

    if (kanjiIds.length === 0) {
      // No kanji available
      navigation.goBack();
      return;
    }

    startSession('flashcard', kanjiIds);
  }, []);

  const handleRate = (rating: number) => {
    if (!currentSession) return;

    const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Convert rating to quality (0-5 scale for SM-2)
    const quality = SRSService.ratingToQuality(rating);

    // Add result
    const result: PracticeResult = {
      kanjiId: currentKanjiId,
      correct: rating >= 3,
      rating: quality,
      timeSpent,
    };
    addResult(result);

    // Update kanji progress with SRS calculation
    const currentProgress = kanjiProgress[currentKanjiId] || {
      kanjiId: currentKanjiId,
      status: 'new' as const,
      recognitionScore: 0,
      writingScore: 0,
      readingScore: 0,
      contextScore: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      totalAttempts: 0,
      correctAttempts: 0,
      mistakeHistory: [],
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    const srsUpdate = SRSService.calculateNextReview(currentProgress, quality);

    // Update recognition score based on rating
    const scoreIncrement = rating >= 3 ? 10 : -5;
    const newRecognitionScore = Math.max(
      0,
      Math.min(100, currentProgress.recognitionScore + scoreIncrement)
    );

    updateKanjiProgress(currentKanjiId, {
      ...srsUpdate,
      recognitionScore: newRecognitionScore,
      totalAttempts: currentProgress.totalAttempts + 1,
      correctAttempts: currentProgress.correctAttempts + (rating >= 3 ? 1 : 0),
    });

    // Move to next card or show results
    if (currentSession.currentIndex + 1 < currentSession.kanjiIds.length) {
      nextCard();
    } else {
      // Session complete
      endSession();

      // Update study stats
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 60000); // minutes
      updateStudyStats({
        totalKanjiStudied: studyStats.totalKanjiStudied + currentSession.kanjiIds.length,
        totalStudyTimeMinutes: studyStats.totalStudyTimeMinutes + sessionDuration,
      });

      navigation.navigate('ResultsScreen', { sessionId: currentSession.id });
    }
  };

  if (!currentSession) {
    return null;
  }

  const progress = getSessionProgress();
  const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
  const currentKanji = kanjiData.find((k) => k.id === currentKanjiId);

  if (!currentKanji) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            endSession();
            navigation.goBack();
          }}
        />
        <View style={styles.progressContainer}>
          <Text variant="bodyMedium">
            {progress.current + 1} / {progress.total}
          </Text>
          <ProgressBar
            progress={(progress.current + 1) / progress.total}
            style={styles.progressBar}
          />
        </View>
      </View>

      <FlashcardComponent kanji={currentKanji} onRate={handleRate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50, // Account for status bar
    backgroundColor: '#fff',
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  progressBar: {
    marginTop: 4,
    height: 6,
  },
});
