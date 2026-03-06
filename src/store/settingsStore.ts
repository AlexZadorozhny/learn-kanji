import { create } from 'zustand';
import { StorageService } from '../services/storage/StorageService';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface SettingsState {
  themeMode: ThemeMode;
  dailyGoal: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  themeMode: 'light' as ThemeMode,
  dailyGoal: 10,
  notificationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    const settings = {
      themeMode: mode,
      dailyGoal: get().dailyGoal,
      notificationsEnabled: get().notificationsEnabled,
      soundEnabled: get().soundEnabled,
      hapticsEnabled: get().hapticsEnabled,
    };
    await StorageService.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  setDailyGoal: async (goal: number) => {
    set({ dailyGoal: goal });
    const settings = {
      themeMode: get().themeMode,
      dailyGoal: goal,
      notificationsEnabled: get().notificationsEnabled,
      soundEnabled: get().soundEnabled,
      hapticsEnabled: get().hapticsEnabled,
    };
    await StorageService.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  setNotificationsEnabled: async (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    const settings = {
      themeMode: get().themeMode,
      dailyGoal: get().dailyGoal,
      notificationsEnabled: enabled,
      soundEnabled: get().soundEnabled,
      hapticsEnabled: get().hapticsEnabled,
    };
    await StorageService.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  setSoundEnabled: async (enabled: boolean) => {
    set({ soundEnabled: enabled });
    const settings = {
      themeMode: get().themeMode,
      dailyGoal: get().dailyGoal,
      notificationsEnabled: get().notificationsEnabled,
      soundEnabled: enabled,
      hapticsEnabled: get().hapticsEnabled,
    };
    await StorageService.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  setHapticsEnabled: async (enabled: boolean) => {
    set({ hapticsEnabled: enabled });
    const settings = {
      themeMode: get().themeMode,
      dailyGoal: get().dailyGoal,
      notificationsEnabled: get().notificationsEnabled,
      soundEnabled: get().soundEnabled,
      hapticsEnabled: enabled,
    };
    await StorageService.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  loadSettings: async () => {
    try {
      const settingsJson = await StorageService.getItem(SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set({
          themeMode: settings.themeMode || defaultSettings.themeMode,
          dailyGoal: settings.dailyGoal || defaultSettings.dailyGoal,
          notificationsEnabled: settings.notificationsEnabled ?? defaultSettings.notificationsEnabled,
          soundEnabled: settings.soundEnabled ?? defaultSettings.soundEnabled,
          hapticsEnabled: settings.hapticsEnabled ?? defaultSettings.hapticsEnabled,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
}));
