import { create } from 'zustand';
import { KanjiCharacter } from '../types/kanji';
import { sampleKanjiData } from '../data/sample-data';

interface KanjiStore {
  kanjiData: KanjiCharacter[];
  loading: boolean;
  setKanjiData: (data: KanjiCharacter[]) => void;
  loadKanji: () => void;
  getKanjiById: (id: string) => KanjiCharacter | undefined;
}

export const useKanjiStore = create<KanjiStore>((set, get) => ({
  kanjiData: [],
  loading: false,

  setKanjiData: (data) => set({ kanjiData: data }),

  loadKanji: () => {
    set({ loading: true });
    // Simulate loading from storage (for now, just use sample data)
    setTimeout(() => {
      set({ kanjiData: sampleKanjiData, loading: false });
    }, 100);
  },

  getKanjiById: (id) => {
    return get().kanjiData.find(kanji => kanji.id === id);
  },
}));
