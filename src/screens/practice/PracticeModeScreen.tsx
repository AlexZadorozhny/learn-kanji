import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function PracticeModeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Practice Mode</Text>
      <Text variant="bodyMedium">Select a practice mode</Text>
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
});
