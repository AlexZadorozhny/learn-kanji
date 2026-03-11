/**
 * KanjiVGIntegrationService
 *
 * High-level coordinator that combines KanjiVGParserService and KanjiVGFetcherService
 * to provide a simple API for getting stroke order data.
 *
 * Three-Tier Strategy:
 * 1. Tier 1 (Bundled): Pre-bundled 25 kanji from sampleKanjiData in app bundle (~100KB)
 * 2. Tier 2 (On-Demand): Downloaded from GitHub and cached in AsyncStorage (6,330+ kanji)
 * 3. Tier 3 (Legacy): Original manual strokeOrder as fallback (deprecated after migration)
 *
 * Data Flow:
 * 1. Check in-memory cache
 * 2. Check if bundled (Tier 1)
 * 3. Check AsyncStorage cache (Tier 2)
 * 4. Fetch from GitHub (Tier 2, first time)
 * 5. Check legacy fallback (Tier 3)
 * 6. Return null (unavailable)
 *
 * Data Attribution:
 * KanjiVG data © Ulrich Apel, CC BY-SA 3.0
 * https://kanjivg.tagaini.net/
 */

import { StrokePath } from '../../types/kanji';
import { KanjiVGParserService } from './KanjiVGParserService';
import { KanjiVGFetcherService } from './KanjiVGFetcherService';
import { sampleKanjiData } from '../../data/sample-data';
import { BUNDLED_KANJI_IDS, isBundled, getBundledSVG } from '../../data/kanjivg-bundled';

export type KanjiTier = 'bundled' | 'cached' | 'available' | 'unavailable';

export class KanjiVGIntegrationService {
  // In-memory cache for this session
  private static strokeDataCache: Map<string, StrokePath[] | null> = new Map();

  // Bundled kanji IDs (will be populated from bundle index)
  private static bundledKanjiIds: Set<string> = new Set();

  // Feature flag
  private static initialized: boolean = false;

  /**
   * Initialize the integration service
   * Should be called on app startup
   */
  static async initialize(): Promise<void> {
    try {
      // Load bundled kanji IDs from bundle index
      this.bundledKanjiIds = new Set(BUNDLED_KANJI_IDS);

      this.initialized = true;
      console.log(
        `KanjiVGIntegration: Initialized with ${this.bundledKanjiIds.size} bundled kanji`
      );
    } catch (error) {
      console.error('KanjiVGIntegration: Initialization failed:', error);
      // Non-blocking error - app continues with legacy data
    }
  }

