/**
 * KanjiVGFetcherService
 *
 * Downloads SVG files from KanjiVG GitHub repository and manages AsyncStorage caching.
 *
 * Features:
 * - Download from GitHub raw URL
 * - Permanent AsyncStorage caching
 * - LRU eviction if cache exceeds 50MB
 * - Retry logic with exponential backoff
 * - Prefetch support for background downloading
 *
 * Data Attribution:
 * KanjiVG data © Ulrich Apel, CC BY-SA 3.0
 * https://kanjivg.tagaini.net/
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FetchOptions {
  cacheOnly?: boolean; // Only check cache, don't fetch from network
  forceRefresh?: boolean; // Skip cache, always fetch fresh
  timeout?: number; // Network timeout in milliseconds (default: 10000)
}

export interface CacheStats {
  count: number;
  sizeBytes: number;
}

export class KanjiVGFetcherService {
  private static readonly GITHUB_BASE_URL =
    'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/';
  private static readonly CACHE_KEY_PREFIX = '@kanjivg_cache/';
  private static readonly CACHE_METADATA_KEY = '@kanjivg_cache_metadata';
  private static readonly MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAY_BASE = 1000; // 1 second

  /**
   * Main entry point: Get SVG content with caching
   *
   * @param kanjiId - Kanji ID (e.g., "U+4E00")
   * @param options - Fetch options
   * @returns SVG content string, or null if not found
   */
  static async getKanjiSVG(
    kanjiId: string,
    options: FetchOptions = {}
  ): Promise<string | null> {
    const { cacheOnly = false, forceRefresh = false, timeout = this.DEFAULT_TIMEOUT } = options;

    try {
      // Check cache first (unless forceRefresh)
      if (!forceRefresh) {
        const cached = await this.getFromCache(kanjiId);
        if (cached) {
          return cached;
        }
      }

      // If cache-only mode and not in cache, return null
      if (cacheOnly) {
        return null;
      }

      // Download from GitHub
      const svgContent = await this.fetchFromGitHub(kanjiId, timeout);

      if (svgContent) {
        // Save to cache
        await this.saveToCache(kanjiId, svgContent);
        return svgContent;
      }

      return null;
    } catch (error) {
      console.error(`KanjiVGFetcher: Failed to get SVG for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Download SVG from GitHub with retry logic
   *
   * @param kanjiId - Kanji ID (e.g., "U+4E00")
   * @param timeout - Network timeout in milliseconds
   * @returns SVG content string, or null if not found
   */
  private static async fetchFromGitHub(kanjiId: string, timeout: number): Promise<string | null> {
    const url = this.buildKanjiVGUrl(kanjiId);

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const svgContent = await response.text();
          return svgContent;
        }

        if (response.status === 404) {
          console.warn(`KanjiVGFetcher: Kanji not found in KanjiVG dataset: ${kanjiId}`);
          return null;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error: any) {
        const isLastAttempt = attempt === this.MAX_RETRIES;

        if (error.name === 'AbortError') {
          console.warn(
            `KanjiVGFetcher: Timeout fetching ${kanjiId} (attempt ${attempt + 1}/${
              this.MAX_RETRIES + 1
            })`
          );
        } else {
          console.warn(
            `KanjiVGFetcher: Network error fetching ${kanjiId} (attempt ${attempt + 1}/${
              this.MAX_RETRIES + 1
            }):`,
            error.message
          );
        }

        if (isLastAttempt) {
          // Last attempt failed, give up
          return null;
        }

        // Wait before retry (exponential backoff)
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }

  /**
   * Build GitHub raw URL for kanji
   *
   * Format: U+4E00 → 04e00.svg
   * - Remove "U+" prefix
   * - Convert to lowercase
   * - Pad to 5 hex digits with leading zeros
   * - Append ".svg"
   *
   * @param kanjiId - Kanji ID (e.g., "U+4E00")
   * @returns Full GitHub raw URL
   */
  private static buildKanjiVGUrl(kanjiId: string): string {
    // Extract hex code (remove "U+" prefix)
    const hexCode = kanjiId.replace(/^U\+/i, '').toLowerCase();

    // Pad to 5 digits (e.g., "4e00" → "04e00")
    const paddedHex = hexCode.padStart(5, '0');

    // Build full URL
    return `${this.GITHUB_BASE_URL}${paddedHex}.svg`;
  }

  /**
   * Get SVG from AsyncStorage cache
   *
   * @param kanjiId - Kanji ID
   * @returns Cached SVG content, or null if not cached
   */
  private static async getFromCache(kanjiId: string): Promise<string | null> {
    try {
      const cacheKey = this.CACHE_KEY_PREFIX + kanjiId;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        // Update LRU metadata (mark as recently accessed)
        await this.updateAccessTime(kanjiId);
      }

      return cached;
    } catch (error) {
      console.error(`KanjiVGFetcher: Cache read error for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Save SVG to AsyncStorage cache with LRU eviction
   *
   * @param kanjiId - Kanji ID
   * @param svgContent - SVG content string
   */
  private static async saveToCache(kanjiId: string, svgContent: string): Promise<void> {
    try {
      // Check cache size and evict if necessary
      const stats = await this.getCacheStats();
      const newItemSize = new Blob([svgContent]).size;

      if (stats.sizeBytes + newItemSize > this.MAX_CACHE_SIZE_BYTES) {
        await this.evictLRU(newItemSize);
      }

      // Save to cache
      const cacheKey = this.CACHE_KEY_PREFIX + kanjiId;
      await AsyncStorage.setItem(cacheKey, svgContent);

      // Update metadata
      await this.updateAccessTime(kanjiId);
    } catch (error) {
      console.error(`KanjiVGFetcher: Cache write error for ${kanjiId}:`, error);
      // Non-blocking error - continue without caching
    }
  }

  /**
   * Update access time for LRU tracking
   *
   * @param kanjiId - Kanji ID
   */
  private static async updateAccessTime(kanjiId: string): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.CACHE_METADATA_KEY);
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};

      metadata[kanjiId] = Date.now();

      await AsyncStorage.setItem(this.CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('KanjiVGFetcher: Failed to update access time:', error);
    }
  }

  /**
   * Evict least recently used items to make room for new items
   *
   * @param requiredSpace - Bytes needed for new item
   */
  private static async evictLRU(requiredSpace: number): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.CACHE_METADATA_KEY);
      if (!metadataStr) return;

      const metadata = JSON.parse(metadataStr);

      // Sort by access time (oldest first)
      const sortedEntries = Object.entries(metadata).sort(
        ([, aTime], [, bTime]) => (aTime as number) - (bTime as number)
      );

      let freedSpace = 0;
      const toDelete: string[] = [];

      for (const [kanjiId] of sortedEntries) {
        // Get item size
        const cacheKey = this.CACHE_KEY_PREFIX + kanjiId;
        const item = await AsyncStorage.getItem(cacheKey);

        if (item) {
          const itemSize = new Blob([item]).size;
          toDelete.push(kanjiId);
          freedSpace += itemSize;

          if (freedSpace >= requiredSpace) {
            break;
          }
        }
      }

      // Delete items
      for (const kanjiId of toDelete) {
        const cacheKey = this.CACHE_KEY_PREFIX + kanjiId;
        await AsyncStorage.removeItem(cacheKey);
        delete metadata[kanjiId];
      }

      // Update metadata
      await AsyncStorage.setItem(this.CACHE_METADATA_KEY, JSON.stringify(metadata));

      console.log(
        `KanjiVGFetcher: Evicted ${toDelete.length} items (${(freedSpace / 1024).toFixed(1)} KB)`
      );
    } catch (error) {
      console.error('KanjiVGFetcher: LRU eviction failed:', error);
    }
  }

  /**
   * Check if kanji is cached
   *
   * @param kanjiId - Kanji ID
   * @returns true if cached, false otherwise
   */
  static async isCached(kanjiId: string): Promise<boolean> {
    try {
      const cacheKey = this.CACHE_KEY_PREFIX + kanjiId;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache stats (count and size)
   */
  static async getCacheStats(): Promise<CacheStats> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));

      let totalSize = 0;

      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      }

      return {
        count: cacheKeys.length,
        sizeBytes: totalSize,
      };
    } catch (error) {
      console.error('KanjiVGFetcher: Failed to get cache stats:', error);
      return { count: 0, sizeBytes: 0 };
    }
  }

  /**
   * Clear all cached kanji data
   */
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));

      // Remove all cache entries
      await AsyncStorage.multiRemove(cacheKeys);

      // Remove metadata
      await AsyncStorage.removeItem(this.CACHE_METADATA_KEY);

      console.log(`KanjiVGFetcher: Cleared cache (${cacheKeys.length} items)`);
    } catch (error) {
      console.error('KanjiVGFetcher: Failed to clear cache:', error);
    }
  }

  /**
   * Prefetch multiple kanji in background
   *
   * Useful for preloading common kanji or user's upcoming study set.
   * Downloads happen in parallel with configurable concurrency.
   * Silent failures (logs only).
   *
   * @param kanjiIds - Array of kanji IDs to prefetch
   * @param maxConcurrent - Maximum concurrent downloads (default: 5)
   */
  static async prefetchKanji(kanjiIds: string[], maxConcurrent: number = 5): Promise<void> {
    try {
      // Filter out already cached kanji
      const uncached: string[] = [];
      for (const kanjiId of kanjiIds) {
        const cached = await this.isCached(kanjiId);
        if (!cached) {
          uncached.push(kanjiId);
        }
      }

      if (uncached.length === 0) {
        console.log('KanjiVGFetcher: All kanji already cached');
        return;
      }

      console.log(`KanjiVGFetcher: Prefetching ${uncached.length} kanji...`);

      // Process in batches of maxConcurrent
      for (let i = 0; i < uncached.length; i += maxConcurrent) {
        const batch = uncached.slice(i, i + maxConcurrent);

        await Promise.all(
          batch.map(async kanjiId => {
            try {
              await this.getKanjiSVG(kanjiId);
            } catch (error) {
              // Silent failure - just log
              console.warn(`KanjiVGFetcher: Prefetch failed for ${kanjiId}`);
            }
          })
        );
      }

      console.log(`KanjiVGFetcher: Prefetch complete`);
    } catch (error) {
      console.error('KanjiVGFetcher: Prefetch error:', error);
    }
  }
}
