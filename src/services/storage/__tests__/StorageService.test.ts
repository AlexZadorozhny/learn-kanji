import { StorageService } from '../StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is already mocked in jest.setup.js

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('saves string data to AsyncStorage', async () => {
      await StorageService.setItem('test_key', 'test_value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        JSON.stringify('test_value')
      );
    });

    it('saves object data to AsyncStorage', async () => {
      const testObject = { name: 'kanji', value: 123 };

      await StorageService.setItem('test_key', testObject);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        JSON.stringify(testObject)
      );
    });

    it('saves array data to AsyncStorage', async () => {
      const testArray = ['one', 'two', 'three'];

      await StorageService.setItem('test_key', testArray);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        JSON.stringify(testArray)
      );
    });

    it('throws error when AsyncStorage.setItem fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(StorageService.setItem('test_key', 'value')).rejects.toThrow(
        'Storage error'
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getItem', () => {
    it('retrieves and parses string data from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify('test_value')
      );

      const result = await StorageService.getItem<string>('test_key');

      expect(result).toBe('test_value');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test_key');
    });

    it('retrieves and parses object data from AsyncStorage', async () => {
      const testObject = { name: 'kanji', value: 123 };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testObject)
      );

      const result = await StorageService.getItem<typeof testObject>('test_key');

      expect(result).toEqual(testObject);
    });

    it('returns null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await StorageService.getItem<string>('non_existent_key');

      expect(result).toBeNull();
    });

    it('throws error when AsyncStorage.getItem fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Retrieval error')
      );

      await expect(StorageService.getItem('test_key')).rejects.toThrow(
        'Retrieval error'
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('removes item from AsyncStorage', async () => {
      await StorageService.removeItem('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('throws error when AsyncStorage.removeItem fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Removal error')
      );

      await expect(StorageService.removeItem('test_key')).rejects.toThrow(
        'Removal error'
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('removes all app keys from AsyncStorage', async () => {
      await StorageService.clearAll();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@kanji_learning/kanji_data',
        '@kanji_learning/user_progress',
        '@kanji_learning/study_stats',
        '@kanji_learning/settings',
      ]);
    });

    it('throws error when AsyncStorage.multiRemove fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(
        new Error('Clear error')
      );

      await expect(StorageService.clearAll()).rejects.toThrow('Clear error');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasItem', () => {
    it('returns true when key exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('some_value');

      const result = await StorageService.hasItem('test_key');

      expect(result).toBe(true);
    });

    it('returns false when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await StorageService.hasItem('test_key');

      expect(result).toBe(false);
    });

    it('returns false when AsyncStorage.getItem fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Check error')
      );

      const result = await StorageService.hasItem('test_key');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('convenience methods', () => {
    it('saveKanjiData calls setItem with correct key', async () => {
      const testData = [{ id: 'U+4E00', character: '一' }];

      await StorageService.saveKanjiData(testData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kanji_learning/kanji_data',
        JSON.stringify(testData)
      );
    });

    it('getKanjiData calls getItem with correct key', async () => {
      const testData = [{ id: 'U+4E00', character: '一' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testData)
      );

      const result = await StorageService.getKanjiData();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@kanji_learning/kanji_data'
      );
      expect(result).toEqual(testData);
    });

    it('saveUserProgress calls setItem with correct key', async () => {
      const testProgress = { 'U+4E00': { recognitionScore: 75 } };

      await StorageService.saveUserProgress(testProgress);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kanji_learning/user_progress',
        JSON.stringify(testProgress)
      );
    });

    it('getUserProgress calls getItem with correct key', async () => {
      const testProgress = { 'U+4E00': { recognitionScore: 75 } };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testProgress)
      );

      const result = await StorageService.getUserProgress();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@kanji_learning/user_progress'
      );
      expect(result).toEqual(testProgress);
    });

    it('saveStudyStats calls setItem with correct key', async () => {
      const testStats = { totalKanjiStudied: 10, kanjiMastered: 5 };

      await StorageService.saveStudyStats(testStats);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kanji_learning/study_stats',
        JSON.stringify(testStats)
      );
    });

    it('getStudyStats calls getItem with correct key', async () => {
      const testStats = { totalKanjiStudied: 10, kanjiMastered: 5 };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testStats)
      );

      const result = await StorageService.getStudyStats();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@kanji_learning/study_stats'
      );
      expect(result).toEqual(testStats);
    });

    it('saveSettings calls setItem with correct key', async () => {
      const testSettings = { theme: 'dark', soundEnabled: true };

      await StorageService.saveSettings(testSettings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@kanji_learning/settings',
        JSON.stringify(testSettings)
      );
    });

    it('getSettings calls getItem with correct key', async () => {
      const testSettings = { theme: 'dark', soundEnabled: true };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(testSettings)
      );

      const result = await StorageService.getSettings();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@kanji_learning/settings'
      );
      expect(result).toEqual(testSettings);
    });
  });
});
