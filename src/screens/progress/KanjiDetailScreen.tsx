import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider, IconButton, Button, useTheme } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useKanjiStore } from '../../store/kanjiStore';
import { HomeStackParamList, MainTabParamList } from '../../navigation/types';
import { typography } from '../../theme/theme';
import { TTSService } from '../../services/audio/TTSService';
import { KanjiTier } from '../../services/kanjivg/KanjiVGIntegrationService';

type KanjiDetailRouteProp = RouteProp<HomeStackParamList, 'KanjiDetail'>;

export default function KanjiDetailScreen() {
  const theme = useTheme();
  const route = useRoute<KanjiDetailRouteProp>();
  const { kanjiId } = route.params;
  const {
    getKanjiById,
    hasStrokeData: checkStrokeData,
    getStrokeDataTier,
    loadStrokeOrder,
  } = useKanjiStore();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [strokeDataAvailable, setStrokeDataAvailable] = useState(false);
  const [strokeDataTier, setStrokeDataTier] = useState<KanjiTier>('unavailable');
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const kanji = getKanjiById(kanjiId);

  const checkStrokeDataAvailability = useCallback(async () => {
    if (!kanji) return;

    try {
      const available = await checkStrokeData(kanji.id);
      const tier = await getStrokeDataTier(kanji.id);

      setStrokeDataAvailable(available);
      setStrokeDataTier(tier);

      // Prefetch in background if not bundled (non-blocking)
      if (tier !== 'bundled' && available) {
        loadStrokeOrder(kanji.id).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to check stroke data availability:', error);
    }
  }, [kanji, checkStrokeData, getStrokeDataTier, loadStrokeOrder]);

  useEffect(() => {
    checkStrokeDataAvailability();
  }, [checkStrokeDataAvailability]);

  const handleSpeak = async (text: string, id: string) => {
    try {
      setSpeakingId(id);
      await TTSService.speak(text);
      setSpeakingId(null);
    } catch (error) {
      console.error('Failed to speak:', error);
      setSpeakingId(null);
    }
  };

  const handleStrokePractice = () => {
    tabNavigation.navigate('Practice', {
      screen: 'StrokeOrderScreen',
      params: {
        kanjiIds: [kanji.id],
        sessionKey: Date.now(),
        fromKanjiDetail: true,
        detailKanjiId: kanji.id,
      },
    });
  };

  if (!kanji) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Kanji not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="kanji-detail-scroll-view"
    >
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
            {/* Stroke data availability indicator */}
            {strokeDataTier === 'bundled' && (
              <Chip icon="lightning-bolt" mode="flat" style={styles.chip}>
                Instant Access
              </Chip>
            )}
            {strokeDataTier === 'cached' && (
              <Chip icon="check-circle" mode="flat" style={styles.chip}>
                Downloaded
              </Chip>
            )}
            {strokeDataTier === 'available' && (
              <Chip icon="cloud-download" mode="outlined" style={styles.chip}>
                Available Online
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Practice Modes */}
      {strokeDataAvailable && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Practice
            </Text>
            <Button
              mode="contained"
              icon="draw"
              onPress={handleStrokePractice}
              style={styles.practiceButton}
              testID="kanji-detail-practice-stroke-button"
            >
              Practice Stroke Order
            </Button>
          </Card.Content>
        </Card>
      )}

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
            <Text
              variant="bodySmall"
              style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
            >
              Chinese reading
            </Text>
            {kanji.onYomi.map((reading, index) => (
              <View key={index} style={styles.readingRow}>
                <Text style={styles.readingText}>{reading.reading}</Text>
                <Text style={[styles.romajiText, { color: theme.colors.onSurfaceVariant }]}>
                  ({reading.romaji})
                </Text>
                <IconButton
                  icon={speakingId === `on-${index}` ? 'stop' : 'volume-high'}
                  size={20}
                  onPress={() => handleSpeak(reading.reading, `on-${index}`)}
                  style={styles.speakerButton}
                />
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
            <Text
              variant="bodySmall"
              style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
            >
              Japanese reading
            </Text>
            {kanji.kunYomi.map((reading, index) => (
              <View key={index} style={styles.readingRow}>
                <Text style={styles.readingText}>{reading.reading}</Text>
                <Text style={[styles.romajiText, { color: theme.colors.onSurfaceVariant }]}>
                  ({reading.romaji})
                </Text>
                <IconButton
                  icon={speakingId === `kun-${index}` ? 'stop' : 'volume-high'}
                  size={20}
                  onPress={() => handleSpeak(reading.reading, `kun-${index}`)}
                  style={styles.speakerButton}
                />
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
                  <View style={styles.wordHeader}>
                    <Text style={styles.wordText}>{word.word}</Text>
                    <IconButton
                      icon={speakingId === `word-${index}` ? 'stop' : 'volume-high'}
                      size={20}
                      onPress={() => handleSpeak(word.word, `word-${index}`)}
                      style={styles.speakerButton}
                    />
                  </View>
                  <Text style={[styles.wordReading, { color: theme.colors.onSurface }]}>
                    {word.reading}
                  </Text>
                  <Text style={[styles.wordRomaji, { color: theme.colors.onSurfaceVariant }]}>
                    ({word.romaji})
                  </Text>
                  <Text style={[styles.wordMeaning, { color: theme.colors.onSurface }]}>
                    {word.meaning}
                  </Text>
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
    flexWrap: 'wrap',
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
    flex: 1,
  },
  speakerButton: {
    margin: 0,
  },
  wordRow: {
    paddingVertical: 12,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 4,
    flex: 1,
  },
  wordReading: {
    fontSize: 16,
    marginBottom: 2,
  },
  wordRomaji: {
    fontSize: 14,
    marginBottom: 4,
  },
  wordMeaning: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
  },
  practiceButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
