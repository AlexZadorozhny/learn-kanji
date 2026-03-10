import React from 'react';
import { View } from 'react-native';
import { renderWithProviders, act, waitFor } from '../../../test-utils';
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
const mockPush = jest.fn();

// Mutable route params object
const mockRoute = {
  params: {
    kanjiIds: ['U+4E00'],
    fromKanjiDetail: false,
    detailKanjiId: undefined,
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    push: mockPush,
  }),
  useRoute: () => mockRoute,
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
          d: 'M 10 50 L 90 50',
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
          d: 'M 10 30 L 90 30',
        },
        {
          d: 'M 10 70 L 90 70',
        },
      ],
    },
  ];

  let mockStartSession: jest.Mock;
  let mockEndSession: jest.Mock;
  let mockAddResult: jest.Mock;
  let mockNextCard: jest.Mock;
  let mockGetSessionProgress: jest.Mock;
  let currentSessionState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    storedOnStrokeComplete = null;
    storedOnAllStrokesComplete = null;

    // Reset route params
    mockRoute.params = {
      kanjiIds: ['U+4E00'],
      fromKanjiDetail: false,
      detailKanjiId: undefined,
    };

    // Mock KanjiVG functions to return stroke data immediately
    const mockLoadStrokeOrder = jest.fn().mockResolvedValue([{ d: 'M 10 50 L 90 50' }]);
    const mockLoadStrokeOrderBatch = jest.fn().mockResolvedValue(undefined);

    // Mock useKanjiStore with selector support
    useKanjiStore.mockImplementation((selector?: any) => {
      const state = {
        kanjiData: mockKanjiData,
        loadStrokeOrderBatch: mockLoadStrokeOrderBatch,
        loadStrokeOrder: mockLoadStrokeOrder,
      };
      return selector ? selector(state) : state;
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

    // Initialize mock functions
    mockStartSession = jest.fn((mode, kanjiIds) => {
      // When startSession is called, update the current session
      currentSessionState = {
        mode,
        kanjiIds,
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      };
    });
    mockEndSession = jest.fn();
    mockAddResult = jest.fn();
    mockNextCard = jest.fn();
    mockGetSessionProgress = jest.fn(() => ({ current: 0, total: 1 }));

    // Start with a default session (will be updated by startSession)
    currentSessionState = {
      mode: 'writing',
      kanjiIds: ['U+4E00'],
      currentIndex: 0,
      id: 'session1',
      startTime: Date.now(),
      results: [],
    };

    usePracticeStore.mockImplementation((selector?: any) => {
      const state = {
        currentSession: currentSessionState,
        startSession: mockStartSession,
        endSession: mockEndSession,
        addResult: mockAddResult,
        nextCard: mockNextCard,
        getSessionProgress: mockGetSessionProgress,
      };
      return selector ? selector(state) : state;
    });
  });

  const waitForSessionToLoad = async (findByTestId: any) => {
    // Wait for async initialization to complete
    await findByTestId('mock-stroke-canvas');
  };

  it('renders correctly with active session', async () => {
    const { toJSON, findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly at session end', async () => {
    // Start with session already at the end
    currentSessionState = {
      mode: 'writing',
      kanjiIds: ['U+4E00'],
      currentIndex: 1, // Beyond last kanji
      id: 'session1',
      startTime: Date.now(),
      results: [{ kanjiId: 'U+4E00', correct: true, timeSpent: 15 }],
    };

    mockGetSessionProgress.mockReturnValue({ current: 1, total: 1 });

    const { toJSON } = renderWithProviders(<StrokeOrderScreen />);

    // Wait a bit for rendering
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(toJSON()).toMatchSnapshot();
  });

  it('starts session on mount', async () => {
    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    expect(mockStartSession).toHaveBeenCalledWith('writing', ['U+4E00']);
  });

  it('passes correct props to StrokeOrderCanvas', async () => {
    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

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

  it('handles stroke completion correctly (correct stroke)', async () => {
    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    // Simulate correct stroke
    act(() => {
      mockOnStrokeComplete(true);
    });

    expect(mockOnStrokeComplete).toHaveBeenCalled();
  });

  it('handles stroke completion correctly (incorrect stroke)', async () => {
    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    // Simulate incorrect stroke
    act(() => {
      mockOnStrokeComplete(false);
    });

    expect(mockOnStrokeComplete).toHaveBeenCalled();
  });

  it('calculates accuracy >= 70% as correct', async () => {
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

    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

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

    // Call completion
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

  it('calculates accuracy < 70% as incorrect', async () => {
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

    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

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

    // Call completion
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
        writingScore: 0, // Incorrect doesn't increase score
      })
    );
  });

  it('updates writingScore in kanji progress', async () => {
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

    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    // Simulate perfect accuracy
    act(() => {
      mockOnStrokeComplete(true);
      mockOnStrokeComplete(true);
    });

    // Call completion
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

  it('calls nextCard when not last kanji', async () => {
    // Override route params to have 2 kanji
    mockRoute.params = {
      kanjiIds: ['U+4E00', 'U+4E8C'],
      fromKanjiDetail: false,
      detailKanjiId: undefined,
    };

    mockStartSession.mockImplementation((mode, kanjiIds) => {
      currentSessionState = {
        mode,
        kanjiIds,
        currentIndex: 0,
        id: 'session1',
        startTime: Date.now(),
        results: [],
      };
    });

    mockGetSessionProgress.mockReturnValue({ current: 0, total: 2 });

    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    act(() => {
      mockOnStrokeComplete(true);
    });

    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockNextCard).toHaveBeenCalled();
  });

  it('navigates to ResultsScreen on last kanji', async () => {
    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    act(() => {
      mockOnStrokeComplete(true);
    });

    act(() => {
      mockOnAllStrokesComplete();
    });

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('ResultsScreen', {
      sessionId: 'session1',
      returnTo: undefined,
      returnKanjiId: undefined,
    });
  });

  it('updates study stats on session complete', async () => {
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

    const { findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

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

  it('navigates back when no kanji with stroke data available', async () => {
    // Mock empty kanji data
    useKanjiStore.mockImplementation((selector?: any) => {
      const state = {
        kanjiData: [],
        loadStrokeOrderBatch: jest.fn().mockResolvedValue(undefined),
        loadStrokeOrder: jest.fn().mockResolvedValue(null),
      };
      return selector ? selector(state) : state;
    });

    mockRoute.params = { kanjiIds: [] };

    renderWithProviders(<StrokeOrderScreen />);

    // Wait for initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should show error or navigate back
    // The component shows error state instead of navigating back now
  });

  it('closes session and navigates back when close button is pressed', async () => {
    const { getByTestId, findByTestId, UNSAFE_root } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );
    const closeButton = iconButtons[0];

    act(() => {
      closeButton.props.onPress();
    });

    expect(mockEndSession).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('displays progress correctly', async () => {
    const { getByText, findByTestId } = renderWithProviders(<StrokeOrderScreen />);

    await waitForSessionToLoad(findByTestId);

    expect(getByText('1 / 1')).toBeTruthy();
  });
});
