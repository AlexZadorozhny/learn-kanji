import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { useProgressStore } from './src/store/progressStore';
import { useSettingsStore } from './src/store/settingsStore';
import { useKanjiStore } from './src/store/kanjiStore';

export default function App() {
  const loadProgress = useProgressStore((state) => state.loadProgress);
  const { themeMode, loadSettings } = useSettingsStore();
  const initializeKanjiVG = useKanjiStore((state) => state.initializeKanjiVG);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    const initializeApp = async () => {
      // Load saved progress and settings
      loadProgress();
      loadSettings();

      // Initialize KanjiVG integration
      try {
        await initializeKanjiVG();
        console.log('KanjiVG initialized successfully');
      } catch (error) {
        console.error('Failed to initialize KanjiVG:', error);
        // Non-blocking error - app continues with legacy data
      }
    };

    initializeApp();
  }, []);

  // Determine which theme to use
  const getTheme = () => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const currentTheme = getTheme();
  const isDark = currentTheme === darkTheme;

  return (
    <PaperProvider theme={currentTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </PaperProvider>
  );
}
