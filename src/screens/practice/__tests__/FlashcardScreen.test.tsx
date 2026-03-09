import React from 'react';
import { renderWithProviders } from '../../../test-utils';
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
});
