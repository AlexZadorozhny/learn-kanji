import { useSettingsStore, ThemeMode } from '../settingsStore';
import { StorageService } from '../../services/storage/StorageService';

// Mock StorageService
jest.mock('../../services/storage/StorageService', () => ({
  StorageService: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));

const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('settingsStore', () => {
  const SETTINGS_KEY = 'app_settings';

  const defaultSettings = {
    themeMode: 'light' as ThemeMode,
    dailyGoal: 10,
    notificationsEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    useSettingsStore.setState(defaultSettings);
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = useSettingsStore.getState();

    expect(state.themeMode).toBe('light');
    expect(state.dailyGoal).toBe(10);
    expect(state.notificationsEnabled).toBe(true);
    expect(state.soundEnabled).toBe(true);
    expect(state.hapticsEnabled).toBe(true);
  });

  it('setThemeMode updates theme', async () => {
    await useSettingsStore.getState().setThemeMode('dark');

    expect(useSettingsStore.getState().themeMode).toBe('dark');
  });

  it('setThemeMode saves to AsyncStorage', async () => {
    await useSettingsStore.getState().setThemeMode('dark');

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SETTINGS_KEY,
      expect.stringContaining('"themeMode":"dark"')
    );
  });

  it('setThemeMode saves all settings', async () => {
    await useSettingsStore.getState().setThemeMode('auto');

    const savedSettings = JSON.parse(
      (mockStorageService.setItem as jest.Mock).mock.calls[0][1]
    );

    expect(savedSettings).toEqual({
      themeMode: 'auto',
      dailyGoal: 10,
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
    });
  });

  it('setDailyGoal updates goal', async () => {
    await useSettingsStore.getState().setDailyGoal(20);

    expect(useSettingsStore.getState().dailyGoal).toBe(20);
  });

  it('setDailyGoal saves to AsyncStorage', async () => {
    await useSettingsStore.getState().setDailyGoal(15);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SETTINGS_KEY,
      expect.stringContaining('"dailyGoal":15')
    );
  });

  it('setNotificationsEnabled updates flag', async () => {
    await useSettingsStore.getState().setNotificationsEnabled(false);

    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('setNotificationsEnabled saves to AsyncStorage', async () => {
    await useSettingsStore.getState().setNotificationsEnabled(false);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SETTINGS_KEY,
      expect.stringContaining('"notificationsEnabled":false')
    );
  });

  it('setSoundEnabled updates flag', async () => {
    await useSettingsStore.getState().setSoundEnabled(false);

    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });

  it('setSoundEnabled saves to AsyncStorage', async () => {
    await useSettingsStore.getState().setSoundEnabled(false);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SETTINGS_KEY,
      expect.stringContaining('"soundEnabled":false')
    );
  });

  it('setHapticsEnabled updates flag', async () => {
    await useSettingsStore.getState().setHapticsEnabled(false);

    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);
  });

  it('setHapticsEnabled saves to AsyncStorage', async () => {
    await useSettingsStore.getState().setHapticsEnabled(false);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SETTINGS_KEY,
      expect.stringContaining('"hapticsEnabled":false')
    );
  });

  it('loadSettings loads from AsyncStorage', async () => {
    const savedSettings = {
      themeMode: 'dark',
      dailyGoal: 25,
      notificationsEnabled: false,
      soundEnabled: false,
      hapticsEnabled: false,
    };

    mockStorageService.getItem.mockResolvedValueOnce(JSON.stringify(savedSettings));

    await useSettingsStore.getState().loadSettings();

    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe('dark');
    expect(state.dailyGoal).toBe(25);
    expect(state.notificationsEnabled).toBe(false);
    expect(state.soundEnabled).toBe(false);
    expect(state.hapticsEnabled).toBe(false);
  });

  it('loadSettings uses defaults when no saved settings', async () => {
    mockStorageService.getItem.mockResolvedValueOnce(null);

    await useSettingsStore.getState().loadSettings();

    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe('light');
    expect(state.dailyGoal).toBe(10);
    expect(state.notificationsEnabled).toBe(true);
    expect(state.soundEnabled).toBe(true);
    expect(state.hapticsEnabled).toBe(true);
  });

  it('loadSettings uses defaults for missing fields', async () => {
    const partialSettings = {
      themeMode: 'dark',
      dailyGoal: 20,
      // Missing notification, sound, and haptics flags
    };

    mockStorageService.getItem.mockResolvedValueOnce(JSON.stringify(partialSettings));

    await useSettingsStore.getState().loadSettings();

    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe('dark');
    expect(state.dailyGoal).toBe(20);
    expect(state.notificationsEnabled).toBe(true); // Default
    expect(state.soundEnabled).toBe(true); // Default
    expect(state.hapticsEnabled).toBe(true); // Default
  });

  it('loadSettings handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockStorageService.getItem.mockRejectedValueOnce(new Error('Storage error'));

    await useSettingsStore.getState().loadSettings();

    expect(consoleErrorSpy).toHaveBeenCalled();
    // State should remain unchanged
    const state = useSettingsStore.getState();
    expect(state).toMatchObject(defaultSettings);

    consoleErrorSpy.mockRestore();
  });

  it('all setters trigger AsyncStorage save', async () => {
    mockStorageService.setItem.mockClear();

    await useSettingsStore.getState().setThemeMode('dark');
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);

    mockStorageService.setItem.mockClear();
    await useSettingsStore.getState().setDailyGoal(15);
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);

    mockStorageService.setItem.mockClear();
    await useSettingsStore.getState().setNotificationsEnabled(false);
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);

    mockStorageService.setItem.mockClear();
    await useSettingsStore.getState().setSoundEnabled(false);
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);

    mockStorageService.setItem.mockClear();
    await useSettingsStore.getState().setHapticsEnabled(false);
    expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
  });

  it('settings persist across multiple updates', async () => {
    await useSettingsStore.getState().setThemeMode('dark');
    await useSettingsStore.getState().setDailyGoal(25);
    await useSettingsStore.getState().setNotificationsEnabled(false);

    const state = useSettingsStore.getState();
    expect(state.themeMode).toBe('dark');
    expect(state.dailyGoal).toBe(25);
    expect(state.notificationsEnabled).toBe(false);
    expect(state.soundEnabled).toBe(true); // Unchanged
    expect(state.hapticsEnabled).toBe(true); // Unchanged
  });
});
