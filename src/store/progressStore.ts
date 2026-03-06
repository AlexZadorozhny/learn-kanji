import { create } from 'zustand';
import { KanjiProgress, StudyStats } from '../types/progress';
import { StorageService } from '../services/storage/StorageService';

interface ProgressStore {
  kanjiProgress: Record<string, KanjiProgress>;
  studyStats: StudyStats;
  isLoaded: boolean;
  updateKanjiProgress: (kanjiId: string, progress: Partial<KanjiProgress>) => void;
  getKanjiProgress: (kanjiId: string) => KanjiProgress | undefined;
  updateStudyStats: (stats: Partial<StudyStats>) => void;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  clearProgress: () => Promise<void>;
}

const initialStudyStats: StudyStats = {
  totalKanjiStudied: 0,
  kanjiMastered: 0,
  totalStudyTimeMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: new Date().toISOString(),
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  kanjiProgress: {},
  studyStats: initialStudyStats,
  isLoaded: false,

  updateKanjiProgress: (kanjiId, progress) => {
    set((state) => ({
      kanjiProgress: {
        ...state.kanjiProgress,
        [kanjiId]: {
          ...(state.kanjiProgress[kanjiId] || {
            kanjiId,
            status: 'new',
            recognitionScore: 0,
            writingScore: 0,
            readingScore: 0,
            contextScore: 0,
            lastReviewed: new Date().toISOString(),
            nextReview: new Date().toISOString(),
            totalAttempts: 0,
            correctAttempts: 0,
            mistakeHistory: [],
            easinessFactor: 2.5,
            interval: 0,
            repetitions: 0,
          }),
          ...progress,
        },
      },
    }));
    // Auto-save after update
    get().saveProgress();
  },

  getKanjiProgress: (kanjiId) => {
    return get().kanjiProgress[kanjiId];
  },

  updateStudyStats: (stats) => {
    set((state) => ({
      studyStats: {
        ...state.studyStats,
        ...stats,
      },
    }));
    // Auto-save after update
    get().saveProgress();
  },

  loadProgress: async () => {
    try {
      const [savedProgress, savedStats] = await Promise.all([
        StorageService.getUserProgress<Record<string, KanjiProgress>>(),
        StorageService.getStudyStats<StudyStats>(),
      ]);

      set({
        kanjiProgress: savedProgress || {},
        studyStats: savedStats || initialStudyStats,
        isLoaded: true,
      });

      console.log('Progress loaded from storage');
    } catch (error) {
      console.error('Failed to load progress:', error);
      set({ isLoaded: true });
    }
  },

  saveProgress: async () => {
    try {
      const { kanjiProgress, studyStats } = get();
      await Promise.all([
        StorageService.saveUserProgress(kanjiProgress),
        StorageService.saveStudyStats(studyStats),
      ]);
      console.log('Progress saved to storage');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  clearProgress: async () => {
    try {
      await StorageService.clearAll();
      set({
        kanjiProgress: {},
        studyStats: initialStudyStats,
      });
      console.log('Progress cleared');
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  },
}));
