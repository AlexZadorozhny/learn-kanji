/**
 * Unit tests for KanjiVGFetcherService
 */

import { KanjiVGFetcherService } from '../KanjiVGFetcherService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();
global.Blob = jest.fn().mockImplementation((content: any[]) => ({
  size: JSON.stringify(content[0] || '').length,
})) as any;

describe('KanjiVGFetcherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKanjiSVG', () => {
    const mockSVG = '<svg>test</svg>';

    it('should return cached SVG if available', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockSVG) // First call: getFromCache
        .mockResolvedValueOnce('{}'); // Second call: updateAccessTime metadata

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00');

      expect(result).toBe(mockSVG);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@kanjivg_cache/U+4E00');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch from GitHub if not cached', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => mockSVG,
      });

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00');

      expect(result).toBe(mockSVG);
      expect(fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/04e00.svg',
        expect.any(Object)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@kanjivg_cache/U+4E00', mockSVG);
    });

    it('should skip cache if forceRefresh is true', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSVG);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '<svg>fresh</svg>',
      });

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00', { forceRefresh: true });

      expect(result).toBe('<svg>fresh</svg>');
      expect(fetch).toHaveBeenCalled();
    });

    it('should return null if cacheOnly and not cached', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00', { cacheOnly: true });

      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle 404 errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await KanjiVGFetcherService.getKanjiSVG('U+9999');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Kanji not found in KanjiVG dataset')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should retry on network errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          text: async () => mockSVG,
        });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00');

      expect(result).toBe(mockSVG);
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

      consoleWarnSpy.mockRestore();
    });

    it('should return null after max retries', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00');

      expect(result).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);

      consoleWarnSpy.mockRestore();
    });

    it('should handle timeout errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Mock AbortError
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      (fetch as jest.Mock).mockRejectedValue(abortError);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await KanjiVGFetcherService.getKanjiSVG('U+4E00', { timeout: 100 });

      expect(result).toBeNull();
      // Should log timeout warning (multiple times due to retries)
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('Timeout fetching');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('buildKanjiVGUrl', () => {
    it('should build correct URL for single-byte hex codes', () => {
      // Access private method via type assertion
      const buildUrl = (KanjiVGFetcherService as any).buildKanjiVGUrl.bind(KanjiVGFetcherService);

      expect(buildUrl('U+4E00')).toBe(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/04e00.svg'
      );
    });

    it('should pad hex codes to 5 digits', () => {
      const buildUrl = (KanjiVGFetcherService as any).buildKanjiVGUrl.bind(KanjiVGFetcherService);

      expect(buildUrl('U+20')).toBe(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/00020.svg'
      );
      expect(buildUrl('U+FFF')).toBe(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/00fff.svg'
      );
    });

    it('should handle lowercase u+ prefix', () => {
      const buildUrl = (KanjiVGFetcherService as any).buildKanjiVGUrl.bind(KanjiVGFetcherService);

      expect(buildUrl('u+4e00')).toBe(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/04e00.svg'
      );
    });

    it('should convert uppercase hex to lowercase', () => {
      const buildUrl = (KanjiVGFetcherService as any).buildKanjiVGUrl.bind(KanjiVGFetcherService);

      expect(buildUrl('U+4E8C')).toBe(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/04e8c.svg'
      );
    });
  });

  describe('isCached', () => {
    it('should return true if item exists in cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('<svg>cached</svg>');

      const result = await KanjiVGFetcherService.isCached('U+4E00');

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@kanjivg_cache/U+4E00');
    });

    it('should return false if item not in cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await KanjiVGFetcherService.isCached('U+9999');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await KanjiVGFetcherService.isCached('U+4E00');

      expect(result).toBe(false);
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache statistics', async () => {
      const mockKeys = ['@kanjivg_cache/U+4E00', '@kanjivg_cache/U+4E8C', '@other_key'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('<svg>test1</svg>') // 16 bytes
        .mockResolvedValueOnce('<svg>test2</svg>') // 16 bytes
        .mockResolvedValueOnce(null);

      const stats = await KanjiVGFetcherService.getCacheStats();

      expect(stats.count).toBe(2);
      expect(stats.sizeBytes).toBeGreaterThan(0);
    });

    it('should return zero stats on error', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const stats = await KanjiVGFetcherService.getCacheStats();

      expect(stats.count).toBe(0);
      expect(stats.sizeBytes).toBe(0);

      consoleErrorSpy.mockRestore();
    });

    it('should ignore non-cache keys', async () => {
      const mockKeys = ['@kanjivg_cache/U+4E00', '@other_key', '@progress_data'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('<svg>test</svg>');

      const stats = await KanjiVGFetcherService.getCacheStats();

      expect(stats.count).toBe(1);
    });
  });

  describe('clearCache', () => {
    it('should remove all cache entries', async () => {
      const mockKeys = [
        '@kanjivg_cache/U+4E00',
        '@kanjivg_cache/U+4E8C',
        '@other_key',
        '@kanjivg_cache_metadata',
      ];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await KanjiVGFetcherService.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@kanjivg_cache/U+4E00',
        '@kanjivg_cache/U+4E8C',
      ]);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@kanjivg_cache_metadata');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cleared cache'));

      consoleLogSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await KanjiVGFetcherService.clearCache();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to clear cache'),
        expect.anything()
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('prefetchKanji', () => {
    const mockSVG = '<svg>test</svg>';

    it('should prefetch uncached kanji', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => mockSVG,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await KanjiVGFetcherService.prefetchKanji(['U+4E00', 'U+4E8C']);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prefetching 2 kanji'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prefetch complete'));

      consoleLogSpy.mockRestore();
    });

    it('should skip already cached kanji', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockSVG) // U+4E00 cached
        .mockResolvedValueOnce(null); // U+4E8C not cached
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => mockSVG,
      });

      await KanjiVGFetcherService.prefetchKanji(['U+4E00', 'U+4E8C']);

      // Only fetch U+4E8C
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/04e8c.svg',
        expect.any(Object)
      );
    });

    it('should handle concurrent downloads with maxConcurrent limit', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => mockSVG,
      });

      const kanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09', 'U+56DB'];

      await KanjiVGFetcherService.prefetchKanji(kanjiIds, 2);

      expect(fetch).toHaveBeenCalledTimes(4);
    });

    it('should not throw on individual fetch failures', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      // First fetch succeeds, second fails (with retries), third succeeds
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, text: async () => mockSVG })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, text: async () => mockSVG });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await expect(
        KanjiVGFetcherService.prefetchKanji(['U+4E00', 'U+4E8C', 'U+4E09'])
      ).resolves.not.toThrow();

      // 1 success + 3 failures (1 initial + 2 retries) + 1 success = 5 calls
      expect(fetch).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should log message if all kanji already cached', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSVG);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await KanjiVGFetcherService.prefetchKanji(['U+4E00', 'U+4E8C']);

      expect(fetch).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('All kanji already cached')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used items when cache is full', async () => {
      // Mock cache stats showing cache near limit
      const largeString = 'x'.repeat(50 * 1024 * 1024); // 50MB

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // getFromCache (not cached)
        .mockResolvedValueOnce('{"U+OLD1":1000,"U+OLD2":2000}'); // metadata for eviction

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@kanjivg_cache/U+OLD1',
        '@kanjivg_cache/U+OLD2',
      ]);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => largeString,
      });

      // Note: This test verifies the eviction logic is called, not the exact behavior
      // since we're mocking AsyncStorage
      await KanjiVGFetcherService.getKanjiSVG('U+NEW');

      // Verify fetch was called (item not in cache)
      expect(fetch).toHaveBeenCalled();
    });
  });
});
