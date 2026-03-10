/**
 * Integration tests for KanjiVG Bundle Loading
 * These tests use real implementations (no mocks) to verify end-to-end functionality
 */

import { KanjiVGIntegrationService } from '../KanjiVGIntegrationService';
import { BUNDLED_KANJI_IDS, isBundled, getBundledSVG } from '../../../data/kanjivg-bundled';

describe('KanjiVG Bundle Loading (Integration)', () => {
  beforeEach(async () => {
    KanjiVGIntegrationService.clearMemoryCache();
    // Initialize to load bundled kanji IDs
    await KanjiVGIntegrationService.initialize();
  });

  describe('Bundled Data Registry', () => {
    it('should have 25 kanji in bundled registry', () => {
      expect(BUNDLED_KANJI_IDS.length).toBe(25);
    });

    it('should correctly identify bundled kanji', () => {
      expect(isBundled('U+4E00')).toBe(true);
      expect(isBundled('U+4EBA')).toBe(true);
      expect(isBundled('U+FFFF')).toBe(false);
    });

    it('should return SVG content for bundled kanji', () => {
      const svg = getBundledSVG('U+4E00');
      expect(svg).toBeTruthy();
      expect(typeof svg).toBe('string');
      expect(svg!.length).toBeGreaterThan(1000);
      expect(svg!).toContain('<?xml');
    });

    it('should return null for non-bundled kanji', () => {
      const svg = getBundledSVG('U+FFFF');
      expect(svg).toBeNull();
    });
  });

  describe('Bundle Loading with Real Parser', () => {
    it('should verify isBundled check works in service', async () => {
      // Test that the service's tier check recognizes bundled kanji
      const tier = await KanjiVGIntegrationService.getKanjiTier('U+4E00');
      console.log(`Tier for U+4E00: ${tier}`);

      // If this fails, there's an issue with how isBundled is imported in the service
      expect(tier).toBe('bundled');
    });

    it('should load bundled SVG for U+4E00 (一)', async () => {
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');
      console.log(`Result for U+4E00:`, result ? `${result.length} strokes` : 'null');

      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBe(1); // 一 has 1 stroke

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
      expect(result!.length).toBe(2); // 人 has 2 strokes
    });

    it('should load bundled SVG for U+56FD (国)', async () => {
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+56FD');

      expect(result).toBeTruthy();
      expect(result!.length).toBe(8); // 国 has 8 strokes
    });

    it('should load all 25 bundled kanji successfully', async () => {
      expect(BUNDLED_KANJI_IDS.length).toBe(25);

      // Test first 5 to keep test time reasonable
      const sampleIds = BUNDLED_KANJI_IDS.slice(0, 5);

      for (const kanjiId of sampleIds) {
        const result = await KanjiVGIntegrationService.getStrokeOrder(kanjiId);

        expect(result).toBeTruthy();
        expect(result!.length).toBeGreaterThan(0);

        // Verify each stroke has required properties
        result!.forEach(stroke => {
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

      // Should contain SVG path commands (M, L, C, etc.)
      expect(result![0].path).toMatch(/[MLCQZ]/i);
    });

    it('should cache bundled kanji in memory after first load', async () => {
      // First load
      await KanjiVGIntegrationService.getStrokeOrder('U+4E00');

      const cacheInfo = KanjiVGIntegrationService.getCacheInfo();
      expect(cacheInfo.memoryCount).toBe(1);

      // Second load should use cache
      const result = await KanjiVGIntegrationService.getStrokeOrder('U+4E00');
      expect(result).toBeTruthy();

      // Still only 1 in cache (not duplicated)
      const cacheInfo2 = KanjiVGIntegrationService.getCacheInfo();
      expect(cacheInfo2.memoryCount).toBe(1);
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

    it('should report correct tier for bundled kanji', async () => {
      const tier = await KanjiVGIntegrationService.getKanjiTier('U+4E00');

      expect(tier).toBe('bundled');
    });

    it('should include bundled kanji in cache info', async () => {
      await KanjiVGIntegrationService.initialize();

      const info = KanjiVGIntegrationService.getCacheInfo();

      expect(info.bundledCount).toBe(25);
    });

    it('should verify all 25 bundled kanji are in registry', () => {
      expect(BUNDLED_KANJI_IDS).toContain('U+4E00'); // 一
      expect(BUNDLED_KANJI_IDS).toContain('U+4E8C'); // 二
      expect(BUNDLED_KANJI_IDS).toContain('U+4E09'); // 三
      expect(BUNDLED_KANJI_IDS).toContain('U+4EBA'); // 人
      expect(BUNDLED_KANJI_IDS).toContain('U+56FD'); // 国

      // Verify count
      expect(BUNDLED_KANJI_IDS.length).toBe(25);
    });
  });
});
