import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useProgressStore } from '../../store/progressStore';

export default function ProgressScreen() {
  const { studyStats, kanjiProgress, isLoaded, clearProgress } = useProgressStore();

  const totalKanjiWithProgress = Object.keys(kanjiProgress).length;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Your Progress
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {isLoaded ? 'Data loaded from storage' : 'Loading...'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Study Statistics
          </Text>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Total Kanji Studied:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {studyStats.totalKanjiStudied}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Kanji Mastered:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {studyStats.kanjiMastered}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Study Time:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {studyStats.totalStudyTimeMinutes} min
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Current Streak:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {studyStats.currentStreak} days
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Longest Streak:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {studyStats.longestStreak} days
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Kanji with Progress:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {totalKanjiWithProgress}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Storage Test
          </Text>
          <Text variant="bodySmall" style={styles.helpText}>
            Progress is automatically saved. Clear data to reset your progress.
          </Text>
          <Button
            mode="outlined"
            onPress={clearProgress}
            style={styles.clearButton}
            icon="delete"
          >
            Clear All Progress
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  helpText: {
    color: '#666',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  clearButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
