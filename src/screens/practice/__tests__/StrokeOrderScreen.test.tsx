import React from 'react';
import { renderWithProviders } from '../../../test-utils';
import StrokeOrderScreen from '../StrokeOrderScreen';

// Mock StrokeOrderCanvas component
jest.mock('../../../components/kanji/StrokeOrderCanvas', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
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
});
