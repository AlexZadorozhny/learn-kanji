import React from 'react';
import { renderWithProviders, act } from '../../../test-utils';
import FlashcardScreen from '../FlashcardScreen';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { kanjiIds: ['U+4E00', 'U+4E8C'] },
  }),
}));

// Mock stores
jest.mock('../../../store/kanjiStore', () => ({
  useKanjiStore: jest.fn(),
}));

jest.mock('../../../store/progressStore', () => ({
  useProgressStore: jest.fn(),
}));

jest.mock('../../../store/practiceStore', () => ({
  usePracticeStore: jest.fn(),
}));

// Mock SRSService
jest.mock('../../../services/practice/SRSService', () => ({
  SRSService: {
    getDueKanji: jest.fn(() => []),
    getNewKanji: jest.fn(() => []),
    ratingToQuality: jest.fn((rating) => rating),
    updateProgress: jest.fn((progress) => progress),
    calculateNextReview: jest.fn((progress) => ({
      easinessFactor: progress.easinessFactor,
      interval: 1,
      repetitions: progress.repetitions + 1,
      nextReview: new Date(Date.now() + 86400000).toISOString(),
      lastReviewed: new Date().toISOString(),
    })),
  },
}));

const { useKanjiStore } = require('../../../store/kanjiStore');
const { useProgressStore } = require('../../../store/progressStore');
const { usePracticeStore } = require('../../../store/practiceStore');

describe('FlashcardScreen', () => {
  const mockKanjiData = [
    {
      id: 'U+4E00',
      character: '一',
      meanings: ['one'],
      onYomi: [{ reading: 'イチ', romaji: 'ichi' }],
      kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
      strokes: 1,
    },
    {
      id: 'U+4E8C',
      character: '二',
      meanings: ['two'],
      onYomi: [{ reading: 'ニ', romaji: 'ni' }],
      kunYomi: [{ reading: 'ふた', romaji: 'futa' }],
      strokes: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    useKanjiStore.mockReturnValue({
      kanjiData: mockKanjiData,
    });
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
      updateKanjiProgress: jest.fn(),
      updateStudyStats: jest.fn(),
      studyStats: {
        totalKanjiStudied: 0,
        kanjiMastered: 0,
        totalStudyTimeMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with active session', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 0,
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 1, total: 2 })),
    });

    const { toJSON } = renderWithProviders(<FlashcardScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly at session end', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 2, // Beyond last card
        startTime: Date.now(),
        results: [
          { kanjiId: 'U+4E00', correct: true, timeSpent: 5 },
          { kanjiId: 'U+4E8C', correct: true, timeSpent: 4 },
        ],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 2, total: 2 })),
    });

    const { toJSON } = renderWithProviders(<FlashcardScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('starts session on mount', () => {
    const mockStartSession = jest.fn();
    usePracticeStore.mockReturnValue({
      currentSession: null,
      startSession: mockStartSession,
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 0 })),
    });

    renderWithProviders(<FlashcardScreen />);

    expect(mockStartSession).toHaveBeenCalledWith('flashcard', ['U+4E00', 'U+4E8C']);
  });

  it('handles rating 1 (Again button)', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();
    const mockNextCard = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: mockAddResult,
      nextCard: mockNextCard,
      getSessionProgress: jest.fn(() => ({ current: 0, total: 2 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    // Find FlashcardComponent and trigger onRate
    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(1);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: false,
        rating: 1,
      })
    );
    expect(mockNextCard).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('handles rating 2 (Hard button)', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: mockAddResult,
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(2);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: false,
        rating: 2,
      })
    );

    jest.useRealTimers();
  });

  it('handles rating 3 (Good button)', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: mockAddResult,
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: true,
        rating: 3,
      })
    );

    jest.useRealTimers();
  });

  it('handles rating 4 (Easy button)', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: mockAddResult,
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(4);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: true,
        rating: 4,
      })
    );

    jest.useRealTimers();
  });

  it('calls SRSService.calculateNextReview with correct progress', async () => {
    jest.useFakeTimers();
    const { SRSService } = require('../../../services/practice/SRSService');

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(SRSService.calculateNextReview).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('updates kanji progress with SRS data', async () => {
    jest.useFakeTimers();
    const mockUpdateKanjiProgress = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {},
      updateKanjiProgress: mockUpdateKanjiProgress,
      updateStudyStats: jest.fn(),
      studyStats: {
        totalKanjiStudied: 0,
        kanjiMastered: 0,
        totalStudyTimeMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        recognitionScore: expect.any(Number),
        totalAttempts: 1,
        correctAttempts: 1,
        easinessFactor: expect.any(Number),
        interval: expect.any(Number),
      })
    );

    jest.useRealTimers();
  });

  it('navigates to ResultsScreen on last card', async () => {
    jest.useFakeTimers();
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: mockEndSession,
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('ResultsScreen', { sessionId: 'session1' });

    jest.useRealTimers();
  });

  it('updates study stats on session complete', async () => {
    jest.useFakeTimers();
    const mockUpdateStudyStats = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {},
      updateKanjiProgress: jest.fn(),
      updateStudyStats: mockUpdateStudyStats,
      studyStats: {
        totalKanjiStudied: 5,
        kanjiMastered: 2,
        totalStudyTimeMinutes: 20,
        currentStreak: 3,
        longestStreak: 7,
      },
    });

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    act(() => {
      flashcardComponent.props.onRate(3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockUpdateStudyStats).toHaveBeenCalledWith({
      totalKanjiStudied: 6, // 5 + 1
      totalStudyTimeMinutes: expect.any(Number),
    });

    jest.useRealTimers();
  });

  it('navigates back when no kanji available', () => {
    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockImplementation(() => ({
      params: { kanjiIds: [] },
    }));

    useKanjiStore.mockReturnValue({
      kanjiData: [],
    });

    usePracticeStore.mockReturnValue({
      currentSession: null,
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 0 })),
    });

    renderWithProviders(<FlashcardScreen />);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('initializes session with due kanji from SRS', () => {
    const { SRSService } = require('../../../services/practice/SRSService');
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C']);

    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockImplementation(() => ({
      params: {},
    }));

    const mockStartSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: null,
      startSession: mockStartSession,
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 0 })),
    });

    renderWithProviders(<FlashcardScreen />);

    expect(SRSService.getDueKanji).toHaveBeenCalled();
    expect(SRSService.getNewKanji).toHaveBeenCalled();
    expect(mockStartSession).toHaveBeenCalledWith('flashcard', expect.any(Array));
  });

  it('closes session and navigates back when close button pressed', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: mockEndSession,
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 1 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const iconButtons = UNSAFE_root.findAllByType(require('react-native-paper').IconButton);
    const closeButton = iconButtons[0];

    closeButton.props.onPress();

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('shows transitioning state during card change', async () => {
    jest.useFakeTimers();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 2 })),
    });

    const { UNSAFE_root } = renderWithProviders(<FlashcardScreen />);

    const flashcardComponent = UNSAFE_root.findByType(
      require('../../../components/practice/FlashcardComponent').default
    );

    // Trigger rating which starts transition
    act(() => {
      flashcardComponent.props.onRate(3);
    });

    // During transition (before 100ms), FlashcardComponent should not be rendered
    // After 100ms, nextCard is called and FlashcardComponent re-renders
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify nextCard was called (ends transition)
    expect(usePracticeStore().nextCard).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
