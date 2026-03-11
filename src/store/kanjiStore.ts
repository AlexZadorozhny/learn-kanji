import { create } from 'zustand';
import { KanjiCharacter, StrokePath } from '../types/kanji';
import { sampleKanjiData } from '../data/sample-data';
import {
  KanjiVGIntegrationService,
  KanjiTier,
} from '../services/kanjivg/KanjiVGIntegrationService';

interface KanjiStore {
  // Existing fields
  kanjiData: KanjiCharacter[];
  loading: boolean;
  setKanjiData: (data: KanjiCharacter[]) => void;
  loadKanji: () => void;
  getKanjiById: (id: string) => KanjiCharacter | undefined;

  // KanjiVG integration
  strokeDataCache: Map<string, StrokePath[] | null>;
  loadingStrokeData: Set<string>;

  // KanjiVG methods
  loadStrokeOrder: (kanjiId: string) => Promise<StrokePath[] | null>;
  loadStrokeOrderBatch: (kanjiIds: string[]) => Promise<void>;
  hasStrokeData: (kanjiId: string) => Promise<boolean>;
  getStrokeDataTier: (kanjiId: string) => Promise<KanjiTier>;
  clearStrokeCache: () => void;
  initializeKanjiVG: () => Promise<void>;
}

export const useKanjiStore = create<KanjiStore>((set, get) => ({
  // Existing state
  kanjiData: [],
  loading: false,

  // KanjiVG state
  strokeDataCache: new Map(),
  loadingStrokeData: new Set(),

  // Existing methods
  setKanjiData: (data) => set({ kanjiData: data }),

  loadKanji: () => {
    set({ loading: true });
    // Simulate loading from storage (for now, just use sample data)
    setTimeout(() => {
      set({ kanjiData: sampleKanjiData, loading: false });
    }, 100);
  },

  getKanjiById: (id) => {
    return get().kanjiData.find((kanji) => kanji.id === id);
  },

  // KanjiVG methods

  /**
   * Initialize KanjiVG integration service
   * Should be called on app startup
   */
  initializeKanjiVG: async () => {
    try {
      await KanjiVGIntegrationService.initialize();
    } catch (error) {
      console.error('Failed to initialize KanjiVG:', error);
    }
  },

  /**
   * Load stroke order for a single kanji
   */
  loadStrokeOrder: async (kanjiId: string): Promise<StrokePath[] | null> => {
    const { strokeDataCache, loadingStrokeData } = get();

    // 1. Check in-memory cache
    if (strokeDataCache.has(kanjiId)) {
      return strokeDataCache.get(kanjiId)!;
    }

    // 2. Prevent duplicate concurrent fetches
    if (loadingStrokeData.has(kanjiId)) {
      // Wait for ongoing fetch to complete
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!get().loadingStrokeData.has(kanjiId)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      return get().strokeDataCache.get(kanjiId) ?? null;
    }

    // 3. Mark as loading
    set((state) => ({
      loadingStrokeData: new Set([...state.loadingStrokeData, kanjiId]),
    }));

    try {
      // 4. Fetch via integration service
      const strokeData = await KanjiVGIntegrationService.getStrokeOrder(kanjiId);

      // 5. Cache result (even if null to avoid repeated failed fetches)
      set((state) => ({
        strokeDataCache: new Map(state.strokeDataCache).set(kanjiId, strokeData),
        loadingStrokeData: new Set([...state.loadingStrokeData].filter((id) => id !== kanjiId)),
      }));

      return strokeData;
    } catch (error) {
      console.error(`Failed to load stroke order for ${kanjiId}:`, error);

      // Remove from loading set
      set((state) => ({
        loadingStrokeData: new Set([...state.loadingStrokeData].filter((id) => id !== kanjiId)),
      }));

      return null;
    }
  },

  /**
   * Load stroke order for multiple kanji in parallel
   */
  loadStrokeOrderBatch: async (kanjiIds: string[]): Promise<void> => {
    await Promise.all(kanjiIds.map((id) => get().loadStrokeOrder(id)));
  },

  /**
   * Check if kanji has stroke data available
   */
  hasStrokeData: async (kanjiId: string): Promise<boolean> => {
    // Check cache first
    if (get().strokeDataCache.has(kanjiId)) {
      return get().strokeDataCache.get(kanjiId) !== null;
    }

    // Delegate to integration service
    return await KanjiVGIntegrationService.hasStrokeData(kanjiId);
  },

  /**
   * Get kanji tier (bundled, cached, available, unavailable)
   */
  getStrokeDataTier: async (kanjiId: string): Promise<KanjiTier> => {
    return await KanjiVGIntegrationService.getKanjiTier(kanjiId);
  },

  /**
   * Clear stroke data cache
   */
  clearStrokeCache: () => {
    set({
      strokeDataCache: new Map(),
      loadingStrokeData: new Set(),
    });
    KanjiVGIntegrationService.clearMemoryCache();
    console.log('Stroke data cache cleared');
  },
}));
