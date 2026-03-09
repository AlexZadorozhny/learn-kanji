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
});
