import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import MainTabNavigator from './MainTabNavigator';

export default function RootNavigator() {
  const theme = useTheme();
  const isDark = theme.dark;

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.outline,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.outline,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <MainTabNavigator />
    </NavigationContainer>
  );
}
