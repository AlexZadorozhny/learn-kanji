import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Progress</Text>
      <Text variant="bodyMedium">Track your learning progress</Text>
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
