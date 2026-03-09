import React from 'react';
import { renderWithProviders, fireEvent, waitFor } from '../../../test-utils';
import ContextPracticeScreen from '../ContextPracticeScreen';

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

// Mock services
jest.mock('../../../services/audio/TTSService', () => ({
  TTSService: {
    speak: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../../services/feedback/HapticService', () => ({
  HapticService: {
    light: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  },
}));

const { useKanjiStore } = require('../../../store/kanjiStore');
const { useProgressStore } = require('../../../store/progressStore');
const { usePracticeStore } = require('../../../store/practiceStore');

describe('ContextPracticeScreen', () => {
  const mockKanjiData = [
    {
      id: 'U+4E00',
      character: '一',
      meanings: ['one'],
      onYomi: [{ reading: 'イチ', romaji: 'ichi' }],
      kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
      strokes: 1,
      exampleWords: [
        {
          word: '一人',
          reading: 'ひとり',
          romaji: 'hitori',
          meaning: 'one person',
        },
        {
          word: '一つ',
          reading: 'ひとつ',
          romaji: 'hitotsu',
          meaning: 'one thing',
        },
        {
          word: '一日',
          reading: 'いちにち',
          romaji: 'ichinichi',
          meaning: 'one day',
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
        mode: 'context',
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

    const { toJSON } = renderWithProviders(<ContextPracticeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly at session end', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
        kanjiIds: ['U+4E00'],
        currentIndex: 1, // Beyond last kanji
        startTime: Date.now(),
        results: [{ kanjiId: 'U+4E00', correct: true, timeSpent: 10 }],
      },
      startSession: jest.fn(),
      endSession: jest.fn(),
      addResult: jest.fn(),
      nextCard: jest.fn(),
      getSessionProgress: jest.fn(() => ({ current: 1, total: 1 })),
    });

    const { toJSON } = renderWithProviders(<ContextPracticeScreen />);
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

    renderWithProviders(<ContextPracticeScreen />);

    expect(mockStartSession).toHaveBeenCalledWith('context', ['U+4E00']);
  });

  it('reveals answer when Show Meanings button is pressed', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { getByText, queryByText } = renderWithProviders(<ContextPracticeScreen />);

    // Initially, meanings should not be shown
    expect(queryByText('one')).toBeNull();

    // Press reveal button
    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    // Meanings should now be visible
    expect(getByText('one')).toBeTruthy();
  });

  it('calls HapticService.warning when reveal button is pressed', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    expect(HapticService.warning).toHaveBeenCalled();
  });

  it('calls TTSService.speak when example word is pressed', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    TTSService.speak.mockClear();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { UNSAFE_root } = renderWithProviders(<ContextPracticeScreen />);

    // Find IconButton in example word card
    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // First IconButton is close, others are speaker buttons
    await iconButtons[1].props.onPress();

    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalledWith('ひとり');
    });
  });

  it('calls HapticService.light when TTS is triggered', async () => {
    const { HapticService } = require('../../../services/feedback/HapticService');
    const { TTSService } = require('../../../services/audio/TTSService');
    HapticService.light.mockClear();
    TTSService.speak.mockResolvedValue(undefined);

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { UNSAFE_root } = renderWithProviders(<ContextPracticeScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    await iconButtons[1].props.onPress();

    expect(HapticService.light).toHaveBeenCalled();
  });

  it('updates speaking state during TTS playback', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');

    let resolveTTS: () => void;
    const ttsPromise = new Promise<void>((resolve) => {
      resolveTTS = resolve;
    });
    TTSService.speak.mockReturnValue(ttsPromise);

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { UNSAFE_root } = renderWithProviders(<ContextPracticeScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    iconButtons[1].props.onPress();

    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalled();
    });

    resolveTTS!();
  });

  it('calls addResult and updateKanjiProgress when "Got It!" is pressed', () => {
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
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    // Reveal answer first
    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    // Press "Got It!"
    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

    expect(mockAddResult).toHaveBeenCalledWith(
      expect.objectContaining({
        kanjiId: 'U+4E00',
        correct: true,
        rating: 5,
      })
    );

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        contextScore: 10, // Should increase
        totalAttempts: 1,
        correctAttempts: 1,
      })
    );
  });

  it('updates contextScore higher when "Got It!" is pressed', () => {
    const mockUpdateKanjiProgress = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          status: 'learning' as const,
          recognitionScore: 50,
          writingScore: 0,
          readingScore: 0,
          contextScore: 50, // Starting at 50
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
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        contextScore: 60, // 50 + 10
      })
    );
  });

  it('updates contextScore lower when "Need Practice" is pressed', () => {
    const mockUpdateKanjiProgress = jest.fn();

    useProgressStore.mockReturnValue({
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          status: 'learning' as const,
          recognitionScore: 50,
          writingScore: 0,
          readingScore: 0,
          contextScore: 50, // Starting at 50
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
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    const needPracticeButton = getByText('Need Practice');
    fireEvent.press(needPracticeButton);

    expect(mockUpdateKanjiProgress).toHaveBeenCalledWith(
      'U+4E00',
      expect.objectContaining({
        contextScore: 45, // 50 - 5
      })
    );
  });

  it('calls HapticService.success when "Got It!" is pressed', () => {
    const { HapticService } = require('../../../services/feedback/HapticService');

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    HapticService.success.mockClear();

    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

    expect(HapticService.success).toHaveBeenCalled();
  });

  it('calls nextCard when rating is given and not last kanji', () => {
    const mockNextCard = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

    expect(mockNextCard).toHaveBeenCalled();
  });

  it('navigates to ResultsScreen on last kanji', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

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
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    const revealButton = getByText('Show Meanings');
    fireEvent.press(revealButton);

    const gotItButton = getByText('Got It!');
    fireEvent.press(gotItButton);

    expect(mockUpdateStudyStats).toHaveBeenCalledWith(
      expect.objectContaining({
        totalKanjiStudied: 6, // 5 + 1
      })
    );
  });

  it('navigates back when no kanji with example words available', () => {
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

    renderWithProviders(<ContextPracticeScreen />);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('closes session and navigates back when close button is pressed', () => {
    const mockEndSession = jest.fn();

    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'context',
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

    const { UNSAFE_root } = renderWithProviders(<ContextPracticeScreen />);

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
        mode: 'context',
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

    const { getByText } = renderWithProviders(<ContextPracticeScreen />);

    expect(getByText('1 / 1')).toBeTruthy();
  });
});
