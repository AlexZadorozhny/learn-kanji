import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Wrapper around AsyncStorage for type-safe local data persistence
 */
export class StorageService {
  // Storage keys
  private static readonly KEYS = {
    KANJI_DATA: '@kanji_learning/kanji_data',
    USER_PROGRESS: '@kanji_learning/user_progress',
    STUDY_STATS: '@kanji_learning/study_stats',
    SETTINGS: '@kanji_learning/settings',
  };

  /**
   * Save data to AsyncStorage
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`StorageService: Error saving ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`StorageService: Error retrieving ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove data from AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`StorageService: Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all app data from AsyncStorage
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = Object.values(this.KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('StorageService: Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in storage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`StorageService: Error checking ${key}:`, error);
      return false;
    }
  }

  // Convenience methods for specific data types

  /**
   * Save kanji data
   */
  static async saveKanjiData<T>(data: T): Promise<void> {
    return this.setItem(this.KEYS.KANJI_DATA, data);
  }

  /**
   * Get kanji data
   */
  static async getKanjiData<T>(): Promise<T | null> {
    return this.getItem<T>(this.KEYS.KANJI_DATA);
  }

  /**
   * Save user progress
   */
  static async saveUserProgress<T>(progress: T): Promise<void> {
    return this.setItem(this.KEYS.USER_PROGRESS, progress);
  }

  /**
   * Get user progress
   */
  static async getUserProgress<T>(): Promise<T | null> {
    return this.getItem<T>(this.KEYS.USER_PROGRESS);
  }

  /**
   * Save study stats
   */
  static async saveStudyStats<T>(stats: T): Promise<void> {
    return this.setItem(this.KEYS.STUDY_STATS, stats);
  }

  /**
   * Get study stats
   */
  static async getStudyStats<T>(): Promise<T | null> {
    return this.getItem<T>(this.KEYS.STUDY_STATS);
  }

  /**
   * Save app settings
   */
  static async saveSettings<T>(settings: T): Promise<void> {
    return this.setItem(this.KEYS.SETTINGS, settings);
  }

  /**
   * Get app settings
   */
  static async getSettings<T>(): Promise<T | null> {
    return this.getItem<T>(this.KEYS.SETTINGS);
  }
}
