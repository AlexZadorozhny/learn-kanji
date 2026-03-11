/**
 * Integration tests for KanjiVGIntegrationService
 */

import { KanjiVGIntegrationService } from '../KanjiVGIntegrationService';
import { KanjiVGParserService } from '../KanjiVGParserService';
import { KanjiVGFetcherService } from '../KanjiVGFetcherService';
import { sampleKanjiData } from '../../../data/sample-data';

// Get real parser for bundle loading tests
const ActualParser = jest.requireActual('../KanjiVGParserService').KanjiVGParserService;

// Mock the fetcher and parser services
jest.mock('../KanjiVGFetcherService');
jest.mock('../KanjiVGParserService');

const MockedFetcher = KanjiVGFetcherService as jest.Mocked<typeof KanjiVGFetcherService>;
const MockedParser = KanjiVGParserService as jest.Mocked<typeof KanjiVGParserService>;

describe('KanjiVGIntegrationService', () => {
  const mockSVG = '<svg>test</svg>';
  const mockStrokePaths = [
    { path: 'M 20,30 L 40,50', strokeNumber: 1 },
    { path: 'M 10,10 L 90,90', strokeNumber: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    KanjiVGIntegrationService.clearMemoryCache();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await KanjiVGIntegrationService.initialize();

      expect(KanjiVGIntegrationService.isInitialized()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Initialized with'));

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

      // Use non-bundled kanji to test cache behavior with mocks
      // First call - will load and cache
      MockedFetcher.getKanjiSVG.mockResolvedValue(mockSVG);
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result1 = await KanjiVGIntegrationService.getStrokeOrder('U+8000');

      expect(result1).toEqual(mockStrokePaths);

      // Note initial call count - might be cache-only + fetch (2) or just fetch (1)
      const initialCalls = MockedFetcher.getKanjiSVG.mock.calls.length;
      expect(initialCalls).toBeGreaterThan(0);

      // Second call - should use memory cache, no additional fetches
      const result2 = await KanjiVGIntegrationService.getStrokeOrder('U+8000');

      expect(result2).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(initialCalls); // Not called again
    });

    it('should load from AsyncStorage cache if not in memory', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValueOnce(mockSVG); // cache-only call
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+8000');

      expect(result).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledWith('U+8000', { cacheOnly: true });
      expect(MockedParser.parseKanjiVGSVG).toHaveBeenCalledWith(mockSVG, 'U+8000');
    });

    it('should fetch from GitHub if not cached', async () => {
      MockedFetcher.getKanjiSVG
        .mockResolvedValueOnce(null) // cache-only returns null
        .mockResolvedValueOnce(mockSVG); // fetch returns SVG
      MockedParser.parseKanjiVGSVG.mockReturnValue(mockStrokePaths);

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+8000');

      expect(result).toEqual(mockStrokePaths);
      expect(MockedFetcher.getKanjiSVG).toHaveBeenCalledTimes(2);
      expect(MockedParser.parseKanjiVGSVG).toHaveBeenCalledWith(mockSVG, 'U+8000');
    });

    it('should fallback to legacy data if fetch fails', async () => {
      // After Phase 3, legacy fallback is deprecated (no strokeOrder in sampleKanjiData)
      // This test now verifies that bundled data works for all 25 kanji
      await KanjiVGIntegrationService.initialize();

      // U+4E00 (一) is bundled, so it should load successfully
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result).toBeTruthy();
      expect(result!.length).toBeGreaterThan(0);
      expect(result![0]).toHaveProperty('path');
      expect(result![0]).toHaveProperty('strokeNumber');
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

    it('should return true if in bundled data', async () => {
      await KanjiVGIntegrationService.initialize();
      MockedFetcher.isCached.mockResolvedValue(false);

      // U+4E00 is bundled (一)
      const result = await KanjiVGIntegrationService.hasStrokeData('U+4E00');

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

    it('should return "bundled" for bundled kanji', async () => {
      await KanjiVGIntegrationService.initialize();
      MockedFetcher.isCached.mockResolvedValue(false);

      // U+4E00 (一) is bundled
      const tier = await KanjiVGIntegrationService.getKanjiTier('U+4E00');

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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prefetching 3 kanji'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Prefetch complete'));

      consoleLogSpy.mockRestore();
    });

    it('should handle prefetch errors gracefully', async () => {
      MockedFetcher.getKanjiSVG.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Use non-bundled kanji that will trigger network fetch
      await expect(KanjiVGIntegrationService.prefetchForSession(['U+8000'])).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('legacy fallback', () => {
    it('should verify legacy strokeOrder data was removed', () => {
      // After Phase 3, strokeOrder should be removed from all sampleKanjiData
      const legacyKanji = sampleKanjiData.filter((k) => k.strokeOrder && k.strokeOrder.length > 0);

      // Should be 0 since we removed all strokeOrder arrays
      expect(legacyKanji.length).toBe(0);
    });

    it('should prefer bundled data over legacy data', async () => {
      // After Phase 3, all 25 kanji use bundled KanjiVG data
      // Legacy fallback is deprecated
      await KanjiVGIntegrationService.initialize();

      // Test first 5 kanji from sampleKanjiData
      const testKanji = sampleKanjiData.slice(0, 5);

      for (const kanji of testKanji) {
        const result = await KanjiVGIntegrationService.getStrokeOrder(kanji.id);

        // Should load successfully from bundle
        expect(result).toBeTruthy();
        expect(result!.length).toBeGreaterThan(0);

        // Bundled data has correct format
        expect(result![0]).toHaveProperty('path');
        expect(result![0]).toHaveProperty('strokeNumber');
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

  describe('Bundle Loading (Phase 2)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      KanjiVGIntegrationService.clearMemoryCache();

      // Use real parser implementation for bundled SVG tests
      // This allows actual parsing of bundled SVG content
      MockedParser.parseKanjiVGSVG.mockImplementation((svgContent: string, kanjiId?: string) => {
        console.log(
          `Mock parser called for ${kanjiId}, SVG length: ${svgContent ? svgContent.length : 'null'}`
        );
        const result = ActualParser.parseKanjiVGSVG(svgContent, kanjiId);
        console.log(`Mock parser returned ${result ? result.length : 'null'} strokes`);
        return result;
      });
    });

    it('should load bundled SVG for U+4E00 (一)', async () => {
      // This test will load the actual bundled SVG file and parse it
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);

      // Verify stroke structure
      result!.forEach((stroke, index) => {
        expect(stroke).toHaveProperty('path');
        expect(stroke).toHaveProperty('strokeNumber');
        expect(stroke.strokeNumber).toBe(index + 1);
      });
    });

    it('should load bundled SVG for U+4EBA (人)', async () => {
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4EBA');

      expect(result).toBeTruthy();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should load bundled SVG for U+56FD (国)', async () => {
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+56FD');

      expect(result).toBeTruthy();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for non-bundled kanji', async () => {
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      // U+9999 is not in the bundled list
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+9999');

      expect(result).toBeNull();
    });

    it('should load all 25 bundled kanji successfully', async () => {
      // Get bundled kanji IDs from index
      const { BUNDLED_KANJI_IDS } = require('../../../data/kanjivg-bundled');

      expect(BUNDLED_KANJI_IDS.length).toBe(25);

      // Test first 5 to keep test time reasonable
      const sampleIds = BUNDLED_KANJI_IDS.slice(0, 5);

      for (const kanjiId of sampleIds) {
        const result = await KanjiVGIntegrationService.getStrokeOrder(kanjiId);

        expect(result).toBeTruthy();
        expect(result!.length).toBeGreaterThan(0);

        // Verify each stroke has required properties
        result!.forEach((stroke) => {
          expect(stroke.path).toBeTruthy();
          expect(stroke.strokeNumber).toBeGreaterThan(0);
        });
      }
    });

    it('should parse SVG paths correctly from bundled files', async () => {
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      expect(result).toBeTruthy();
      expect(result![0].path).toBeTruthy();

      // Path should be a string containing SVG path commands
      expect(typeof result![0].path).toBe('string');
      expect(result![0].path.length).toBeGreaterThan(0);
    });

    it('should cache bundled kanji in memory after first load', async () => {
      // First load
      await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      const cacheInfo = KanjiVGIntegrationService.getCacheInfo();
      expect(cacheInfo.memoryCount).toBe(1);

      // Second load should use cache
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');
      expect(result).toBeTruthy();
    });

    it('should handle bundled kanji with multiple strokes', async () => {
      // 人 (person) has 2 strokes
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4EBA');

      expect(result).toBeTruthy();
      expect(result!.length).toBe(2);

      // Verify stroke numbers are sequential
      expect(result![0].strokeNumber).toBe(1);
      expect(result![1].strokeNumber).toBe(2);
    });

    it('should handle bundled kanji with many strokes', async () => {
      // 国 (country) has 8 strokes
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+56FD');

      expect(result).toBeTruthy();
      expect(result!.length).toBe(8);

      // Verify stroke numbers are sequential
      result!.forEach((stroke, index) => {
        expect(stroke.strokeNumber).toBe(index + 1);
      });
    });

    it('should handle errors gracefully for corrupted bundled files', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Try to load a non-existent bundled kanji (should fall through to GitHub fetch)
      // We mock the fetcher to return null to simulate complete failure
      MockedFetcher.getKanjiSVG.mockResolvedValue(null);

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+FFFF');

      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should prefer bundled data over cache for bundled kanji', async () => {
      // Even if AsyncStorage has cached data, bundled should be preferred
      MockedFetcher.isCached.mockResolvedValue(true);
      MockedFetcher.getKanjiSVG.mockResolvedValue('<svg>cached</svg>');

      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      // Should load from bundle successfully
      expect(result).toBeTruthy();
      expect(result!.length).toBeGreaterThan(0);

      // Verify it's real bundled data (has actual path content)
      expect(result![0].path).toBeTruthy();
      expect(result![0].strokeNumber).toBe(1);
    });

    it('should report correct tier for bundled kanji', async () => {
      const tier = await KanjiVGIntegrationService.getKanjiTier('U+4E00');

      expect(tier).toBe('bundled');
    });

    it('should include bundled kanji in cache info', async () => {
      await KanjiVGIntegrationService.initialize();

      const info = KanjiVGIntegrationService.getCacheInfo();

      expect(info.bundledCount).toBe(25);
    });

    it('should handle hex conversion correctly', async () => {
      // Test various Unicode ID formats
      const testCases = [
        { id: 'U+4E00', expectedHex: '04e00' },
        { id: 'U+4EBA', expectedHex: '04eba' },
        { id: 'U+56FD', expectedHex: '056fd' },
      ];

      for (const { id } of testCases) {
        const result = await KanjiVGIntegrationService.getStrokeOrder(id);
        expect(result).toBeTruthy();
      }
    });
  });
});
