import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Divider, SegmentedButtons, useTheme } from 'react-native-paper';
import { useSettingsStore, ThemeMode } from '../../store/settingsStore';
import { HapticService } from '../../services/feedback/HapticService';

export default function SettingsScreen() {
  const theme = useTheme();
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

  const handleThemeChange = async (value: string) => {
    await setThemeMode(value as ThemeMode);
    HapticService.light();
  };

  const handleToggle = async (
    value: boolean,
    setter: (value: boolean) => Promise<void>
  ) => {
    await setter(value);
    if (hapticsEnabled) {
      HapticService.light();
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
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
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  icon: 'moon-waning-crescent',
                },
                {
                  value: 'auto',
                  label: 'Auto',
                  icon: 'brightness-auto',
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
              />
            )}
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
});
