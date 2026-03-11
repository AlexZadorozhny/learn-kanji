import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, IconButton, ProgressBar, useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import { usePracticeStore } from '../../store/practiceStore';
import StrokeOrderCanvas from '../../components/kanji/StrokeOrderCanvas';
import { PracticeResult } from '../../types/practice';
import { KanjiCharacter } from '../../types/kanji';

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
  const { currentSession, startSession, endSession, addResult, nextCard, getSessionProgress } =
    usePracticeStore();

  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [_correctStrokes, setCorrectStrokes] = useState(0);
  const [_totalStrokes, setTotalStrokes] = useState(0);
  const [fromKanjiDetail, setFromKanjiDetail] = useState(false);
  const [detailKanjiId, setDetailKanjiId] = useState<string | undefined>();

  // Use refs to track stroke counts to avoid state timing issues
  const correctStrokesRef = useRef(0);
  const totalStrokesRef = useRef(0);

  // KanjiVG integration state
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionKanji, setSessionKanji] = useState<KanjiCharacter[]>([]);
  const [strokeDataError, setStrokeDataError] = useState<string | null>(null);
  const loadStrokeOrderBatch = useKanjiStore((state) => state.loadStrokeOrderBatch);
  const loadStrokeOrder = useKanjiStore((state) => state.loadStrokeOrder);

  useEffect(() => {
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.sessionKey]);

  const initializeSession = async () => {
    setLoadingSession(true);
    setStrokeDataError(null);

    // Reset session state for new practice session
    setSessionStartTime(Date.now());
    setCorrectStrokes(0);
    setTotalStrokes(0);
    correctStrokesRef.current = 0;
    totalStrokesRef.current = 0;

    try {
      // Get kanji IDs from route params or use all available kanji
      let kanjiIds = route.params?.kanjiIds;

      // Check if this is from KanjiDetailScreen - use explicit params if provided
      const explicitFromKanjiDetail = route.params?.fromKanjiDetail;
      const explicitDetailKanjiId = route.params?.detailKanjiId;

      if (explicitFromKanjiDetail !== undefined) {
        // Use explicitly passed params
        setFromKanjiDetail(explicitFromKanjiDetail);
        setDetailKanjiId(explicitDetailKanjiId);
      } else if (kanjiIds && kanjiIds.length === 1) {
        // Infer from single kanji in array (backward compatibility)
        setFromKanjiDetail(true);
        setDetailKanjiId(kanjiIds[0]);
      } else {
        setFromKanjiDetail(false);
        setDetailKanjiId(undefined);
      }

      if (!kanjiIds || kanjiIds.length === 0) {
        // Use all available kanji (KanjiVG provides much more coverage)
        // Shuffle and take up to 5 kanji per session
        const allKanjiIds = kanjiData.map((k) => k.id);
        const shuffled = [...allKanjiIds].sort(() => Math.random() - 0.5);
        kanjiIds = shuffled.slice(0, Math.min(5, shuffled.length));
      }

      if (kanjiIds.length === 0) {
        setStrokeDataError('No kanji available for practice');
        setLoadingSession(false);
        return;
      }

      // Load stroke data for all selected kanji using KanjiVG
      await loadStrokeOrderBatch(kanjiIds);

      // Filter kanji that successfully loaded stroke data
      const kanjiWithData: KanjiCharacter[] = [];
      for (const id of kanjiIds) {
        const kanji = kanjiData.find((k) => k.id === id);
        if (kanji) {
          const strokeData = await loadStrokeOrder(id);
          if (strokeData && strokeData.length > 0) {
            // Create enhanced kanji with KanjiVG stroke data
            const enhancedKanji = {
              ...kanji,
              strokeOrder: strokeData,
            };
            kanjiWithData.push(enhancedKanji);
          } else {
            console.warn(`Skipped ${kanji.character} (${id}) - no stroke data loaded`);
          }
        }
      }

      if (kanjiWithData.length === 0) {
        setStrokeDataError('Could not load stroke order data. Check your internet connection.');
        setLoadingSession(false);
        return;
      }

      // Set session kanji
      setSessionKanji(kanjiWithData);

      // Start practice session
      const sessionKanjiIds = kanjiWithData.map((k) => k.id);
      startSession('writing', sessionKanjiIds);

      setLoadingSession(false);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setStrokeDataError('Failed to load stroke data. Please try again.');
      setLoadingSession(false);
    }
  };

  const handleStrokeComplete = (correct: boolean) => {
    // Update refs immediately (synchronous)
    totalStrokesRef.current += 1;
    if (correct) {
      correctStrokesRef.current += 1;
    }

    // Also update state for UI display (asynchronous)
    setTotalStrokes((prev) => prev + 1);
    if (correct) {
      setCorrectStrokes((prev) => prev + 1);
    }
  };

  const handleAllStrokesComplete = () => {
    if (!currentSession) {
      console.error('No current session');
      return;
    }

    const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Calculate accuracy for this kanji using refs (synchronous, not affected by state batching)
    const finalCorrectStrokes = correctStrokesRef.current;
    const finalTotalStrokes = totalStrokesRef.current;
    const accuracy = finalTotalStrokes > 0 ? (finalCorrectStrokes / finalTotalStrokes) * 100 : 0;
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
      // Reset stroke counters (both state and refs)
      setCorrectStrokes(0);
      setTotalStrokes(0);
      correctStrokesRef.current = 0;
      totalStrokesRef.current = 0;
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

      navigation.push('ResultsScreen', {
        sessionId: currentSession.id,
        returnTo: fromKanjiDetail ? 'KanjiDetail' : undefined,
        returnKanjiId: detailKanjiId,
      });
    }
  };

  // Loading state
  if (loadingSession) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Preparing stroke order practice...
        </Text>
      </View>
    );
  }

  // Error state
  if (strokeDataError) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="bodyLarge" style={styles.errorText}>
          {strokeDataError}
        </Text>
        <Button mode="contained" onPress={initializeSession} style={styles.retryButton}>
          Retry
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.retryButton}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!currentSession || sessionKanji.length === 0) {
    return null;
  }

  const progress = getSessionProgress();
  const currentKanjiId = currentSession.kanjiIds[currentSession.currentIndex];
  const currentKanji = sessionKanji.find((k) => k.id === currentKanjiId);

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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#f44336',
  },
  retryButton: {
    marginTop: 8,
    minWidth: 200,
  },
});
