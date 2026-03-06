import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';
import { useProgressStore } from '../../store/progressStore';
import { SRSService } from '../../services/practice/SRSService';
import { useKanjiStore } from '../../store/kanjiStore';

type PracticeModeScreenNavigationProp = NativeStackNavigationProp<
  PracticeStackParamList,
  'PracticeModeScreen'
>;

export default function PracticeModeScreen() {
  const navigation = useNavigation<PracticeModeScreenNavigationProp>();
  const { kanjiProgress } = useProgressStore();
  const { kanjiData } = useKanjiStore();

  // Calculate review stats
  const dueKanji = SRSService.getDueKanji(kanjiProgress);
  const allKanjiIds = kanjiData.map((k) => k.id);
  const newKanji = SRSService.getNewKanji(allKanjiIds, kanjiProgress, 5);
  const availableCards = dueKanji.length + newKanji.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Practice Modes
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose how you want to practice
        </Text>
      </View>

      {availableCards > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              📚 Cards Ready
            </Text>
            <Text variant="bodyLarge">
              {dueKanji.length} due for review • {newKanji.length} new
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.modeTitle}>
            🎴 Flashcards
          </Text>
          <Text variant="bodyMedium" style={styles.modeDescription}>
            Test your recognition with spaced repetition. See the kanji, recall the meaning
            and reading, then rate your confidence.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('FlashcardScreen', {})}
            style={styles.button}
            disabled={availableCards === 0}
          >
            {availableCards > 0 ? `Start (${availableCards} cards)` : 'No cards available'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.disabledCard]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.modeTitle}>
            ✍️ Stroke Order
          </Text>
          <Text variant="bodyMedium" style={styles.modeDescription}>
            Practice writing kanji with correct stroke order. Draw each stroke and get
            instant feedback.
          </Text>
          <Button mode="outlined" disabled style={styles.button}>
            Coming Soon
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.disabledCard]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.modeTitle}>
            ❓ Multiple Choice
          </Text>
          <Text variant="bodyMedium" style={styles.modeDescription}>
            Test your knowledge with quiz questions. Choose the correct meaning, reading, or
            kanji from multiple options.
          </Text>
          <Button mode="outlined" disabled style={styles.button}>
            Coming Soon
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.disabledCard]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.modeTitle}>
            📚 Context Practice
          </Text>
          <Text variant="bodyMedium" style={styles.modeDescription}>
            Learn kanji in real words and phrases. See how kanji are used in Japanese
            language.
          </Text>
          <Button mode="outlined" disabled style={styles.button}>
            Coming Soon
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
    elevation: 2,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  modeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modeDescription: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
