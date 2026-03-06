import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { KanjiCharacter } from '../../types/kanji';
import { TTSService } from '../../services/audio/TTSService';
import { HapticService } from '../../services/feedback/HapticService';

interface FlashcardComponentProps {
  kanji: KanjiCharacter;
  onRate: (rating: number) => void;
}

export default function FlashcardComponent({ kanji, onRate }: FlashcardComponentProps) {
  const theme = useTheme();
  const [showAnswer, setShowAnswer] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = showAnswer ? 0 : 180;

    // Strong haptic feedback on flip (double tap for "sound effect")
    HapticService.warning();
    setTimeout(() => HapticService.light(), 80);

    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setShowAnswer(!showAnswer);
  };

  const handleRate = (rating: number) => {
    // Context-aware haptic feedback based on rating
    if (rating === 1) {
      // Again - double warning feedback (error sound effect)
      HapticService.warning();
      setTimeout(() => HapticService.light(), 100);
    } else if (rating === 2) {
      // Hard - double medium feedback (more noticeable)
      HapticService.warning();
      setTimeout(() => HapticService.light(), 60);
    } else if (rating === 3) {
      // Good - success feedback with echo
      HapticService.success();
      setTimeout(() => HapticService.light(), 80);
    } else {
      // Easy - double success feedback
      HapticService.success();
      setTimeout(() => HapticService.medium(), 100);
    }

    onRate(rating);
  };

  const handleSpeak = async () => {
    if (speaking) return;

    try {
      setSpeaking(true);
      // Speak the first on-yomi reading if available, otherwise kun-yomi
      const reading = kanji.onYomi[0]?.reading || kanji.kunYomi[0]?.reading;
      if (reading) {
        await TTSService.speak(reading);
      }
    } catch (error) {
      console.error('Failed to speak:', error);
    } finally {
      setSpeaking(false);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const frontZIndex = flipAnimation.interpolate({
    inputRange: [0, 90, 91, 180],
    outputRange: [2, 2, 1, 1],
  });

  const backZIndex = flipAnimation.interpolate({
    inputRange: [0, 90, 91, 180],
    outputRange: [1, 1, 2, 2],
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFlip} style={styles.cardContainer}>
        {/* Front of card - show kanji */}
        <Animated.View
          style={[
            styles.cardSide,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
              zIndex: frontZIndex,
            },
          ]}
        >
          <Card style={[styles.innerCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.content}>
              <Text style={[styles.kanjiText, { color: theme.colors.primary }]}>{kanji.character}</Text>
              <Text variant="titleLarge" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                👆 Tap to reveal answer
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Back of card - show answer - only render after first interaction */}
        {showAnswer && (
          <Animated.View
            style={[
              styles.cardSide,
              {
                transform: [{ rotateY: backInterpolate }],
                opacity: backOpacity,
                zIndex: backZIndex,
              },
            ]}
          >
          <Card style={[styles.innerCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.content}>
              <View style={styles.answerHeader}>
                <Text style={[styles.kanjiTextSmall, { color: theme.colors.primary }]}>{kanji.character}</Text>
                <IconButton
                  icon={speaking ? 'stop' : 'volume-high'}
                  size={24}
                  onPress={handleSpeak}
                />
              </View>

              <Text variant="headlineSmall" style={styles.meanings}>
                {kanji.meanings.join(', ')}
              </Text>

              <View style={styles.readings}>
                <View style={styles.readingRow}>
                  <Text variant="labelSmall" style={styles.readingLabel}>
                    On-yomi:
                  </Text>
                  <Text variant="bodyMedium">
                    {kanji.onYomi.map((r) => r.reading).join(', ') || '-'}
                  </Text>
                </View>

                <View style={styles.readingRow}>
                  <Text variant="labelSmall" style={styles.readingLabel}>
                    Kun-yomi:
                  </Text>
                  <Text variant="bodyMedium">
                    {kanji.kunYomi.map((r) => r.reading).join(', ') || '-'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
        )}
      </Pressable>

      {showAnswer && (
        <View style={styles.ratingButtons}>
          <Pressable
            style={[styles.ratingButton, styles.ratingAgain]}
            onPress={() => handleRate(1)}
          >
            <Text style={styles.ratingButtonText}>Again</Text>
            <Text style={styles.ratingSubtext}>{'<1 day'}</Text>
          </Pressable>

          <Pressable
            style={[styles.ratingButton, styles.ratingHard]}
            onPress={() => handleRate(2)}
          >
            <Text style={styles.ratingButtonText}>Hard</Text>
            <Text style={styles.ratingSubtext}>{'<3 days'}</Text>
          </Pressable>

          <Pressable
            style={[styles.ratingButton, styles.ratingGood]}
            onPress={() => handleRate(3)}
          >
            <Text style={styles.ratingButtonText}>Good</Text>
            <Text style={styles.ratingSubtext}>{'~6 days'}</Text>
          </Pressable>

          <Pressable
            style={[styles.ratingButton, styles.ratingEasy]}
            onPress={() => handleRate(4)}
          >
            <Text style={styles.ratingButtonText}>Easy</Text>
            <Text style={styles.ratingSubtext}>{'2+ weeks'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    height: 400,
    marginBottom: 20,
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  innerCard: {
    width: '100%',
    height: '100%',
    elevation: 4,
    // backgroundColor set dynamically
  },
  content: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kanjiText: {
    fontSize: 120,
    fontWeight: 'bold',
    // color set dynamically
    marginBottom: 20,
  },
  kanjiTextSmall: {
    fontSize: 60,
    fontWeight: 'bold',
    // color set dynamically
  },
  hint: {
    // color set dynamically
    textAlign: 'center',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  meanings: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  readings: {
    width: '100%',
    gap: 8,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingLabel: {
    fontWeight: 'bold',
    minWidth: 70,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  ratingButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  ratingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  ratingSubtext: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  ratingAgain: {
    backgroundColor: '#f44336',
  },
  ratingHard: {
    backgroundColor: '#ff9800',
  },
  ratingGood: {
    backgroundColor: '#4caf50',
  },
  ratingEasy: {
    backgroundColor: '#2196f3',
  },
});
