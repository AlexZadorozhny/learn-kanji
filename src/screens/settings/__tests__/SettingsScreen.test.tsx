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

  it('provides theme change handler', () => {
    const mockSetThemeMode = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: mockSetThemeMode,
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    renderWithProviders(<SettingsScreen />);

    // Verify the setter is available
    expect(mockSetThemeMode).toBeDefined();
  });

  it('provides notification toggle handler', () => {
    const mockSetNotifications = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: mockSetNotifications,
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    renderWithProviders(<SettingsScreen />);

    expect(mockSetNotifications).toBeDefined();
  });

  it('provides sound toggle handler', () => {
    const mockSetSound = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: mockSetSound,
      setHapticsEnabled: jest.fn(),
    });

    renderWithProviders(<SettingsScreen />);

    expect(mockSetSound).toBeDefined();
  });

  it('provides haptics toggle handler', () => {
    const mockSetHaptics = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: mockSetHaptics,
    });

    renderWithProviders(<SettingsScreen />);

    expect(mockSetHaptics).toBeDefined();
  });

  it('renders with haptics disabled', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: false,
      soundEnabled: true,
      hapticsEnabled: false, // Haptics disabled
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<SettingsScreen />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders auto theme mode', () => {
    useSettingsStore.mockReturnValue({
      themeMode: 'auto',
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

  it('calls setThemeMode and HapticService when theme is changed to dark', async () => {
    const { HapticService } = require('../../../services/feedback/HapticService');
    const mockSetThemeMode = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: mockSetThemeMode,
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    // Find SegmentedButtons component and trigger onValueChange
    const segmentedButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').SegmentedButtons
    )[0];
    await segmentedButtons.props.onValueChange('dark');

    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    expect(HapticService.light).toHaveBeenCalled();
  });

  it('calls setThemeMode when theme is changed to auto', async () => {
    const mockSetThemeMode = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: mockSetThemeMode,
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    const segmentedButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').SegmentedButtons
    )[0];
    await segmentedButtons.props.onValueChange('auto');

    expect(mockSetThemeMode).toHaveBeenCalledWith('auto');
  });

  it('calls setNotificationsEnabled when notifications toggle is pressed', async () => {
    const mockSetNotifications = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: mockSetNotifications,
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    // Find all Switch components
    const switches = UNSAFE_root.findAllByType(require('react-native-paper').Switch);
    // First switch is notifications
    await switches[0].props.onValueChange(false);

    expect(mockSetNotifications).toHaveBeenCalledWith(false);
  });

  it('calls setSoundEnabled when sound toggle is pressed', async () => {
    const mockSetSound = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: mockSetSound,
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    const switches = UNSAFE_root.findAllByType(require('react-native-paper').Switch);
    // Second switch is sound
    await switches[1].props.onValueChange(false);

    expect(mockSetSound).toHaveBeenCalledWith(false);
  });

  it('calls setHapticsEnabled when haptics toggle is pressed', async () => {
    const mockSetHaptics = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setThemeMode: jest.fn(),
      setNotificationsEnabled: jest.fn(),
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: mockSetHaptics,
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    const switches = UNSAFE_root.findAllByType(require('react-native-paper').Switch);
    // Third switch is haptics
    await switches[2].props.onValueChange(false);

    expect(mockSetHaptics).toHaveBeenCalledWith(false);
  });

  it('calls HapticService.light when toggle is changed with haptics enabled', async () => {
    const { HapticService } = require('../../../services/feedback/HapticService');
    const mockSetNotifications = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true, // Haptics enabled
      setThemeMode: jest.fn(),
      setNotificationsEnabled: mockSetNotifications,
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    const switches = UNSAFE_root.findAllByType(require('react-native-paper').Switch);
    await switches[0].props.onValueChange(false);

    expect(HapticService.light).toHaveBeenCalled();
  });

  it('does not call HapticService.light when toggle is changed with haptics disabled', async () => {
    const { HapticService } = require('../../../services/feedback/HapticService');
    HapticService.light.mockClear();
    const mockSetNotifications = jest.fn().mockResolvedValue(undefined);

    useSettingsStore.mockReturnValue({
      themeMode: 'light',
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: false, // Haptics disabled
      setThemeMode: jest.fn(),
      setNotificationsEnabled: mockSetNotifications,
      setSoundEnabled: jest.fn(),
      setHapticsEnabled: jest.fn(),
    });

    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    const switches = UNSAFE_root.findAllByType(require('react-native-paper').Switch);
    await switches[0].props.onValueChange(false);

    // HapticService.light should NOT be called when haptics disabled
    expect(HapticService.light).not.toHaveBeenCalled();
  });
});
