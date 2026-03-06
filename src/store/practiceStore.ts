import { create } from 'zustand';
import { PracticeSession, PracticeResult } from '../types/practice';

interface PracticeStore {
  currentSession: PracticeSession | null;
  startSession: (mode: PracticeSession['mode'], kanjiIds: string[]) => void;
  endSession: () => void;
  addResult: (result: PracticeResult) => void;
  nextCard: () => void;
  getSessionResults: () => PracticeResult[];
  getSessionProgress: () => { current: number; total: number };
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  currentSession: null,

  startSession: (mode, kanjiIds) => {
    const session: PracticeSession = {
      id: `session_${Date.now()}`,
      mode,
      kanjiIds,
      startTime: new Date().toISOString(),
      completed: false,
      currentIndex: 0,
      results: [],
    };
    set({ currentSession: session });
  },

  endSession: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          endTime: new Date().toISOString(),
          completed: true,
        },
      });
    }
  },

  addResult: (result) => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          results: [...session.results, result],
        },
      });
    }
  },

  nextCard: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          currentIndex: session.currentIndex + 1,
        },
      });
    }
  },

  getSessionResults: () => {
    return get().currentSession?.results || [];
  },

  getSessionProgress: () => {
    const session = get().currentSession;
    return {
      current: session?.currentIndex || 0,
      total: session?.kanjiIds.length || 0,
    };
  },
}));
