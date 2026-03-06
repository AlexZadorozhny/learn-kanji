import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { useProgressStore } from './src/store/progressStore';

export default function App() {
  const loadProgress = useProgressStore((state) => state.loadProgress);

  useEffect(() => {
    // Load saved progress when app starts
    loadProgress();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
