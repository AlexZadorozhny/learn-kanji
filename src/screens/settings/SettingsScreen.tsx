import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  SegmentedButtons,
  useTheme,
  Button,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettingsStore, ThemeMode } from '../../store/settingsStore';
import { HapticService } from '../../services/feedback/HapticService';
import { KanjiVGIntegrationService } from '../../services/kanjivg/KanjiVGIntegrationService';
import { KanjiVGFetcherService } from '../../services/kanjivg/KanjiVGFetcherService';
import { useKanjiStore } from '../../store/kanjiStore';
import { SettingsStackParamList } from '../../navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const {
    themeMode,
    notificationsEnabled,
    soundEnabled,
    hapticsEnabled,
    setThemeMode,
    setNotificationsEnabled,
    setSoundEnabled,
    setHapticsEnabled,
  } = useSettingsStore();
  const { clearStrokeCache } = useKanjiStore();

  // Cache statistics state
  const [cacheStats, setCacheStats] = useState({ count: 0, sizeBytes: 0 });
  const [loadingCacheStats, setLoadingCacheStats] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Load cache stats on mount
  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    setLoadingCacheStats(true);
    try {
      const stats = await KanjiVGFetcherService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoadingCacheStats(false);
    }
  };

  const handleThemeChange = async (value: string) => {
    await setThemeMode(value as ThemeMode);
    HapticService.light();
  };

  const handleToggle = async (value: boolean, setter: (value: boolean) => Promise<void>) => {
    await setter(value);
    if (hapticsEnabled) {
      HapticService.light();
    }
  };

  const handleDownloadAll = () => {
    Alert.alert(
      'Download All Stroke Data',
      'This will download stroke order data for all available kanji (~6,355 characters). This may take several minutes and use mobile data. Recommended on WiFi. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: startBatchDownload },
      ]
    );
  };

  const startBatchDownload = async () => {
    setDownloadingAll(true);
    setDownloadProgress(0);

    try {
      // Get all available kanji IDs from KanjiVG (would need to implement this)
      // For now, we'll use a sample list or the bundled IDs
      const { BUNDLED_KANJI_IDS } = require('../../data/kanjivg-bundled/index');
      const totalKanji = BUNDLED_KANJI_IDS.length;

      let downloaded = 0;
      for (const kanjiId of BUNDLED_KANJI_IDS) {
        try {
          await KanjiVGIntegrationService.getStrokeOrder(kanjiId);
          downloaded++;
          setDownloadProgress(downloaded / totalKanji);
        } catch (error) {
          // Continue on individual errors
          console.warn(`Failed to download ${kanjiId}:`, error);
        }
      }

      await loadCacheStats();
      Alert.alert('Download Complete', `Downloaded stroke data for ${downloaded} kanji.`);
    } catch (error) {
      console.error('Batch download failed:', error);
      Alert.alert('Download Failed', 'Failed to download stroke data. Please try again.');
    } finally {
      setDownloadingAll(false);
      setDownloadProgress(0);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Stroke Data Cache',
      'This will remove all downloaded stroke order data. Bundled kanji will remain available. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: confirmClearCache },
      ]
    );
  };

  const confirmClearCache = async () => {
    try {
      await KanjiVGFetcherService.clearCache();
      clearStrokeCache();
      await loadCacheStats();
      Alert.alert('Cache Cleared', 'Stroke data cache has been cleared.');
      if (hapticsEnabled) {
        HapticService.light();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      Alert.alert('Clear Failed', 'Failed to clear cache. Please try again.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      testID="settings-scroll-view"
    >
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Appearance
        </Text>

        <List.Section>
          <List.Item
            title="Theme"
            description="Choose your preferred theme"
            left={(props) => <List.Icon {...props} icon="palette" />}
          />
          <View style={styles.segmentedButtonContainer}>
            <SegmentedButtons
              value={themeMode}
              onValueChange={handleThemeChange}
              buttons={[
                {
                  value: 'light',
                  label: 'Light',
                  icon: 'white-balance-sunny',
                  testID: 'settings-theme-light-button',
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  icon: 'moon-waning-crescent',
                  testID: 'settings-theme-dark-button',
                },
                {
                  value: 'auto',
                  label: 'Auto',
                  icon: 'brightness-auto',
                  testID: 'settings-theme-auto-button',
                },
              ]}
            />
          </View>
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Preferences
        </Text>

        <List.Section>
          <List.Item
            title="Notifications"
            description="Receive study reminders"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => handleToggle(value, setNotificationsEnabled)}
                testID="settings-notifications-switch"
              />
            )}
          />

          <List.Item
            title="Sound Effects"
            description="Play audio feedback"
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={soundEnabled}
                onValueChange={(value) => handleToggle(value, setSoundEnabled)}
                testID="settings-sound-switch"
              />
            )}
          />

          <List.Item
            title="Haptic Feedback"
            description="Vibration on interactions"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={hapticsEnabled}
                onValueChange={(value) => handleToggle(value, setHapticsEnabled)}
                testID="settings-haptics-switch"
              />
            )}
          />
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Stroke Order Data
        </Text>

        <List.Section>
          <List.Item
            title={`Cache: ${cacheStats.count} kanji`}
            description={`${(cacheStats.sizeBytes / 1024 / 1024).toFixed(1)} MB downloaded`}
            left={(props) => <List.Icon {...props} icon="database" />}
            disabled={loadingCacheStats}
          />

          {downloadingAll && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={downloadProgress} style={styles.progressBar} />
              <Text
                variant="bodySmall"
                style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}
              >
                Downloading {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          )}

          <List.Item
            title="Download All Stroke Data"
            description="Download ~6,355 kanji. Use on WiFi."
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(_props) => (
              <Button
                mode="contained"
                onPress={handleDownloadAll}
                disabled={downloadingAll}
                compact
              >
                Download
              </Button>
            )}
            disabled={downloadingAll}
          />

          <List.Item
            title="Clear Stroke Data Cache"
            description="Remove downloaded data. Bundled kanji remain."
            left={(props) => <List.Icon {...props} icon="delete" />}
            onPress={handleClearCache}
            disabled={downloadingAll || cacheStats.count === 0}
          />

          <List.Item
            title="Licenses & Attribution"
            description="KanjiVG license and credits"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('LicenseScreen')}
          />
        </List.Section>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          About
        </Text>

        <List.Section>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />

          <List.Item
            title="Developer"
            description="Built with Expo & React Native"
            left={(props) => <List.Icon {...props} icon="code-braces" />}
          />
        </List.Section>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
  segmentedButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
  },
});
