import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import Svg, { Path, G } from 'react-native-svg';
import { KanjiCharacter } from '../../types/kanji';
import { HapticService } from '../../services/feedback/HapticService';
import StrokeDirectionIndicator from './StrokeDirectionIndicator';
import StrokeProgressIndicator from './StrokeProgressIndicator';
import { AdvancedStrokeValidator } from '../../services/validation/AdvancedStrokeValidator';
import { PerformanceMonitor } from '../../services/validation/PerformanceMonitor';
import { ValidationConfig } from '../../services/validation/ValidationConfig';

interface Point {
  x: number;
  y: number;
}

interface UserStroke {
  points: Point[];
}

interface StrokeOrderCanvasProps {
  kanji: KanjiCharacter;
  onStrokeComplete: (correct: boolean) => void;
  onAllStrokesComplete: () => void;
}

export default function StrokeOrderCanvas({
  kanji,
  onStrokeComplete,
  onAllStrokesComplete,
}: StrokeOrderCanvasProps) {
  const theme = useTheme();
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [incorrectStroke, setIncorrectStroke] = useState<Point[] | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showSuccessGlow, setShowSuccessGlow] = useState<boolean>(false);
  const [strokeAttempts, setStrokeAttempts] = useState<Record<number, number>>({});
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentDrawingRef = useRef<Point[]>([]); // Ref to track points synchronously
  const currentStrokeIndexRef = useRef<number>(0); // Ref to track stroke index synchronously

  const canvasSize = 300;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false, // Don't let other views take over

      onPanResponderGrant: (evt) => {
        console.log('Touch started!', evt.nativeEvent);
        // Clear any incorrect stroke when starting a new one
        setIncorrectStroke(null);
        setFeedbackMessage('');

        const { locationX, locationY } = evt.nativeEvent;
        // Scale to SVG viewBox coordinates (0-100)
        const scaledX = (locationX / canvasSize) * 100;
        const scaledY = (locationY / canvasSize) * 100;
        console.log('Scaled coords:', scaledX, scaledY);

        // Update both state and ref
        const newPoint = { x: scaledX, y: scaledY };
        currentDrawingRef.current = [newPoint];
        setCurrentDrawing([newPoint]);
      },

      onPanResponderMove: (evt) => {
        console.log('Move detected!');
        const { locationX, locationY } = evt.nativeEvent;
        // Scale to SVG viewBox coordinates (0-100)
        const scaledX = (locationX / canvasSize) * 100;
        const scaledY = (locationY / canvasSize) * 100;

        // Update ref immediately (synchronous)
        const newPoint = { x: scaledX, y: scaledY };
        currentDrawingRef.current = [...currentDrawingRef.current, newPoint];
        console.log('Adding point, total points in ref:', currentDrawingRef.current.length);

        // Update state for rendering
        setCurrentDrawing((prev) => [...prev, newPoint]);
      },

      onPanResponderRelease: () => {
        // Read from ref (synchronous) not state
        const drawnPoints = [...currentDrawingRef.current];
        console.log('Touch ended, points from ref:', drawnPoints.length);

        if (drawnPoints.length < 2) {
          console.log('Not enough points, clearing');
          currentDrawingRef.current = [];
          setCurrentDrawing([]);
          return;
        }

        // Clear any existing timeout
        if (clearTimeoutRef.current) {
          clearTimeout(clearTimeoutRef.current);
        }

        // Validate the stroke (use ref for current index)
        const strokeIndex = currentStrokeIndexRef.current;
        console.log('Using stroke index from ref:', strokeIndex);
        const isCorrect = validateStroke(drawnPoints, strokeIndex);
        console.log('Validation result:', isCorrect);

        if (isCorrect) {
          console.log('✓ Correct stroke!');
          HapticService.success();

          // Add to completed strokes
          const newUserStrokes = [...userStrokes, { points: drawnPoints }];
          setUserStrokes(newUserStrokes);

          // Clear current drawing (both state and ref)
          currentDrawingRef.current = [];
          setCurrentDrawing([]);

          // Show success feedback with green glow
          setFeedbackMessage('✓ Correct!');
          setShowSuccessGlow(true);
          setTimeout(() => setShowSuccessGlow(false), 500);

          onStrokeComplete(true);

          // Move to next stroke or complete
          const nextIndex = strokeIndex + 1;
          console.log(`nextIndex: ${nextIndex}, strokeOrder.length: ${kanji.strokeOrder?.length}, kanji.strokes: ${kanji.strokes}`);

          // Use strokeOrder.length (actual data) instead of kanji.strokes (metadata)
          if (nextIndex < (kanji.strokeOrder?.length || 0)) {
            currentStrokeIndexRef.current = nextIndex;
            setCurrentStrokeIndex(nextIndex);
            console.log('Moving to stroke index:', nextIndex);
            // Clear feedback after a moment
            setTimeout(() => {
              setFeedbackMessage('');
            }, 500);
          } else {
            console.log('All strokes complete!');
            setTimeout(() => {
              onAllStrokesComplete();
            }, 500);
          }
        } else {
          console.log('✗ Incorrect stroke - SHOWING IN RED for 2 seconds');
          console.log('Incorrect stroke points:', drawnPoints.length);
          HapticService.warning();

          // Move drawn stroke to incorrectStroke state
          setIncorrectStroke(drawnPoints);
          console.log('Set incorrectStroke state with', drawnPoints.length, 'points');

          // Clear current drawing (both state and ref)
          currentDrawingRef.current = [];
          setCurrentDrawing([]);

          // Show error feedback
          setFeedbackMessage('✗ Try again');

          onStrokeComplete(false);

          // Keep the incorrect stroke visible for 2 seconds
          console.log('Setting timeout to clear incorrect stroke in 2 seconds');
          clearTimeoutRef.current = setTimeout(() => {
            console.log('NOW clearing incorrect stroke after 2 seconds');
            setIncorrectStroke(null);
            setFeedbackMessage('');
          }, 2000);
        }
      },
    })
  ).current;

  const validateStroke = (points: Point[], strokeIndex: number): boolean => {
    console.log('=== Validating stroke (Advanced) ===');
    console.log('Stroke index:', strokeIndex);
    console.log('Total points drawn:', points.length);
    console.log('Kanji:', kanji.character, '| strokeOrder.length:', kanji.strokeOrder?.length, '| kanji.strokes metadata:', kanji.strokes);

    if (!kanji.strokeOrder || strokeIndex >= kanji.strokeOrder.length) {
      console.error('❌ VALIDATION ERROR: No stroke order data or invalid index!');
      console.error('  strokeOrder exists:', !!kanji.strokeOrder);
      console.error('  strokeOrder.length:', kanji.strokeOrder?.length);
      console.error('  strokeIndex:', strokeIndex);
      console.error('  kanji.strokes:', kanji.strokes);
      return false;
    }

    const targetStroke = kanji.strokeOrder[strokeIndex];
    console.log('Target stroke path:', targetStroke.path);

    // Convert user points to SVG path
    const userPath = convertUserStrokeToPath(points);
    console.log('User path:', userPath);

    // Get current attempt count for this stroke
    const attemptCount = (strokeAttempts[strokeIndex] || 0) + 1;

    // Start performance monitoring
    const startTime = Date.now();

    // Use advanced validation with adaptive thresholds
    const result = AdvancedStrokeValidator.validate(
      userPath,
      targetStroke.path,
      kanji.strokes,
      attemptCount
    );

    // End performance monitoring
    const validationTime = Date.now() - startTime;

    console.log('Validation result:', result);
    console.log(`Validation time: ${validationTime}ms`);
    console.log(`Accuracy: ${result.accuracy}%`);

    // Determine stroke type for performance tracking
    const strokeType = ValidationConfig.shouldUseFrechetDistance(
      kanji.strokeOrder
        .slice(strokeIndex, strokeIndex + 1)
        .map((s) => s.path)
    )
      ? 'curved'
      : 'straight';

    // Record performance metrics
    PerformanceMonitor.recordValidation(
      strokeType,
      validationTime,
      result.accuracy,
      result.valid,
      kanji.strokes,
      strokeType === 'curved'
    );

    // Log performance stats in dev mode (every 10 validations)
    if (__DEV__ && PerformanceMonitor.getStats().totalValidations % 10 === 0) {
      console.log(PerformanceMonitor.getPerformanceReport());
    }

    // Update feedback message based on validation
    if (!result.valid && result.reason) {
      setFeedbackMessage(`✗ ${result.reason} (${result.accuracy}% match)`);
    } else if (result.valid) {
      setFeedbackMessage(`✓ Correct! (${result.accuracy}% match)`);
    }

    // Update attempt count
    setStrokeAttempts((prev) => ({
      ...prev,
      [strokeIndex]: attemptCount,
    }));

    return result.valid;
  };

  const handleUndo = () => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    setIncorrectStroke(null);
    setFeedbackMessage('');
    currentDrawingRef.current = [];

    if (userStrokes.length > 0) {
      const newUserStrokes = userStrokes.slice(0, -1);
      setUserStrokes(newUserStrokes);
      const newIndex = Math.max(0, currentStrokeIndex - 1);
      currentStrokeIndexRef.current = newIndex;
      setCurrentStrokeIndex(newIndex);
      HapticService.light();
    }
  };

  const handleClear = () => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    setUserStrokes([]);
    setCurrentDrawing([]);
    setIncorrectStroke(null);
    setFeedbackMessage('');
    setCurrentStrokeIndex(0);
    setStrokeAttempts({}); // Reset attempt counts
    currentStrokeIndexRef.current = 0;
    currentDrawingRef.current = [];
    HapticService.medium();
  };

  const convertUserStrokeToPath = (points: Point[]): string => {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={[styles.kanjiText, { color: theme.colors.primary }]}>
          {kanji.character}
        </Text>
        <View style={styles.controls}>
          <IconButton
            icon={showGuide ? 'eye' : 'eye-off'}
            size={24}
            onPress={() => setShowGuide(!showGuide)}
          />
          <IconButton
            icon="undo"
            size={24}
            onPress={handleUndo}
            disabled={userStrokes.length === 0}
          />
          <IconButton
            icon="refresh"
            size={24}
            onPress={handleClear}
          />
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <Text variant="titleMedium" style={styles.instruction}>
          Stroke {currentStrokeIndex + 1} of {kanji.strokes}
        </Text>
        {feedbackMessage && (
          <Text
            variant="titleLarge"
            style={[
              styles.feedbackText,
              feedbackMessage.includes('✓') ? styles.correctFeedback : styles.incorrectFeedback,
            ]}
          >
            {feedbackMessage}
          </Text>
        )}
      </View>

      <View style={[
        styles.canvasContainer,
        {
          width: canvasSize,
          height: canvasSize,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        }
      ]}>
        <Svg
          width={canvasSize}
          height={canvasSize}
          viewBox={`0 0 100 100`}
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
          pointerEvents="box-none"
        >
          {/* Background to show drawing area */}
          <Path
            d="M 0 0 L 100 0 L 100 100 L 0 100 Z"
            fill={theme.colors.surface}
            stroke={theme.colors.outline}
            strokeWidth="0.5"
          />
          {/* Show guide strokes */}
          {showGuide && kanji.strokeOrder && (
            <G>
              {/* Completed strokes in black */}
              {kanji.strokeOrder.slice(0, currentStrokeIndex).map((stroke, index) => (
                <Path
                  key={`guide-${index}`}
                  d={stroke.path}
                  stroke="#000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Current stroke in light gray */}
              {currentStrokeIndex < kanji.strokeOrder.length && (
                <Path
                  d={kanji.strokeOrder[currentStrokeIndex].path}
                  stroke="#ccc"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5,5"
                />
              )}
            </G>
          )}

          {/* Direction indicators for current stroke */}
          {showGuide && currentStrokeIndex < (kanji.strokeOrder?.length || 0) && (
            <StrokeDirectionIndicator
              strokePath={kanji.strokeOrder![currentStrokeIndex].path}
              visible={true}
            />
          )}

          {/* User's completed strokes */}
          {userStrokes.map((userStroke, index) => {
            const isLastStroke = index === userStrokes.length - 1;
            const shouldGlow = isLastStroke && showSuccessGlow;

            return (
              <Path
                key={`user-${index}`}
                d={convertUserStrokeToPath(userStroke.points)}
                stroke={shouldGlow ? "#4caf50" : "#6200ee"}
                strokeWidth={shouldGlow ? 4 : 3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={shouldGlow ? 1 : 0.9}
              />
            );
          })}

          {/* Current drawing stroke (while drawing) */}
          {currentDrawing.length > 0 && (
            <Path
              d={convertUserStrokeToPath(currentDrawing)}
              stroke="#6200ee"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Incorrect stroke (shown in red for 2 seconds) */}
          {incorrectStroke && incorrectStroke.length > 0 && (
            <Path
              d={convertUserStrokeToPath(incorrectStroke)}
              stroke="#f44336"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}
        </Svg>

        {/* Touch capture overlay - MUST be on top */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'transparent',
              zIndex: 10,
            },
          ]}
          {...panResponder.panHandlers}
          onTouchStart={() => console.log('Native touch started!')}
          onTouchMove={() => console.log('Native touch moved!')}
        />
      </View>

      {/* Stroke progress indicator */}
      {kanji.strokeOrder && (
        <StrokeProgressIndicator
          totalStrokes={kanji.strokes}
          currentStrokeIndex={currentStrokeIndex}
          strokePaths={kanji.strokeOrder.map(s => s.path)}
        />
      )}

      <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Draw the strokes in order. {showGuide ? 'Guide' : 'No guide'} mode.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  kanjiText: {
    fontSize: 48,
    fontWeight: 'bold',
    // color set dynamically
  },
  controls: {
    flexDirection: 'row',
  },
  instructionContainer: {
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 60,
  },
  instruction: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  correctFeedback: {
    color: '#4caf50',
  },
  incorrectFeedback: {
    color: '#f44336',
  },
  canvasContainer: {
    // backgroundColor set dynamically
    borderRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    // borderColor set dynamically
  },
  hint: {
    // color set dynamically
    textAlign: 'center',
  },
});
