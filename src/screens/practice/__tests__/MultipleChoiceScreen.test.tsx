import React from 'react';
import { renderWithProviders, fireEvent, waitFor, act } from '../../../test-utils';
import MultipleChoiceScreen from '../MultipleChoiceScreen';

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

// Mock QuizService
jest.mock('../../../services/practice/QuizService', () => ({
  QuizService: {
    generateQuestion: jest.fn(() => ({
      type: 'kanji-to-meaning',
      question: '一',
      correctAnswer: 'one',
      options: ['one', 'two', 'three', 'four'],
    })),
  },
}));

// Mock HapticService
jest.mock('../../../services/feedback/HapticService', () => ({
  HapticService: {
    light: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

const { useKanjiStore } = require('../../../store/kanjiStore');
const { useProgressStore } = require('../../../store/progressStore');
const { usePracticeStore } = require('../../../store/practiceStore');

describe('MultipleChoiceScreen', () => {
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

  it('renders correctly with active question', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { toJSON } = renderWithProviders(<MultipleChoiceScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly at session end', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 2, // Beyond last question
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

    const { toJSON } = renderWithProviders(<MultipleChoiceScreen />);
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

    renderWithProviders(<MultipleChoiceScreen />);

    expect(mockStartSession).toHaveBeenCalledWith('quiz', ['U+4E00', 'U+4E8C']);
  });

  it('selects correct answer and shows green feedback', async () => {
    jest.useFakeTimers();
    const { HapticService } = require('../../../services/feedback/HapticService');

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    expect(HapticService.success).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('selects incorrect answer and shows red feedback', async () => {
    jest.useFakeTimers();
    const { HapticService } = require('../../../services/feedback/HapticService');

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const incorrectButton = getByText('two');
    fireEvent.press(incorrectButton);

    expect(HapticService.warning).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('auto-advances to next question after delay', async () => {
    jest.useFakeTimers();
    const mockNextCard = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
        kanjiIds: ['U+4E00', 'U+4E8C'],
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: mockNextCard,
      getSessionProgress: jest.fn(() => ({ current: 0, total: 2 })),
    });

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    // Fast-forward 1500ms
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockNextCard).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('calls addResult with correct result', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: true,
        rating: 5,
      })
    );

    jest.useRealTimers();
  });

  it('calls addResult with incorrect result', async () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const incorrectButton = getByText('two');
    fireEvent.press(incorrectButton);

    act(() => {
      jest.advanceTimersByTime(1500);
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

  it('updates kanji progress after answering', async () => {
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
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        readingScore: expect.any(Number),
        totalAttempts: 1,
        correctAttempts: 1,
      })
    );

    jest.useRealTimers();
  });

  it('navigates to ResultsScreen on last question', async () => {
    jest.useFakeTimers();
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('ResultsScreen', { sessionId: 'session1' });

    jest.useRealTimers();
  });

  it('disables answer buttons after selection', () => {
    jest.useFakeTimers();
    const mockAddResult = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    const correctButton = getByText('one');
    fireEvent.press(correctButton);

    // Try pressing another button - it should not trigger another selection
    const incorrectButton = getByText('two');
    fireEvent.press(incorrectButton);

    // Only one result should be added (from first press)
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockAddResult).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('increments progress bar as questions are answered', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { getByText } = renderWithProviders(<MultipleChoiceScreen />);

    expect(getByText('1 / 2')).toBeTruthy();
  });

  it('navigates back when no kanji available', () => {
    // Temporarily override useRoute to return empty kanjiIds
    const originalUseRoute = require('@react-navigation/native').useRoute;
    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockImplementation(() => ({
      params: { kanjiIds: [] }, // Empty array
    }));

    useKanjiStore.mockReturnValue({
      kanjiData: [], // No kanji data
    });

    usePracticeStore.mockReturnValue({
      currentSession: null,
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 0, total: 0 })),
    });

    renderWithProviders(<MultipleChoiceScreen />);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('closes session and navigates back when close button pressed', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'quiz',
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

    const { UNSAFE_root } = renderWithProviders(<MultipleChoiceScreen />);

    const iconButtons = UNSAFE_root.findAllByType(require('react-native-paper').IconButton);
    const closeButton = iconButtons[0]; // First IconButton is close button

    closeButton.props.onPress();

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });
});
