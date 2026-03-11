import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

interface StrokeProgressIndicatorProps {
  totalStrokes: number;
  currentStrokeIndex: number;
  strokePaths: string[];
}

/**
 * Component that displays a horizontal progress bar showing all strokes:
 * - Completed strokes: shown with green checkmark
 * - Current stroke: shown with blue pulsing border
 * - Future strokes: shown as gray outlines
 */
export default function StrokeProgressIndicator({
  totalStrokes,
  currentStrokeIndex,
  strokePaths,
}: StrokeProgressIndicatorProps) {
  const theme = useTheme();

  if (totalStrokes === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: totalStrokes }).map((_, index) => {
        const isCompleted = index < currentStrokeIndex;
        const isCurrent = index === currentStrokeIndex;
        const isFuture = index > currentStrokeIndex;

        const strokePath = strokePaths[index] || '';

        return (
          <View
            key={index}
            style={[
              styles.strokeThumbnail,
              {
                borderColor: isCurrent ? theme.colors.primary : theme.colors.outline,
                backgroundColor: theme.colors.surface,
              },
              isCurrent && styles.currentStroke,
            ]}
          >
            {/* Render miniature stroke */}
            {strokePath && (
              <Svg width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
                <Path
                  d={strokePath}
                  stroke={
                    isCompleted
                      ? '#4caf50' // Green for completed
                      : isCurrent
                        ? theme.colors.primary // Blue for current
                        : theme.colors.outlineVariant // Gray for future
                  }
                  strokeWidth={isCompleted ? 4 : isCurrent ? 3 : 2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isFuture ? 0.4 : 1}
                />
              </Svg>
            )}

            {/* Green checkmark overlay for completed strokes */}
            {isCompleted && (
              <View style={styles.checkmarkOverlay}>
                <Svg width="12" height="12" viewBox="0 0 24 24">
                  <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#4caf50" />
                </Svg>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  strokeThumbnail: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  currentStroke: {
    borderWidth: 2,
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
