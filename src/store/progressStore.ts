import { create } from 'zustand';
import { KanjiProgress, StudyStats } from '../types/progress';

interface ProgressStore {
  kanjiProgress: Record<string, KanjiProgress>;
  studyStats: StudyStats;
  updateKanjiProgress: (kanjiId: string, progress: Partial<KanjiProgress>) => void;
  getKanjiProgress: (kanjiId: string) => KanjiProgress | undefined;
  updateStudyStats: (stats: Partial<StudyStats>) => void;
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
  },
}));
