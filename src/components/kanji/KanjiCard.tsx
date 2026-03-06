import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { KanjiCharacter } from '../../types/kanji';
import { typography } from '../../theme/theme';

interface KanjiCardProps {
  kanji: KanjiCharacter;
  onPress?: () => void;
}

export default function KanjiCard({ kanji, onPress }: KanjiCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.content}>
          <Text style={styles.character}>{kanji.character}</Text>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.meanings}>
              {kanji.meanings.join(', ')}
            </Text>
            <Text variant="bodySmall" style={styles.readings}>
              {kanji.onYomi.map(r => r.reading).join(', ')}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  character: {
    fontSize: typography.kanji.medium,
    fontWeight: 'bold',
    marginRight: 20,
    minWidth: 80,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  meanings: {
    marginBottom: 4,
  },
  readings: {
    color: '#666',
  },
});
