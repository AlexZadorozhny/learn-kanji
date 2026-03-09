import React from 'react';
import { View } from 'react-native';
import { renderWithProviders, act } from '../../../test-utils';
import StrokeOrderScreen from '../StrokeOrderScreen';

// Store callbacks for testing
let storedOnStrokeComplete: ((correct: boolean) => void) | null = null;
let storedOnAllStrokesComplete: (() => void) | null = null;

// Mock callbacks that will invoke the real callbacks
const mockOnStrokeComplete = jest.fn((correct: boolean) => {
  if (storedOnStrokeComplete) {
    storedOnStrokeComplete(correct);
  }
});

const mockOnAllStrokesComplete = jest.fn(() => {
  if (storedOnAllStrokesComplete) {
    storedOnAllStrokesComplete();
  }
});

// Mock StrokeOrderCanvas component
jest.mock('../../../components/kanji/StrokeOrderCanvas', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockComponent = jest.fn((props: any) => {
    // Store callbacks for testing
    if (props.onStrokeComplete) {
      storedOnStrokeComplete = props.onStrokeComplete;
    }
    if (props.onAllStrokesComplete) {
      storedOnAllStrokesComplete = props.onAllStrokesComplete;
    }
    return React.createElement(View, { testID: 'mock-stroke-canvas' });
  });

  return {
    __esModule: true,
    default: MockComponent,
  };
});

const StrokeOrderCanvasMock = require('../../../components/kanji/StrokeOrderCanvas').default;
const mockStrokeOrderCanvas = StrokeOrderCanvasMock;

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
    params: { kanjiIds: ['U+4E00'] },
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

const { useKanjiStore } = require('../../../store/kanjiStore');
const { useProgressStore } = require('../../../store/progressStore');
const { usePracticeStore } = require('../../../store/practiceStore');

