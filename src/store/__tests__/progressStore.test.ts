import { useProgressStore } from '../progressStore';
import { StorageService } from '../../services/storage/StorageService';
import { KanjiProgress } from '../../types/progress';

// Mock StorageService
jest.mock('../../services/storage/StorageService', () => ({
  StorageService: {
    getUserProgress: jest.fn(() => Promise.resolve(null)),
    getStudyStats: jest.fn(() => Promise.resolve(null)),
    saveUserProgress: jest.fn(() => Promise.resolve()),
    saveStudyStats: jest.fn(() => Promise.resolve()),
    clearAll: jest.fn(() => Promise.resolve()),
  },
}));

const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('progressStore', () => {
  const initialStudyStats = {
    totalKanjiStudied: 0,
    kanjiMastered: 0,
    totalStudyTimeMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: expect.any(String),
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    useProgressStore.setState({
      kanjiProgress: {},
      studyStats: {
        totalKanjiStudied: 0,
        kanjiMastered: 0,
        totalStudyTimeMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: new Date().toISOString(),
      },
      isLoaded: false,
    });
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = useProgressStore.getState();

    expect(state.kanjiProgress).toEqual({});
    expect(state.studyStats).toMatchObject(initialStudyStats);
    expect(state.isLoaded).toBe(false);
  });

  it('updateKanjiProgress creates new progress entry', async () => {
    const progressUpdate: Partial<KanjiProgress> = {
      recognitionScore: 75,
      status: 'learning',
      totalAttempts: 1,
      correctAttempts: 1,
    };

    useProgressStore.getState().updateKanjiProgress('U+4E00', progressUpdate);

    // Wait for async saveProgress to be called
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = useProgressStore.getState();
    expect(state.kanjiProgress['U+4E00']).toBeDefined();
    expect(state.kanjiProgress['U+4E00'].kanjiId).toBe('U+4E00');
    expect(state.kanjiProgress['U+4E00'].recognitionScore).toBe(75);
    expect(state.kanjiProgress['U+4E00'].status).toBe('learning');
    expect(state.kanjiProgress['U+4E00'].totalAttempts).toBe(1);
    expect(state.kanjiProgress['U+4E00'].correctAttempts).toBe(1);
  });

  it('updateKanjiProgress updates existing progress entry', async () => {
    const initialProgress: KanjiProgress = {
      kanjiId: 'U+4E00',
      status: 'new',
      recognitionScore: 50,
      writingScore: 0,
      readingScore: 0,
      contextScore: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      totalAttempts: 1,
      correctAttempts: 0,
      mistakeHistory: [],
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    useProgressStore.setState({
      kanjiProgress: {
        'U+4E00': initialProgress,
      },
    });

    const progressUpdate: Partial<KanjiProgress> = {
      recognitionScore: 75,
      status: 'learning',
      totalAttempts: 2,
      correctAttempts: 1,
    };

    useProgressStore.getState().updateKanjiProgress('U+4E00', progressUpdate);

    // Wait for async saveProgress
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = useProgressStore.getState();
    expect(state.kanjiProgress['U+4E00'].recognitionScore).toBe(75);
    expect(state.kanjiProgress['U+4E00'].status).toBe('learning');
    expect(state.kanjiProgress['U+4E00'].totalAttempts).toBe(2);
    expect(state.kanjiProgress['U+4E00'].correctAttempts).toBe(1);
  });

  it('updateKanjiProgress calls saveProgress', async () => {
    const progressUpdate: Partial<KanjiProgress> = {
      recognitionScore: 75,
    };

    useProgressStore.getState().updateKanjiProgress('U+4E00', progressUpdate);

    // Wait for async saveProgress
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStorageService.saveUserProgress).toHaveBeenCalled();
    expect(mockStorageService.saveStudyStats).toHaveBeenCalled();
  });

  it('getKanjiProgress returns correct progress', () => {
    const progress: KanjiProgress = {
      kanjiId: 'U+4E00',
      status: 'learning',
      recognitionScore: 75,
      writingScore: 0,
      readingScore: 0,
      contextScore: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      totalAttempts: 5,
      correctAttempts: 4,
      mistakeHistory: [],
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    };

    useProgressStore.setState({
      kanjiProgress: {
        'U+4E00': progress,
      },
    });

    const result = useProgressStore.getState().getKanjiProgress('U+4E00');
    expect(result).toEqual(progress);
  });

  it('getKanjiProgress returns undefined for non-existent kanji', () => {
    const result = useProgressStore.getState().getKanjiProgress('U+INVALID');
    expect(result).toBeUndefined();
  });

  it('updateStudyStats updates stats correctly', async () => {
    const statsUpdate = {
      totalKanjiStudied: 10,
      kanjiMastered: 5,
      totalStudyTimeMinutes: 45,
    };

    useProgressStore.getState().updateStudyStats(statsUpdate);

    // Wait for async saveProgress
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = useProgressStore.getState();
    expect(state.studyStats.totalKanjiStudied).toBe(10);
    expect(state.studyStats.kanjiMastered).toBe(5);
    expect(state.studyStats.totalStudyTimeMinutes).toBe(45);
    expect(mockStorageService.saveUserProgress).toHaveBeenCalled();
    expect(mockStorageService.saveStudyStats).toHaveBeenCalled();
  });

  it('updateStudyStats merges with existing stats', async () => {
    useProgressStore.setState({
      studyStats: {
        totalKanjiStudied: 5,
        kanjiMastered: 2,
        totalStudyTimeMinutes: 20,
        currentStreak: 3,
        longestStreak: 5,
        lastStudyDate: '2026-03-01T00:00:00.000Z',
      },
    });

    const statsUpdate = {
      totalKanjiStudied: 10,
      currentStreak: 4,
    };

    useProgressStore.getState().updateStudyStats(statsUpdate);

    // Wait for async saveProgress
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = useProgressStore.getState();
    expect(state.studyStats.totalKanjiStudied).toBe(10); // Updated
    expect(state.studyStats.kanjiMastered).toBe(2); // Unchanged
    expect(state.studyStats.currentStreak).toBe(4); // Updated
    expect(state.studyStats.longestStreak).toBe(5); // Unchanged
  });

  it('loadProgress loads from AsyncStorage', async () => {
    const savedProgress = {
      'U+4E00': {
        kanjiId: 'U+4E00',
        status: 'learning' as const,
        recognitionScore: 75,
        writingScore: 50,
        readingScore: 60,
        contextScore: 70,
        lastReviewed: '2026-03-09T00:00:00.000Z',
        nextReview: '2026-03-10T00:00:00.000Z',
        totalAttempts: 10,
        correctAttempts: 8,
        mistakeHistory: [],
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 3,
      },
    };

    const savedStats = {
      totalKanjiStudied: 15,
      kanjiMastered: 7,
      totalStudyTimeMinutes: 120,
      currentStreak: 5,
      longestStreak: 10,
      lastStudyDate: '2026-03-09T00:00:00.000Z',
    };

    mockStorageService.getUserProgress.mockResolvedValueOnce(savedProgress);
    mockStorageService.getStudyStats.mockResolvedValueOnce(savedStats);

    await useProgressStore.getState().loadProgress();

    const state = useProgressStore.getState();
    expect(state.kanjiProgress).toEqual(savedProgress);
    expect(state.studyStats).toEqual(savedStats);
    expect(state.isLoaded).toBe(true);
  });

  it('loadProgress sets isLoaded to true', async () => {
    mockStorageService.getUserProgress.mockResolvedValueOnce(null);
    mockStorageService.getStudyStats.mockResolvedValueOnce(null);

    expect(useProgressStore.getState().isLoaded).toBe(false);

    await useProgressStore.getState().loadProgress();

    expect(useProgressStore.getState().isLoaded).toBe(true);
  });

  it('saveProgress saves to AsyncStorage', async () => {
    const progress = {
      'U+4E00': {
        kanjiId: 'U+4E00',
        status: 'learning' as const,
        recognitionScore: 75,
        writingScore: 0,
        readingScore: 0,
        contextScore: 0,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        totalAttempts: 5,
        correctAttempts: 4,
        mistakeHistory: [],
        easinessFactor: 2.5,
        interval: 0,
        repetitions: 0,
      },
    };

    const stats = {
      totalKanjiStudied: 10,
      kanjiMastered: 5,
      totalStudyTimeMinutes: 45,
      currentStreak: 3,
      longestStreak: 7,
      lastStudyDate: new Date().toISOString(),
    };

    useProgressStore.setState({
      kanjiProgress: progress,
      studyStats: stats,
    });

    await useProgressStore.getState().saveProgress();

    expect(mockStorageService.saveUserProgress).toHaveBeenCalledWith(progress);
    expect(mockStorageService.saveStudyStats).toHaveBeenCalledWith(stats);
  });

  it('clearProgress removes all data', async () => {
    useProgressStore.setState({
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          status: 'learning',
          recognitionScore: 75,
          writingScore: 0,
          readingScore: 0,
          contextScore: 0,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date().toISOString(),
          totalAttempts: 5,
          correctAttempts: 4,
          mistakeHistory: [],
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
        },
      },
      studyStats: {
        totalKanjiStudied: 10,
        kanjiMastered: 5,
        totalStudyTimeMinutes: 45,
        currentStreak: 3,
        longestStreak: 7,
        lastStudyDate: new Date().toISOString(),
      },
    });

    await useProgressStore.getState().clearProgress();

    expect(mockStorageService.clearAll).toHaveBeenCalled();
  });

  it('clearProgress resets to initial state', async () => {
    useProgressStore.setState({
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          status: 'learning',
          recognitionScore: 75,
          writingScore: 0,
          readingScore: 0,
          contextScore: 0,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date().toISOString(),
          totalAttempts: 5,
          correctAttempts: 4,
          mistakeHistory: [],
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
        },
      },
      studyStats: {
        totalKanjiStudied: 10,
        kanjiMastered: 5,
        totalStudyTimeMinutes: 45,
        currentStreak: 3,
        longestStreak: 7,
        lastStudyDate: new Date().toISOString(),
      },
    });

    await useProgressStore.getState().clearProgress();

    const state = useProgressStore.getState();
    expect(state.kanjiProgress).toEqual({});
    expect(state.studyStats).toMatchObject(initialStudyStats);
  });

  it('loadProgress handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockStorageService.getUserProgress.mockRejectedValueOnce(new Error('Storage error'));

    await useProgressStore.getState().loadProgress();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(useProgressStore.getState().isLoaded).toBe(true); // Still sets isLoaded

    consoleErrorSpy.mockRestore();
  });

  it('saveProgress handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockStorageService.saveUserProgress.mockRejectedValueOnce(new Error('Storage error'));

    await useProgressStore.getState().saveProgress();

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('clearProgress handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockStorageService.clearAll.mockRejectedValueOnce(new Error('Storage error'));

    await useProgressStore.getState().clearProgress();

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
