/**
 * Unit tests for kanjiStore KanjiVG integration
 */

import { useKanjiStore } from '../kanjiStore';
import { KanjiVGIntegrationService } from '../../services/kanjivg/KanjiVGIntegrationService';

// Mock the integration service
jest.mock('../../services/kanjivg/KanjiVGIntegrationService');

const MockedIntegration = KanjiVGIntegrationService as jest.Mocked<
  typeof KanjiVGIntegrationService
>;

describe('kanjiStore - KanjiVG Integration', () => {
  const mockStrokePaths = [{ d: 'M 20,30 L 40,50' }, { d: 'M 10,10 L 90,90' }];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useKanjiStore.getState().clearStrokeCache();
  });

  describe('initializeKanjiVG', () => {
    it('should initialize KanjiVG integration service', async () => {
      MockedIntegration.initialize.mockResolvedValue(undefined);

      await useKanjiStore.getState().initializeKanjiVG();

      expect(MockedIntegration.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      MockedIntegration.initialize.mockRejectedValue(new Error('Init error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(useKanjiStore.getState().initializeKanjiVG()).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize KanjiVG:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadStrokeOrder', () => {
    it('should load stroke order from integration service', async () => {
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);

      const result = await useKanjiStore.getState().loadStrokeOrder('U+4E00');

      expect(result).toEqual(mockStrokePaths);
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledWith('U+4E00');
    });

    it('should cache results in memory', async () => {
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);

      // First call
      const result1 = await useKanjiStore.getState().loadStrokeOrder('U+4E00');
      expect(result1).toEqual(mockStrokePaths);
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await useKanjiStore.getState().loadStrokeOrder('U+4E00');
      expect(result2).toEqual(mockStrokePaths);
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should cache null results', async () => {
      MockedIntegration.getStrokeOrder.mockResolvedValue(null);

      // First call
      const result1 = await useKanjiStore.getState().loadStrokeOrder('U+9999');
      expect(result1).toBeNull();
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledTimes(1);

      // Second call - should use cached null
      const result2 = await useKanjiStore.getState().loadStrokeOrder('U+9999');
      expect(result2).toBeNull();
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should prevent duplicate concurrent fetches', async () => {
      // Simulate slow fetch
      MockedIntegration.getStrokeOrder.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStrokePaths), 100))
      );

      // Start two fetches simultaneously
      const promise1 = useKanjiStore.getState().loadStrokeOrder('U+4E00');
      const promise2 = useKanjiStore.getState().loadStrokeOrder('U+4E00');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockStrokePaths);
      expect(result2).toEqual(mockStrokePaths);
      expect(MockedIntegration.getStrokeOrder).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should handle errors gracefully', async () => {
      MockedIntegration.getStrokeOrder.mockRejectedValue(new Error('Network error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await useKanjiStore.getState().loadStrokeOrder('U+4E00');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadStrokeOrderBatch', () => {
    it('should load multiple kanji in parallel', async () => {
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);

      const kanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09'];
      await useKanjiStore.getState().loadStrokeOrderBatch(kanjiIds);

      // Verify all cached
      const cache = useKanjiStore.getState().strokeDataCache;
      expect(cache.get('U+4E00')).toEqual(mockStrokePaths);
      expect(cache.get('U+4E8C')).toEqual(mockStrokePaths);
      expect(cache.get('U+4E09')).toEqual(mockStrokePaths);
    });

    it('should handle mixed success and failure', async () => {
      MockedIntegration.getStrokeOrder
        .mockResolvedValueOnce(mockStrokePaths) // U+4E00 succeeds
        .mockResolvedValueOnce(null) // U+FFFF fails
        .mockResolvedValueOnce(mockStrokePaths); // U+4E09 succeeds

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await useKanjiStore.getState().loadStrokeOrderBatch(['U+4E00', 'U+FFFF', 'U+4E09']);

      const cache = useKanjiStore.getState().strokeDataCache;
      expect(cache.get('U+4E00')).toEqual(mockStrokePaths);
      expect(cache.get('U+FFFF')).toBeNull();
      expect(cache.get('U+4E09')).toEqual(mockStrokePaths);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasStrokeData', () => {
    it('should return true if in cache', async () => {
      // Pre-populate cache
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);
      await useKanjiStore.getState().loadStrokeOrder('U+4E00');

      const result = await useKanjiStore.getState().hasStrokeData('U+4E00');

      expect(result).toBe(true);
      expect(MockedIntegration.hasStrokeData).not.toHaveBeenCalled(); // Used cache
    });

    it('should delegate to integration service if not cached', async () => {
      MockedIntegration.hasStrokeData.mockResolvedValue(true);

      const result = await useKanjiStore.getState().hasStrokeData('U+4E00');

      expect(result).toBe(true);
      expect(MockedIntegration.hasStrokeData).toHaveBeenCalledWith('U+4E00');
    });

    it('should return false for cached null', async () => {
      // Pre-populate cache with null
      MockedIntegration.getStrokeOrder.mockResolvedValue(null);
      await useKanjiStore.getState().loadStrokeOrder('U+9999');

      const result = await useKanjiStore.getState().hasStrokeData('U+9999');

      expect(result).toBe(false);
    });
  });

  describe('getStrokeDataTier', () => {
    it('should return tier from integration service', async () => {
      MockedIntegration.getKanjiTier.mockResolvedValue('bundled');

      const result = await useKanjiStore.getState().getStrokeDataTier('U+4E00');

      expect(result).toBe('bundled');
      expect(MockedIntegration.getKanjiTier).toHaveBeenCalledWith('U+4E00');
    });

    it('should handle all tier types', async () => {
      MockedIntegration.getKanjiTier
        .mockResolvedValueOnce('bundled')
        .mockResolvedValueOnce('cached')
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('unavailable');

      expect(await useKanjiStore.getState().getStrokeDataTier('U+4E00')).toBe('bundled');
      expect(await useKanjiStore.getState().getStrokeDataTier('U+4E8C')).toBe('cached');
      expect(await useKanjiStore.getState().getStrokeDataTier('U+4E09')).toBe('available');
      expect(await useKanjiStore.getState().getStrokeDataTier('U+9999')).toBe('unavailable');
    });
  });

  describe('clearStrokeCache', () => {
    it('should clear in-memory cache', async () => {
      // Pre-populate cache
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);
      await useKanjiStore.getState().loadStrokeOrder('U+4E00');
      await useKanjiStore.getState().loadStrokeOrder('U+4E8C');

      expect(useKanjiStore.getState().strokeDataCache.size).toBe(2);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      MockedIntegration.clearMemoryCache.mockImplementation();

      useKanjiStore.getState().clearStrokeCache();

      expect(useKanjiStore.getState().strokeDataCache.size).toBe(0);
      expect(useKanjiStore.getState().loadingStrokeData.size).toBe(0);
      expect(MockedIntegration.clearMemoryCache).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Stroke data cache cleared');

      consoleLogSpy.mockRestore();
    });
  });

  describe('integration', () => {
    it('should work end-to-end', async () => {
      MockedIntegration.initialize.mockResolvedValue(undefined);
      MockedIntegration.getStrokeOrder.mockResolvedValue(mockStrokePaths);
      MockedIntegration.hasStrokeData.mockResolvedValue(true);
      MockedIntegration.getKanjiTier.mockResolvedValue('bundled');

      // Initialize
      await useKanjiStore.getState().initializeKanjiVG();

      // Load stroke order
      const strokeOrder = await useKanjiStore.getState().loadStrokeOrder('U+4E00');
      expect(strokeOrder).toEqual(mockStrokePaths);

      // Check has data
      const hasData = await useKanjiStore.getState().hasStrokeData('U+4E00');
      expect(hasData).toBe(true);

      // Check tier
      const tier = await useKanjiStore.getState().getStrokeDataTier('U+4E00');
      expect(tier).toBe('bundled');

      // Clear cache
      useKanjiStore.getState().clearStrokeCache();
      expect(useKanjiStore.getState().strokeDataCache.size).toBe(0);
    });
  });
});
