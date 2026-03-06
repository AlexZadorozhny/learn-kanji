import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useKanjiStore } from '../../store/kanjiStore';
import { HomeStackParamList } from '../../navigation/types';
import { typography } from '../../theme/theme';

type KanjiDetailRouteProp = RouteProp<HomeStackParamList, 'KanjiDetail'>;

export default function KanjiDetailScreen() {
  const route = useRoute<KanjiDetailRouteProp>();
  const { kanjiId } = route.params;
  const { getKanjiById } = useKanjiStore();

  const kanji = getKanjiById(kanjiId);

  if (!kanji) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge">Kanji not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Main Kanji Display */}
      <Card style={styles.card}>
        <Card.Content style={styles.mainContent}>
          <Text style={styles.character}>{kanji.character}</Text>
          <View style={styles.metaInfo}>
            <Chip icon="pound" style={styles.chip}>
              {kanji.strokes} strokes
            </Chip>
            {kanji.jlptLevel && (
              <Chip icon="school" style={styles.chip}>
                JLPT N{kanji.jlptLevel}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Meanings */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Meanings
          </Text>
          <View style={styles.meaningContainer}>
            {kanji.meanings.map((meaning, index) => (
              <Chip key={index} style={styles.meaningChip}>
                {meaning}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* On-yomi Readings */}
      {kanji.onYomi.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              On-yomi (音読み)
            </Text>
            <Text variant="bodySmall" style={styles.helpText}>
              Chinese reading
            </Text>
            {kanji.onYomi.map((reading, index) => (
              <View key={index} style={styles.readingRow}>
                <Text style={styles.readingText}>{reading.reading}</Text>
                <Text style={styles.romajiText}>({reading.romaji})</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Kun-yomi Readings */}
      {kanji.kunYomi.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Kun-yomi (訓読み)
            </Text>
            <Text variant="bodySmall" style={styles.helpText}>
              Japanese reading
            </Text>
            {kanji.kunYomi.map((reading, index) => (
              <View key={index} style={styles.readingRow}>
                <Text style={styles.readingText}>{reading.reading}</Text>
                <Text style={styles.romajiText}>({reading.romaji})</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Example Words */}
      {kanji.exampleWords.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Example Words
            </Text>
            {kanji.exampleWords.map((word, index) => (
              <View key={index}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.wordRow}>
                  <Text style={styles.wordText}>{word.word}</Text>
                  <Text style={styles.wordReading}>{word.reading}</Text>
                  <Text style={styles.wordRomaji}>({word.romaji})</Text>
                  <Text style={styles.wordMeaning}>{word.meaning}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  mainContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  character: {
    fontSize: typography.kanji.large,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    color: '#666',
    marginBottom: 12,
  },
  meaningContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  meaningChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  readingText: {
    fontSize: 20,
    fontWeight: '500',
    marginRight: 8,
  },
  romajiText: {
    fontSize: 16,
    color: '#666',
  },
  wordRow: {
    paddingVertical: 12,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 4,
  },
  wordReading: {
    fontSize: 16,
    color: '#444',
    marginBottom: 2,
  },
  wordRomaji: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  wordMeaning: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    marginVertical: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
