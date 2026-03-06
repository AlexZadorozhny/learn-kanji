import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, IconButton, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { usePracticeStore } from '../../store/practiceStore';
import { useKanjiStore } from '../../store/kanjiStore';

type ResultsScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'ResultsScreen'
>;
type ResultsScreenRouteProp = RouteProp<PracticeStackParamList, 'ResultsScreen'>;

export default function ResultsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { currentSession } = usePracticeStore();
  const { kanjiData } = useKanjiStore();

  if (!currentSession) {
    return null;
  }

  const results = currentSession.results;
  const correctCount = results.filter((r) => r.correct).length;
  const totalCount = results.length;
  const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const avgTime = totalCount > 0 ? totalTime / totalCount : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => navigation.navigate('PracticeModeScreen')}
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Session Complete!
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.emoji}>
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
          </Text>
          <Text variant="headlineSmall" style={styles.statsTitle}>
            Great work!
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                {correctCount}/{totalCount}
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Correct
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                {accuracy.toFixed(0)}%
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Accuracy
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                {avgTime.toFixed(0)}s
              </Text>
              <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Avg Time
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Card Review
          </Text>

          {results.map((result, index) => {
            const kanji = kanjiData.find((k) => k.id === result.kanjiId);
            if (!kanji) return null;

            return (
              <View key={index} style={[styles.resultRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                <View style={[styles.resultIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.resultKanji}>{kanji.character}</Text>
                </View>
                <View style={styles.resultDetails}>
                  <Text variant="bodyLarge">{kanji.meanings[0]}</Text>
                  <Text variant="bodySmall" style={[styles.resultTime, { color: theme.colors.onSurfaceVariant }]}>
                    {result.timeSpent}s
                  </Text>
                </View>
                <IconButton
                  icon={result.correct ? 'check-circle' : 'close-circle'}
                  iconColor={result.correct ? '#4caf50' : '#f44336'}
                  size={24}
                />
              </View>
            );
          })}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('FlashcardScreen', {})}
          style={styles.button}
          icon="refresh"
        >
          Practice Again
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('PracticeModeScreen')}
          style={styles.button}
        >
          Back to Practice
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
    paddingTop: 50, // Account for status bar
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultKanji: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultDetails: {
    flex: 1,
  },
  resultTime: {
    marginTop: 2,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