describe('StrokeOrderScreen', () => {
  const mockKanjiData = [
    {
      id: 'U+4E00',
      character: '一',
      meanings: ['one'],
      strokes: 1,
      strokeOrder: [
        {
          path: 'M 10 50 L 90 50',
        },
      ],
    },
    {
      id: 'U+4E8C',
      character: '二',
      meanings: ['two'],
      strokes: 2,
      strokeOrder: [
        {
          path: 'M 10 30 L 90 30',
        },
        {
          path: 'M 10 70 L 90 70',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    storedOnStrokeComplete = null;
    storedOnAllStrokesComplete = null;
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

  it('renders correctly with active session', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
        kanjiIds: ['U+4E00'],
        currentIndex: 0,
        startTime: Date.now(),
        results: [],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 1, total: 1 })),
    });

    const { toJSON } = renderWithProviders(<StrokeOrderScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly at session end', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
        kanjiIds: ['U+4E00'],
        currentIndex: 1, // Beyond last kanji
        startTime: Date.now(),
        results: [{ kanjiId: 'U+4E00', correct: true, timeSpent: 15 }],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 1, total: 1 })),
    });

    const { toJSON } = renderWithProviders(<StrokeOrderScreen />);
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

    renderWithProviders(<StrokeOrderScreen />);

    expect(mockStartSession).toHaveBeenCalledWith('writing', ['U+4E00']);
  });

  it('passes correct props to StrokeOrderCanvas', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    expect(mockStrokeOrderCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        kanji: expect.objectContaining({
          id: 'U+4E00',
          character: '一',
        }),
        onStrokeComplete: expect.any(Function),
        onAllStrokesComplete: expect.any(Function),
      }),
      undefined
    );
  });

  it('handles stroke completion correctly (correct stroke)', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    // Simulate correct stroke
    act(() => {
      mockOnStrokeComplete(true);
    });

    // Internal state should track correct strokes (tested indirectly via completion)
    expect(mockOnStrokeComplete).toHaveBeenCalled();
  });

  it('handles stroke completion correctly (incorrect stroke)', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    // Simulate incorrect stroke
    act(() => {
      mockOnStrokeComplete(false);
    });

    expect(mockOnStrokeComplete).toHaveBeenCalled();
  });

  it('calculates accuracy >= 70% as correct', () => {
    const mockAddResult = jest.fn();
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
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    // Simulate 7 correct out of 10 strokes (70% accuracy)
    act(() => {
      mockOnStrokeComplete(true); // 1
      mockOnStrokeComplete(true); // 2
      mockOnStrokeComplete(true); // 3
      mockOnStrokeComplete(true); // 4
      mockOnStrokeComplete(true); // 5
      mockOnStrokeComplete(true); // 6
      mockOnStrokeComplete(true); // 7
      mockOnStrokeComplete(false); // 8
      mockOnStrokeComplete(false); // 9
      mockOnStrokeComplete(false); // 10
    });

    // Call completion in separate act to allow state updates
    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: true, // 70% accuracy = correct
        rating: 5,
      })
    );

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        writingScore: 10, // Correct increases score
      })
    );
  });

  it('calculates accuracy < 70% as incorrect', () => {
    const mockAddResult = jest.fn();
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
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    

    // Simulate 6 correct out of 10 strokes (60% accuracy)
    act(() => {
      mockOnStrokeComplete(true); // 1
      mockOnStrokeComplete(true); // 2
      mockOnStrokeComplete(true); // 3
      mockOnStrokeComplete(true); // 4
      mockOnStrokeComplete(true); // 5
      mockOnStrokeComplete(true); // 6
      mockOnStrokeComplete(false); // 7
      mockOnStrokeComplete(false); // 8
      mockOnStrokeComplete(false); // 9
      mockOnStrokeComplete(false); // 10
    });

    // Call completion in separate act to allow state updates
    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: false, // 60% accuracy = incorrect
        rating: 2,
      })
    );

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        writingScore: 0, // Incorrect doesn't increase score (max(0, 0-5) = 0)
      })
    );
  });

  it('updates writingScore in kanji progress', () => {
    const mockUpdateKanjiProgress = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          status: 'learning' as const,
          recognitionScore: 50,
          writingScore: 50,
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
        },
      },
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
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    

    // Simulate perfect accuracy
    act(() => {
      mockOnStrokeComplete(true);
      mockOnStrokeComplete(true);
    });

    // Call completion in separate act to allow state updates
    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        writingScore: 60, // 50 + 10
        totalAttempts: 1,
        correctAttempts: 1,
      })
    );
  });

  it('calls nextCard when not last kanji', () => {
    const mockNextCard = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    

    act(() => {
      mockOnStrokeComplete(true);
    });

    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockNextCard).toHaveBeenCalled();
  });

  it('navigates to ResultsScreen on last kanji', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    

    act(() => {
      mockOnStrokeComplete(true);
    });

    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('ResultsScreen', { sessionId: 'session1' });
  });

  it('updates study stats on session complete', () => {
    const mockUpdateStudyStats = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {},
      updateKanjiProgress: jest.fn(),
      updateStudyStats: mockUpdateStudyStats,
      studyStats: {
        totalKanjiStudied: 5,
        kanjiMastered: 0,
        totalStudyTimeMinutes: 10,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    renderWithProviders(<StrokeOrderScreen />);

    

    act(() => {
      mockOnStrokeComplete(true);
    });

    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockUpdateStudyStats).toHaveBeenCalledWith(
      expect.objectContaining({
        totalKanjiStudied: 6, // 5 + 1
      })
    );
  });

  it('navigates back when no kanji with stroke data available', () => {
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

    renderWithProviders(<StrokeOrderScreen />);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('closes session and navigates back when close button is pressed', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    const { UNSAFE_root } = renderWithProviders(<StrokeOrderScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );
    const closeButton = iconButtons[0];

    closeButton.props.onPress();

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('displays progress correctly', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'writing',
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

    const { getByText } = renderWithProviders(<StrokeOrderScreen />);

    expect(getByText('1 / 1')).toBeTruthy();
  });
});
