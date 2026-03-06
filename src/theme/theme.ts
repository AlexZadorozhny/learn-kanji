import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    error: lightColors.error,
    text: lightColors.text,
    onSurface: lightColors.text,
    onBackground: lightColors.text,
    outline: lightColors.border,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    error: darkColors.error,
    text: darkColors.text,
    onSurface: darkColors.text,
    onBackground: darkColors.text,
    outline: darkColors.border,
  },
};

// For backward compatibility
export const theme = lightTheme;

export { lightColors, darkColors } from './colors';
export { typography } from './typography';
