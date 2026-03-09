import React from 'react';
import { renderWithProviders } from '../../../test-utils';
import SettingsScreen from '../SettingsScreen';

// Mock the settings store
jest.mock('../../../store/settingsStore', () => ({
  useSettingsStore: jest.fn(),
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },
}));

// Mock HapticService
jest.mock('../../../services/feedback/HapticService', () => ({
  HapticService: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

const { useSettingsStore } = require('../../../store/settingsStore');

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default settings', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<SettingsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with dark theme selected', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'dark',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<SettingsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with all toggles disabled', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: false,
      soundEnabled: false,
      hapticsEnabled: false,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<SettingsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays all settings sections', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { getByText } = renderWithProviders(<SettingsScreen />);

    // Check for section titles
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByText('Preferences')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();

    // Check for settings
    expect(getByText('Theme')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Sound Effects')).toBeTruthy();
    expect(getByText('Haptic Feedback')).toBeTruthy();
  });
});
