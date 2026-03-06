import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Svg, { Path, G } from 'react-native-svg';
import { KanjiCharacter } from '../../types/kanji';
import { HapticService } from '../../services/feedback/HapticService';

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
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [incorrectStroke, setIncorrectStroke] = useState<Point[] | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
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

          // Show success feedback
          setFeedbackMessage('✓ Correct!');

          onStrokeComplete(true);

          // Move to next stroke or complete
          const nextIndex = strokeIndex + 1;
          if (nextIndex < kanji.strokes) {
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
    console.log('=== Validating stroke ===');
    console.log('Stroke index:', strokeIndex);
    console.log('Total points drawn:', points.length);

    if (!kanji.strokeOrder || strokeIndex >= kanji.strokeOrder.length) {
      console.log('No stroke order data or invalid index');
      return false;
    }

    const targetStroke = kanji.strokeOrder[strokeIndex];
    console.log('Target stroke path:', targetStroke.path);

    // Simple validation: check if most points are within a tolerance of the stroke path
    // For this simplified version, we'll use a generous bounding box approach

    // Parse the SVG path to get approximate bounding box
    const bbox = getStrokeBoundingBox(targetStroke.path);
    console.log('Bounding box:', bbox);

    // Check if at least 50% of user's points are within the bounding box (with tolerance)
    const tolerance = 25; // units in 0-100 coordinate system (increased)
    let pointsInside = 0;

    for (const point of points) {
      // Points are already in 0-100 coordinate system
      if (
        point.x >= bbox.minX - tolerance &&
        point.x <= bbox.maxX + tolerance &&
        point.y >= bbox.minY - tolerance &&
        point.y <= bbox.maxY + tolerance
      ) {
        pointsInside++;
      }
    }

    const percentInside = (pointsInside / points.length) * 100;
    console.log(`Points inside: ${pointsInside}/${points.length} (${percentInside.toFixed(1)}%)`);
    console.log('Required: 50%');

    return percentInside >= 50; // Lowered from 60% to 50%
  };

  const getStrokeBoundingBox = (pathData: string): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } => {
    // Parse simple SVG path (M x y L x y format)
    const numbers = pathData.match(/[\d.]+/g);
    if (!numbers || numbers.length < 4) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    const coords = numbers.map(Number);
    const xCoords = coords.filter((_, i) => i % 2 === 0);
    const yCoords = coords.filter((_, i) => i % 2 === 1);

    return {
      minX: Math.min(...xCoords),
      minY: Math.min(...yCoords),
      maxX: Math.max(...xCoords),
      maxY: Math.max(...yCoords),
    };
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
        <Text variant="headlineLarge" style={styles.kanjiText}>
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

      <View style={[styles.canvasContainer, { width: canvasSize, height: canvasSize }]}>
        <Svg
          width={canvasSize}
          height={canvasSize}
          viewBox={`0 0 100 100`}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {/* Background to show drawing area */}
          <Path
            d="M 0 0 L 100 0 L 100 100 L 0 100 Z"
            fill="#ffffff"
            stroke="#e0e0e0"
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

          {/* User's completed strokes */}
          {userStrokes.map((userStroke, index) => (
            <Path
              key={`user-${index}`}
              d={convertUserStrokeToPath(userStroke.points)}
              stroke="#6200ee"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

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
              zIndex: 1000,
            },
          ]}
          {...panResponder.panHandlers}
          onTouchStart={() => console.log('Native touch started!')}
          onTouchMove={() => console.log('Native touch moved!')}
        />
      </View>

      <Text variant="bodyMedium" style={styles.hint}>
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
    color: '#6200ee',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    color: '#666',
    textAlign: 'center',
  },
});
