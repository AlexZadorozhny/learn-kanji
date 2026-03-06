import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import { usePracticeStore } from '../../store/practiceStore';
import StrokeOrderCanvas from '../../components/kanji/StrokeOrderCanvas';
import { PracticeResult } from '../../types/practice';

type StrokeOrderScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'StrokeOrderScreen'
>;
type StrokeOrderScreenRouteProp = RouteProp<PracticeStackParamList, 'StrokeOrderScreen'>;

export default function StrokeOrderScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StrokeOrderScreenNavigationProp>();
  const route = useRoute<StrokeOrderScreenRouteProp>();
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
  const [correctStrokes, setCorrectStrokes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);

  useEffect(() => {
    // Get kanji IDs from route params or use kanji with stroke data
    let kanjiIds = route.params?.kanjiIds;

    if (!kanjiIds || kanjiIds.length === 0) {
      // Only use kanji that have stroke order data
      kanjiIds = kanjiData
        .filter((k) => k.strokeOrder && k.strokeOrder.length > 0)
        .map((k) => k.id)
        .slice(0, 5); // Max 5 kanji per session
    }

    if (kanjiIds.length === 0) {
      // No kanji with stroke data available
      navigation.goBack();
      return;
    }

    startSession('writing', kanjiIds);
  }, []);

  const handleStrokeComplete = (correct: boolean) => {
    setTotalStrokes((prev) => prev + 1);
    if (correct) {
      setCorrectStrokes((prev) => prev + 1);
    }
  };

  const handleAllStrokesComplete = () => {
    if (!currentSession) return;

    const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Calculate accuracy for this kanji
    const accuracy = totalStrokes > 0 ? (correctStrokes / totalStrokes) * 100 : 0;
    const wasCorrect = accuracy >= 70; // 70% accuracy threshold

    // Add result
    const result: PracticeResult = {
      kanjiId: currentKanjiId,
      correct: wasCorrect,
      rating: wasCorrect ? 5 : 2,
      timeSpent,
    };
    addResult(result);

    // Update kanji progress - writing score
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

    const scoreIncrement = wasCorrect ? 10 : -5;
    const newWritingScore = Math.max(
      0,
      Math.min(100, currentProgress.writingScore + scoreIncrement)
    );

    updateKanjiProgress(currentKanjiId, {
      writingScore: newWritingScore,
      lastReviewed: new Date().toISOString(),
      totalAttempts: currentProgress.totalAttempts + 1,
      correctAttempts: currentProgress.correctAttempts + (wasCorrect ? 1 : 0),
    });

    // Move to next kanji or show results
    if (currentSession.currentIndex + 1 < currentSession.kanjiIds.length) {
      // Reset stroke counters
      setCorrectStrokes(0);
      setTotalStrokes(0);
      nextCard();
    } else {
      // Session complete
      endSession();

      // Update study stats
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 60000);
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

  if (!currentKanji || !currentKanji.strokeOrder) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
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

      <StrokeOrderCanvas
        key={currentKanji.id}
        kanji={currentKanji}
        onStrokeComplete={handleStrokeComplete}
        onAllStrokesComplete={handleAllStrokesComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
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
