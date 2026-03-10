/**
 * Integration tests for KanjiVGIntegrationService
 */

import { KanjiVGIntegrationService } from '../KanjiVGIntegrationService';
import { KanjiVGParserService } from '../KanjiVGParserService';
import { KanjiVGFetcherService } from '../KanjiVGFetcherService';
import { sampleKanjiData } from '../../../data/sample-data';

// Mock the fetcher and parser services
jest.mock('../KanjiVGFetcherService');
jest.mock('../KanjiVGParserService');

const MockedFetcher = KanjiVGFetcherService as jest.Mocked<typeof KanjiVGFetcherService>;
const MockedParser = KanjiVGParserService as jest.Mocked<typeof KanjiVGParserService>;

describe('KanjiVGIntegrationService', () => {
  const mockSVG = '<svg>test</svg>';
  const mockStrokePaths = [{ d: 'M 20,30 L 40,50' }, { d: 'M 10,10 L 90,90' }];

  beforeEach(() => {
    jest.clearAllMocks();
    KanjiVGIntegrationService.clearMemoryCache();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await KanjiVGIntegrationService.initialize();

      expect(KanjiVGIntegrationService.isInitialized()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialized with')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by mocking something that throws
      jest.spyOn(console, 'log').mockImplementationOnce(() => {
        throw new Error('Init error');
      });

      await KanjiVGIntegrationService.initialize();

      // Should still work despite error
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStrokeOrder', () => {
    it('should return from memory cache if available', async () => {
      // Pre-populate memory cache
      await KanjiVGIntegrationService.initialize();

      // First call - will cache
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result1 = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result1).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(1);

      // Second call - from cache
      const result2 = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result2).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should load from AsyncStorage cache if not in memory', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValueOnce(mockSVG); // cache-only call
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledWith('U+4E00', { cacheOnly: true });
      expect(MockedParser.parseKanjiVGSVG).toHaveBeenCalledWith(mockSVG, 'U+4E00');
    });

    it('should fetch from GitHub if not cached', async () => {
      MockedFetcher.getKanjiSVG
        .mockResolvedValueOnce(null) // cache-only returns null
        .mockResolvedValueOnce(mockSVG); // fetch returns SVG
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(2);
      expect(MockedParser.parseKanjiVGSVG).toHaveBeenCalledWith(mockSVG, 'U+4E00');
    });

    it('should fallback to legacy data if fetch fails', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      // Use a kanji ID that exists in sample data
      const legacyKanji = sampleKanjiData.find(k => k.strokeOrder && k.strokeOrder.length > 0);
      expect(legacyKanji).toBeDefined();

      const result = await KanjiVGIntegrationService.getStrokeOrder(legacyKanji!.id);

      expect(result).toEqual(legacyKanji!.strokeOrder);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalled();
    });

    it('should return null if kanji unavailable', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      // Use a kanji ID that doesn't exist in sample data
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+9999');

      expect(result).toBeNull();
    });

    it('should cache null results to avoid repeated failed lookups', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      // First call
      const result1 = await KanjiVGIntegrationService.getStrokeOrder('U+9999');
      expect(result1).toBeNull();
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(2); // cache-only + fetch

      // Second call - should use cached null
      const result2 = await KanjiVGIntegrationService.getStrokeOrder('U+9999');
      expect(result2).toBeNull();
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(2); // No additional calls
    });

    it('should handle errors gracefully', async () => {
      MockedFetcher.getKanjiSVG.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Use kanji ID that doesn't exist in legacy data
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+FFFF');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadStrokeOrderBatch', () => {
    it('should load multiple kanji in parallel', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const kanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09'];
      const results = await KanjiVGIntegrationService.loadStrokeOrderBatch(kanjiIds);

      expect(results.size).toBe(3);
      expect(results.get('U+4E00')).toEqual(mockStrokePaths);
      expect(results.get('U+4E8C')).toEqual(mockStrokePaths);
      expect(results.get('U+4E09')).toEqual(mockStrokePaths);
    });

    it('should skip kanji that fail to load', async () => {
      // Fetcher returns SVG for all
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);

      // Parser returns data for U+8000 and U+8001, null for U+FFFF
      MockedParser.parseKanjiVGSVG.mockImplementation((svg, id) => {
        if (id === 'U+FFFF') {
          return null; // Parse failure
        }
        return mockStrokePaths;
      });

      // Use kanji IDs that don't exist in legacy data
      const kanjiIds = ['U+8000', 'U+FFFF', 'U+8001'];
      const results = await KanjiVGIntegrationService.loadStrokeOrderBatch(kanjiIds);

      expect(results.size).toBe(2);
      expect(results.has('U+8000')).toBe(true);
      expect(results.has('U+FFFF')).toBe(false);
      expect(results.has('U+8001')).toBe(true);
    });
  });

  describe('hasStrokeData', () => {
    it('should return true if in memory cache', async () => {
      // Pre-populate memory cache
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);
      await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      const result = await KanjiVGIntegrationService.hasStrokeData('U+4E00');

      expect(result).toBe(true);
    });

    it('should return true if cached in AsyncStorage', async () => {
      MockedFetcher.isCached.mockResolvedValue(true);

      const result = await KanjiVGIntegrationService.hasStrokeData('U+4E00');

      expect(result).toBe(true);
    });

    it('should return true if in legacy data', async () => {
      MockedFetcher.isCached.mockResolvedValue(false);

      const legacyKanji = sampleKanjiData.find(k => k.strokeOrder && k.strokeOrder.length > 0);
      const result = await KanjiVGIntegrationService.hasStrokeData(legacyKanji!.id);

      expect(result).toBe(true);
    });

    it('should return false if unavailable', async () => {
      MockedFetcher.isCached.mockResolvedValue(false);

      const result = await KanjiVGIntegrationService.hasStrokeData('U+9999');

      expect(result).toBe(false);
    });

    it('should return false if cached null result', async () => {
      // Pre-cache null result
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);
      await KanjiVGIntegrationService.getStrokeOrder('U+9999');

      const result = await KanjiVGIntegrationService.hasStrokeData('U+9999');

      expect(result).toBe(false);
    });
  });

  describe('getKanjiTier', () => {
    it('should return "cached" if in AsyncStorage', async () => {
      MockedFetcher.isCached.mockResolvedValue(true);

      // Use a kanji ID that's not in bundled list
      const tier = await KanjiVGIntegrationService.getKanjiTier('U+8000');

      expect(tier).toBe('cached');
    });

    it('should return "bundled" for legacy kanji', async () => {
      MockedFetcher.isCached.mockResolvedValue(false);

      const legacyKanji = sampleKanjiData.find(k => k.strokeOrder && k.strokeOrder.length > 0);
      const tier = await KanjiVGIntegrationService.getKanjiTier(legacyKanji!.id);

      expect(tier).toBe('bundled');
    });

    it('should return "available" for fetchable kanji', async () => {
      MockedFetcher.isCached.mockResolvedValue(false);

      const tier = await KanjiVGIntegrationService.getKanjiTier('U+9999');

      expect(tier).toBe('available');
    });
  });

  describe('clearMemoryCache', () => {
    it('should clear in-memory cache', async () => {
      // Pre-populate cache
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);
      await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      const infoBefore = KanjiVGIntegrationService.getCacheInfo();
      expect(infoBefore.memoryCount).toBeGreaterThan(0);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      KanjiVGIntegrationService.clearMemoryCache();

      const infoAfter = KanjiVGIntegrationService.getCacheInfo();
      expect(infoAfter.memoryCount).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Memory cache cleared'));

      consoleLogSpy.mockRestore();
    });
  });

  describe('getCacheInfo', () => {
    it('should return cache statistics', async () => {
      // Initialize to load bundled IDs
      await KanjiVGIntegrationService.initialize();

      // Pre-populate cache
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);
      await KanjiVGIntegrationService.getStrokeOrder('U+4E00');
      await KanjiVGIntegrationService.getStrokeOrder('U+4E8C');

      const info = KanjiVGIntegrationService.getCacheInfo();

      expect(info.memoryCount).toBe(2);
      expect(info.bundledCount).toBeGreaterThanOrEqual(0); // Depends on bundle size
    });
  });

  describe('prefetchForSession', () => {
    it('should prefetch multiple kanji', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const kanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09'];
      await KanjiVGIntegrationService.prefetchForSession(kanjiIds);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Prefetching 3 kanji')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prefetch complete'));

      consoleLogSpy.mockRestore();
    });

    it('should handle prefetch errors gracefully', async () => {
      MockedFetcher.getKanjiSVG.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        KanjiVGIntegrationService.prefetchForSession(['U+4E00'])
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('legacy fallback', () => {
    it('should correctly identify all legacy kanji', () => {
      const legacyKanji = sampleKanjiData.filter(
        k => k.strokeOrder && k.strokeOrder.length > 0
      );

      expect(legacyKanji.length).toBeGreaterThan(0);

      console.log(`Found ${legacyKanji.length} legacy kanji with stroke order data`);
    });

    it('should return legacy data for all supported kanji', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      const legacyKanji = sampleKanjiData.filter(
        k => k.strokeOrder && k.strokeOrder.length > 0
      );

      for (const kanji of legacyKanji) {
        const result = await KanjiVGIntegrationService.getStrokeOrder(kanji.id);
        expect(result).toEqual(kanji.strokeOrder);
      }
    });
  });

  describe('error handling', () => {
    it('should handle parser errors', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(null); // Parser fails

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      // Should fallback to legacy or return null
      expect(result).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('should handle fetcher errors', async () => {
      MockedFetcher.getKanjiSVG.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Use kanji ID that doesn't exist in legacy data
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+FFFF');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
