import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, IconButton, ProgressBar, Button, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import { usePracticeStore } from '../../store/practiceStore';
import { TTSService } from '../../services/audio/TTSService';
import { HapticService } from '../../services/feedback/HapticService';
import { PracticeResult } from '../../types/practice';
import { ExampleWord } from '../../types/kanji';

type ContextPracticeScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'ContextPracticeScreen'
>;
type ContextPracticeScreenRouteProp = RouteProp<PracticeStackParamList, 'ContextPracticeScreen'>;

export default function ContextPracticeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<ContextPracticeScreenNavigationProp>();
  const route = useRoute<ContextPracticeScreenRouteProp>();
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
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Get kanji IDs from route params or use all kanji
    let kanjiIds = route.params?.kanjiIds;

    if (!kanjiIds || kanjiIds.length === 0) {
      // Use all kanji with example words
      kanjiIds = kanjiData
        .filter((k) => k.exampleWords && k.exampleWords.length > 0)
        .map((k) => k.id)
        .slice(0, 10); // Max 10 kanji per session
    }

    if (kanjiIds.length === 0) {
      // No kanji available
      navigation.goBack();
      return;
    }

    startSession('context', kanjiIds);
  }, []);

  const handleSpeak = async (text: string) => {
    if (speaking) return;

    try {
      setSpeaking(true);
      HapticService.light();
      await TTSService.speak(text);
    } catch (error) {
      console.error('Failed to speak:', error);
    } finally {
      setSpeaking(false);
    }
  };

  const handleReveal = () => {
    HapticService.warning();
    setShowAnswer(true);
  };

  const handleNext = (wasCorrect: boolean) => {
    if (!currentSession) return;

    const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Add result
    const result: PracticeResult = {
      kanjiId: currentKanjiId,
      correct: wasCorrect,
      rating: wasCorrect ? 5 : 2, // Simple binary rating
      timeSpent,
    };
    addResult(result);

    // Update kanji progress - context score
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
    const newContextScore = Math.max(
      0,
      Math.min(100, currentProgress.contextScore + scoreIncrement)
    );

    updateKanjiProgress(currentKanjiId, {
      contextScore: newContextScore,
      lastReviewed: new Date().toISOString(),
      totalAttempts: currentProgress.totalAttempts + 1,
      correctAttempts: currentProgress.correctAttempts + (wasCorrect ? 1 : 0),
    });

    // Haptic feedback based on result
    if (wasCorrect) {
      HapticService.success();
    } else {
      HapticService.warning();
    }

    // Move to next card or show results
    if (currentSession.currentIndex + 1 < currentSession.kanjiIds.length) {
      nextCard();
      setShowAnswer(false);
      setSelectedAnswers([]);
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

  if (!currentKanji) {
    return null;
  }

  // Select 3 example words to show
  const exampleWords = currentKanji.exampleWords.slice(0, 3);

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

      <View style={styles.content}>
        <Card style={styles.kanjiCard}>
          <Card.Content>
            <Text variant="headlineLarge" style={[styles.targetKanji, { color: theme.colors.primary }]}>
              {currentKanji.character}
            </Text>
            {!showAnswer && (
              <Text variant="bodyLarge" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Find this kanji in the words below
              </Text>
            )}
            {showAnswer && (
              <View style={styles.meaningsContainer}>
                <Text variant="titleMedium" style={[styles.meanings, { color: theme.colors.primary }]}>
                  {currentKanji.meanings.join(', ')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.wordsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Example Words
          </Text>

          {exampleWords.map((word: ExampleWord, index: number) => (
            <Card key={index} style={styles.wordCard}>
              <Pressable onPress={() => handleSpeak(word.reading)}>
                <Card.Content style={styles.wordContent}>
                  <View style={styles.wordTextContainer}>
                    <View style={styles.wordRow}>
                      <Text variant="headlineSmall" style={[styles.wordText, { color: theme.colors.onSurface }]}>
                        {word.word}
                      </Text>
                      <IconButton
                        icon={speaking ? 'stop' : 'volume-high'}
                        size={20}
                        onPress={() => handleSpeak(word.reading)}
                      />
                    </View>
                    <Text variant="bodyMedium" style={[styles.readingText, { color: theme.colors.onSurfaceVariant }]}>
                      {word.reading} ({word.romaji})
                    </Text>
                    {showAnswer && (
                      <Text variant="bodyMedium" style={[styles.meaningText, { color: theme.colors.onSurface }]}>
                        {word.meaning}
                      </Text>
                    )}
                  </View>
                </Card.Content>
              </Pressable>
            </Card>
          ))}
        </View>

        {!showAnswer ? (
          <Button
            mode="contained"
            onPress={handleReveal}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Show Meanings
          </Button>
        ) : (
          <View style={styles.ratingButtons}>
            <Button
              mode="contained"
              onPress={() => handleNext(false)}
              style={[styles.button, styles.incorrectButton]}
              contentStyle={styles.buttonContent}
            >
              Need Practice
            </Button>
            <Button
              mode="contained"
              onPress={() => handleNext(true)}
              style={[styles.button, styles.correctButton]}
              contentStyle={styles.buttonContent}
            >
              Got It!
            </Button>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  kanjiCard: {
    marginBottom: 16,
    elevation: 2,
  },
  targetKanji: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    textAlign: 'center',
  },
  meaningsContainer: {
    marginTop: 8,
  },
  meanings: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wordsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  wordCard: {
    marginBottom: 12,
    elevation: 2,
  },
  wordContent: {
    paddingVertical: 8,
  },
  wordTextContainer: {
    gap: 4,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    fontWeight: 'bold',
  },
  readingText: {
  },
  meaningText: {
    marginTop: 4,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  incorrectButton: {
    flex: 1,
    backgroundColor: '#ff9800',
  },
  correctButton: {
    flex: 1,
    backgroundColor: '#4caf50',
  },
});
