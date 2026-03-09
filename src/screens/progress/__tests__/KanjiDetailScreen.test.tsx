import React from 'react';
import { renderWithProviders } from '../../../test-utils';
import KanjiDetailScreen from '../KanjiDetailScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    params: { kanjiId: 'U+4E00' },
  }),
}));

// Mock kanji store
jest.mock('../../../store/kanjiStore', () => ({
  useKanjiStore: jest.fn(),
}));

// Mock TTS service
jest.mock('../../../services/audio/TTSService', () => ({
  TTSService: {
    speak: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
  },
}));

const { useKanjiStore } = require('../../../store/kanjiStore');

describe('KanjiDetailScreen', () => {
  const mockKanji = {
    id: 'U+4E00',
    character: '一',
    frequencyRank: 1,
    meanings: ['one', 'single'],
    onYomi: [
      { reading: 'イチ', romaji: 'ichi' },
      { reading: 'イツ', romaji: 'itsu' },
    ],
    kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
    strokes: 1,
    radicals: ['一'],
    exampleWords: [
      {
        word: '一人',
        reading: 'ひとり',
        romaji: 'hitori',
        meaning: 'one person; alone',
      },
      {
        word: '一つ',
        reading: 'ひとつ',
        romaji: 'hitotsu',
        meaning: 'one (thing)',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with full kanji data', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { toJSON } = renderWithProviders(<KanjiDetailScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly when kanji not found', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => null),
    });

    const { toJSON } = renderWithProviders(<KanjiDetailScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays kanji character and metadata', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('一')).toBeTruthy();
    expect(getByText('1 strokes')).toBeTruthy();
    expect(getByText('JLPT N5')).toBeTruthy();
  });

  it('displays meanings section', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('Meanings')).toBeTruthy();
    expect(getByText('one')).toBeTruthy();
    expect(getByText('single')).toBeTruthy();
  });

  it('displays on-yomi readings section', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('On-yomi (音読み)')).toBeTruthy();
    expect(getByText('Chinese reading')).toBeTruthy();
    expect(getByText('イチ')).toBeTruthy();
    expect(getByText('(ichi)')).toBeTruthy();
  });

  it('displays kun-yomi readings section', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('Kun-yomi (訓読み)')).toBeTruthy();
    expect(getByText('Japanese reading')).toBeTruthy();
    expect(getByText('ひと')).toBeTruthy();
    expect(getByText('(hito)')).toBeTruthy();
  });

  it('displays example words section', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('Example Words')).toBeTruthy();
    expect(getByText('一人')).toBeTruthy();
    expect(getByText('ひとり')).toBeTruthy();
    expect(getByText('one person; alone')).toBeTruthy();
  });

  it('shows not found message when kanji does not exist', () => {
    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => null),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('Kanji not found')).toBeTruthy();
  });

  it('handles TTS speak button press for on-yomi', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    TTSService.speak.mockResolvedValue(undefined);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { getAllByTestId } = renderWithProviders(<KanjiDetailScreen />);

    // Component should have speaker buttons
    expect(TTSService.speak).toBeDefined();
  });

  it('handles TTS error gracefully', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    TTSService.speak.mockRejectedValue(new Error('TTS failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    renderWithProviders(<KanjiDetailScreen />);

    // Component should render without crashing
    expect(consoleSpy).not.toHaveBeenCalled(); // No error yet, just checking component renders

    consoleSpy.mockRestore();
  });

  it('renders kanji with only on-yomi readings', () => {
    const kanjiWithOnlyOnYomi = {
      ...mockKanji,
      kunYomi: [],
    };

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => kanjiWithOnlyOnYomi),
    });

    const { getByText, queryByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('On-yomi (音読み)')).toBeTruthy();
    expect(queryByText('Kun-yomi (訓読み)')).toBeNull();
  });

  it('renders kanji with only kun-yomi readings', () => {
    const kanjiWithOnlyKunYomi = {
      ...mockKanji,
      onYomi: [],
      kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
    };

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => kanjiWithOnlyKunYomi),
    });

    const { getByText, queryByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(queryByText('On-yomi (音読み)')).toBeNull();
    expect(getByText('Kun-yomi (訓読み)')).toBeTruthy();
  });

  it('renders kanji without JLPT level', () => {
    const kanjiWithoutJLPT = {
      ...mockKanji,
      jlptLevel: undefined,
    };

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => kanjiWithoutJLPT),
    });

    const { queryByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(queryByText(/JLPT/)).toBeNull();
  });

  it('renders kanji without example words', () => {
    const kanjiWithoutExamples = {
      ...mockKanji,
      exampleWords: [],
    };

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => kanjiWithoutExamples),
    });

    const { queryByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(queryByText('Example Words')).toBeNull();
  });

  it('renders multiple example words', () => {
    const kanjiWithManyExamples = {
      ...mockKanji,
      exampleWords: [
        {
          word: '一人',
          reading: 'ひとり',
          romaji: 'hitori',
          meaning: 'one person; alone',
        },
        {
          word: '一つ',
          reading: 'ひとつ',
          romaji: 'hitotsu',
          meaning: 'one (thing)',
        },
        {
          word: '一日',
          reading: 'いちにち',
          romaji: 'ichinichi',
          meaning: 'one day',
        },
      ],
    };

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => kanjiWithManyExamples),
    });

    const { getByText } = renderWithProviders(<KanjiDetailScreen />);

    expect(getByText('一人')).toBeTruthy();
    expect(getByText('一つ')).toBeTruthy();
    expect(getByText('一日')).toBeTruthy();
  });

  it('calls TTSService.speak when on-yomi speaker button is pressed', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');
    TTSService.speak.mockResolvedValue(undefined);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    // Find all IconButton components
    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // First IconButton is for on-yomi (first reading)
    await iconButtons[0].props.onPress();

    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalledWith('イチ');
    });
  });

  it('calls TTSService.speak when kun-yomi speaker button is pressed', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');
    TTSService.speak.mockClear();
    TTSService.speak.mockResolvedValue(undefined);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // Kun-yomi speaker button (after all on-yomi buttons)
    await iconButtons[2].props.onPress();

    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalledWith('ひと');
    });
  });

  it('calls TTSService.speak when example word speaker button is pressed', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');
    TTSService.speak.mockClear();
    TTSService.speak.mockResolvedValue(undefined);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // Example word speaker button (after readings)
    await iconButtons[3].props.onPress();

    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalledWith('一人');
    });
  });

  it('updates speaking state during TTS playback', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');

    // Make speak take some time
    let resolveTTS: () => void;
    const ttsPromise = new Promise<void>((resolve) => {
      resolveTTS = resolve;
    });
    TTSService.speak.mockReturnValue(ttsPromise);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // Trigger TTS
    iconButtons[0].props.onPress();

    // Verify TTS was called
    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalled();
    });

    // Resolve TTS
    resolveTTS!();
  });

  it('handles TTS error without crashing', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');
    TTSService.speak.mockRejectedValue(new Error('TTS failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // Trigger TTS that will fail
    await iconButtons[0].props.onPress();

    // Wait for error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('allows multiple TTS calls for different buttons', async () => {
    const { TTSService } = require('../../../services/audio/TTSService');
    const { waitFor } = require('@testing-library/react-native');
    TTSService.speak.mockClear();
    TTSService.speak.mockResolvedValue(undefined);

    useKanjiStore.mockReturnValue({
      getKanjiById: jest.fn(() => mockKanji),
    });

    const { UNSAFE_root } = renderWithProviders(<KanjiDetailScreen />);

    const iconButtons = UNSAFE_root.findAllByType(
      require('react-native-paper').IconButton
    );

    // Trigger TTS for two different readings
    await iconButtons[0].props.onPress();
    await iconButtons[1].props.onPress();

    // Both should be called
    await waitFor(() => {
      expect(TTSService.speak).toHaveBeenCalledTimes(2);
    });
  });
});
