import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { lightTheme } from '../theme/theme';

/**
 * Custom render function that wraps components with required providers
 * Use this instead of @testing-library/react-native's render
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: typeof lightTheme;
  navigationProps?: object;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    theme = lightTheme,
    navigationProps = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PaperProvider theme={theme}>
        <NavigationContainer {...navigationProps}>
          {children}
        </NavigationContainer>
      </PaperProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react-native';
