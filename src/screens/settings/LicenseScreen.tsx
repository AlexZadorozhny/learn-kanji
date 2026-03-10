import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';

export default function LicenseScreen() {
  const theme = useTheme();

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Title title="KanjiVG" subtitle="Stroke Order Data" />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.paragraph}>
            Stroke order data is provided by KanjiVG, an open-source project
            providing SVG vector data for Japanese kanji.
          </Text>

          <Text variant="titleMedium" style={styles.subheading}>
            Copyright
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            © Ulrich Apel
          </Text>

          <Text variant="titleMedium" style={styles.subheading}>
            License
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Creative Commons Attribution-Share Alike 3.0 Unported (CC BY-SA 3.0)
          </Text>

          <Button
            mode="contained"
            onPress={() => openURL('https://kanjivg.tagaini.net')}
            style={styles.button}
            icon="open-in-new"
          >
            Visit KanjiVG Project
          </Button>

          <Button
            mode="outlined"
            onPress={() => openURL('https://creativecommons.org/licenses/by-sa/3.0/')}
            style={styles.button}
            icon="open-in-new"
          >
            View CC BY-SA 3.0 License
          </Button>

          <Text variant="titleMedium" style={styles.subheading}>
            Modifications
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            SVG path coordinates normalized from 109×109 to 100×100 viewBox
            for compatibility with app rendering system.
          </Text>

          <Text variant="titleMedium" style={styles.subheading}>
            Coverage
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            KanjiVG provides stroke order data for 6,355+ Japanese kanji characters,
            including all jōyō kanji (常用漢字) and many additional characters.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Simple Mobile" subtitle="Application License" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.paragraph}>
            This application is built using KanjiVG data under the CC BY-SA 3.0 license.
            Any derivative works must also be shared under the same license.
          </Text>

          <Text variant="bodySmall" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
            Built with Expo, React Native, and React Native Paper
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  paragraph: {
    marginBottom: 12,
  },
  subheading: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
