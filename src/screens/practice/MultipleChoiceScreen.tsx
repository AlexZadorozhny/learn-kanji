import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, IconButton, ProgressBar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import { usePracticeStore } from '../../store/practiceStore';
import { QuizService, QuizQuestion } from '../../services/practice/QuizService';
import { HapticService } from '../../services/feedback/HapticService';
import { PracticeResult } from '../../types/practice';

type MultipleChoiceScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'MultipleChoiceScreen'
>;
type MultipleChoiceScreenRouteProp = RouteProp<PracticeStackParamList, 'MultipleChoiceScreen'>;

export default function MultipleChoiceScreen() {
  const navigation = useNavigation<MultipleChoiceScreenNavigationProp>();
  const route = useRoute<MultipleChoiceScreenRouteProp>();
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
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Get kanji IDs from route params or use all kanji
    let kanjiIds = route.params?.kanjiIds;

    if (!kanjiIds || kanjiIds.length === 0) {
      // Use all kanji
      kanjiIds = kanjiData.map((k) => k.id).slice(0, 10); // Max 10 questions per session
    }

    if (kanjiIds.length === 0) {
      // No kanji available
      navigation.goBack();
      return;
    }

    startSession('quiz', kanjiIds);
  }, []);

  useEffect(() => {
    // Generate question when session starts or card changes
    if (currentSession) {
      const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
      const currentKanji = kanjiData.find((k) => k.id === currentKanjiId);

      if (currentKanji) {
        const question = QuizService.generateQuestion(currentKanji, kanjiData);
        setCurrentQuestion(question);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }
  }, [currentSession?.currentIndex]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    // Haptic feedback
    if (isCorrect) {
      HapticService.success();
    } else {
      HapticService.warning();
    }

    // Wait a moment then move to next question
    setTimeout(() => {
      handleNext(isCorrect);
    }, 1500);
  };

  const handleNext = (wasCorrect: boolean) => {
    if (!currentSession || !currentQuestion) return;

    const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Add result
    const result: PracticeResult = {
      kanjiId: currentKanjiId,
      correct: wasCorrect,
      rating: wasCorrect ? 5 : 2,
      timeSpent,
    };
    addResult(result);

    // Update kanji progress - reading score for quiz
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
    const newReadingScore = Math.max(
      0,
      Math.min(100, currentProgress.readingScore + scoreIncrement)
    );

    updateKanjiProgress(currentKanjiId, {
      readingScore: newReadingScore,
      lastReviewed: new Date().toISOString(),
      totalAttempts: currentProgress.totalAttempts + 1,
      correctAttempts: currentProgress.correctAttempts + (wasCorrect ? 1 : 0),
    });

    // Move to next card or show results
    if (currentSession.currentIndex + 1 < currentSession.kanjiIds.length) {
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

  if (!currentSession || !currentQuestion) {
    return null;
  }

  const progress = getSessionProgress();
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

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

      <View style={styles.content}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.questionLabel}>
              QUESTION
            </Text>
            <Text variant="headlineMedium" style={styles.questionText}>
              {currentQuestion.question}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            const showCorrect = showFeedback && isCorrectOption;
            const showIncorrect = showFeedback && isSelected && !isCorrectOption;

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswerSelect(option)}
                disabled={showFeedback}
              >
                <Card
                  style={[
                    styles.optionCard,
                    showCorrect && styles.correctCard,
                    showIncorrect && styles.incorrectCard,
                  ]}
                >
                  <Card.Content style={styles.optionContent}>
                    <Text
                      variant="headlineSmall"
                      style={[
                        styles.optionText,
                        showCorrect && styles.correctText,
                        showIncorrect && styles.incorrectText,
                      ]}
                    >
                      {option}
                    </Text>
                    {showCorrect && (
                      <Text style={styles.feedbackIcon}>✓</Text>
                    )}
                    {showIncorrect && (
                      <Text style={styles.feedbackIcon}>✗</Text>
                    )}
                  </Card.Content>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text
              variant="titleLarge"
              style={[styles.feedbackText, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}
            >
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </Text>
          </View>
        )}
      </View>
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
    paddingTop: 50,
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
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: '#6200ee',
  },
  questionLabel: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  questionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    elevation: 2,
    backgroundColor: '#fff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionText: {
    fontWeight: '500',
  },
  correctCard: {
    backgroundColor: '#4caf50',
  },
  incorrectCard: {
    backgroundColor: '#f44336',
  },
  correctText: {
    color: '#fff',
  },
  incorrectText: {
    color: '#fff',
  },
  feedbackIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  feedbackText: {
    fontWeight: 'bold',
  },
  correctFeedback: {
    color: '#4caf50',
  },
  incorrectFeedback: {
    color: '#f44336',
  },
});