  /**
   * Main API: Get stroke order for any kanji
   *
   * @param kanjiId - Kanji ID (e.g., "U+4E00")
   * @returns Array of StrokePath objects, or null if unavailable
   */
  static async getStrokeOrder(kanjiId: string): Promise<StrokePath[] | null> {
    try {
      // 1. Check in-memory cache
      if (this.strokeDataCache.has(kanjiId)) {
        return this.strokeDataCache.get(kanjiId)!;
      }

      // 2. Check if bundled (Tier 1)
      if (this.bundledKanjiIds.has(kanjiId)) {
        const strokeOrder = await this.loadFromBundle(kanjiId);
        if (strokeOrder) {
          this.strokeDataCache.set(kanjiId, strokeOrder);
          return strokeOrder;
        }
      }

      // 3. Check AsyncStorage cache (Tier 2)
      const cached = await this.loadFromCache(kanjiId);
      if (cached) {
        this.strokeDataCache.set(kanjiId, cached);
        return cached;
      }

      // 4. Fetch from GitHub (Tier 2, first time)
      const fetched = await this.fetchFromGitHub(kanjiId);
      if (fetched) {
        this.strokeDataCache.set(kanjiId, fetched);
        return fetched;
      }

      // 5. Check legacy fallback (Tier 3)
      const legacy = this.getLegacyStrokeOrder(kanjiId);
      if (legacy) {
        this.strokeDataCache.set(kanjiId, legacy);
        return legacy;
      }

      // 6. Not found - cache null to avoid repeated failed lookups
      this.strokeDataCache.set(kanjiId, null);
      return null;
    } catch (error) {
      console.error(`KanjiVGIntegration: Failed to get stroke order for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Load multiple kanji in parallel
   *
   * @param kanjiIds - Array of kanji IDs
   * @returns Map of kanji ID to StrokePath array
   */
  static async loadStrokeOrderBatch(kanjiIds: string[]): Promise<Map<string, StrokePath[]>> {
    const results = new Map<string, StrokePath[]>();

    // Load in parallel
    const promises = kanjiIds.map(async (id) => {
      const strokeOrder = await this.getStrokeOrder(id);
      if (strokeOrder) {
        results.set(id, strokeOrder);
      }
    });

    await Promise.all(promises);

    return results;
  }

  /**
   * Check if kanji has stroke data available
   *
   * @param kanjiId - Kanji ID
   * @returns true if available (bundled, cached, or fetchable)
   */
  static async hasStrokeData(kanjiId: string): Promise<boolean> {
    // Check in-memory cache first
    if (this.strokeDataCache.has(kanjiId)) {
      return this.strokeDataCache.get(kanjiId) !== null;
    }

    // Check if bundled
    if (this.bundledKanjiIds.has(kanjiId)) {
      return true;
    }

    // Check if cached
    const isCached = await KanjiVGFetcherService.isCached(kanjiId);
    if (isCached) {
      return true;
    }

    // Check legacy fallback
    const legacy = this.getLegacyStrokeOrder(kanjiId);
    if (legacy) {
      return true;
    }

    // Note: We can't easily check if fetchable without actually fetching
    // So we return false here. Caller can try getStrokeOrder() to fetch.
    return false;
  }

  /**
   * Get kanji tier classification
   *
   * @param kanjiId - Kanji ID
   * @returns Tier: 'bundled', 'cached', 'available', or 'unavailable'
   */
  static async getKanjiTier(kanjiId: string): Promise<KanjiTier> {
    // Check if bundled
    if (this.bundledKanjiIds.has(kanjiId)) {
      return 'bundled';
    }

    // Check if cached
    const isCached = await KanjiVGFetcherService.isCached(kanjiId);
    if (isCached) {
      return 'cached';
    }

    // Check legacy fallback
    const legacy = this.getLegacyStrokeOrder(kanjiId);
    if (legacy) {
      return 'bundled'; // Treat legacy as bundled (always available)
    }

    // Assume available via fetch (optimistic)
    // Real unavailability can only be determined by trying to fetch
    return 'available';
  }

  /**
   * Load from pre-bundled assets (Tier 1)
   *
   * @param kanjiId - Kanji ID
   * @returns Parsed StrokePath array, or null if not bundled
   */
  private static async loadFromBundle(kanjiId: string): Promise<StrokePath[] | null> {
    try {
      // 1. Check if kanji is in bundled registry
      if (!isBundled(kanjiId)) {
        return null;
      }

      // 2. Load SVG content from bundled map
      const svgContent = getBundledSVG(kanjiId);

      if (!svgContent) {
        console.warn(`KanjiVGIntegration: No bundled SVG found for ${kanjiId}`);
        return null;
      }

      // 3. Parse SVG using KanjiVGParserService
      const strokePaths = KanjiVGParserService.parseKanjiVGSVG(svgContent, kanjiId);

      if (!strokePaths || strokePaths.length === 0) {
        console.warn(`KanjiVGIntegration: Bundled SVG for ${kanjiId} parsed to empty paths`);
        return null;
      }

      return strokePaths;
    } catch (error) {
      console.error(`KanjiVGIntegration: Failed to load bundled data for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Load from AsyncStorage cache (Tier 2)
   *
   * @param kanjiId - Kanji ID
   * @returns Parsed StrokePath array, or null if not cached
   */
  private static async loadFromCache(kanjiId: string): Promise<StrokePath[] | null> {
    try {
      const svgContent = await KanjiVGFetcherService.getKanjiSVG(kanjiId, { cacheOnly: true });
      if (!svgContent) {
        return null;
      }

      const strokeOrder = KanjiVGParserService.parseKanjiVGSVG(svgContent, kanjiId);
      return strokeOrder;
    } catch (error) {
      console.error(`KanjiVGIntegration: Failed to load from cache for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Fetch from GitHub (Tier 2, first time)
   *
   * @param kanjiId - Kanji ID
   * @returns Parsed StrokePath array, or null if not found
   */
  private static async fetchFromGitHub(kanjiId: string): Promise<StrokePath[] | null> {
    try {
      const svgContent = await KanjiVGFetcherService.getKanjiSVG(kanjiId);
      if (!svgContent) {
        return null;
      }

      const strokeOrder = KanjiVGParserService.parseKanjiVGSVG(svgContent, kanjiId);
      return strokeOrder;
    } catch (error) {
      console.error(`KanjiVGIntegration: Failed to fetch from GitHub for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Get legacy fallback data (Tier 3)
   *
   * @param kanjiId - Kanji ID
   * @returns Existing strokeOrder from sample data, or null
   */
  private static getLegacyStrokeOrder(kanjiId: string): StrokePath[] | null {
    try {
      const kanji = sampleKanjiData.find((k) => k.id === kanjiId);

      // After Phase 3, strokeOrder will not exist in sampleKanjiData
      // Keep this check for backward compatibility during migration
      if (kanji && kanji.strokeOrder && kanji.strokeOrder.length > 0) {
        // If we're using legacy fallback, it means bundled load failed
        console.warn(
          `KanjiVGIntegration: Using legacy fallback for ${kanjiId} - bundled load may have failed`
        );
        return kanji.strokeOrder;
      }

      return null;
    } catch (error) {
      console.error(`KanjiVGIntegration: Failed to get legacy data for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Clear in-memory cache
   * Useful for testing or memory management
   */
  static clearMemoryCache(): void {
    this.strokeDataCache.clear();
    console.log('KanjiVGIntegration: Memory cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheInfo(): {
    memoryCount: number;
    bundledCount: number;
  } {
    return {
      memoryCount: this.strokeDataCache.size,
      bundledCount: this.bundledKanjiIds.size,
    };
  }

  /**
   * Prefetch kanji for upcoming session
   * Useful for preparing stroke order practice sessions
   *
   * @param kanjiIds - Array of kanji IDs to prefetch
   */
  static async prefetchForSession(kanjiIds: string[]): Promise<void> {
    try {
      console.log(`KanjiVGIntegration: Prefetching ${kanjiIds.length} kanji for session...`);

      // Load all in parallel
      await this.loadStrokeOrderBatch(kanjiIds);

      console.log('KanjiVGIntegration: Prefetch complete');
    } catch (error) {
      console.error('KanjiVGIntegration: Prefetch error:', error);
    }
  }

  /**
   * Check if service is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}
