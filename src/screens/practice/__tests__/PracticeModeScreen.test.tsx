import React from 'react';
import { renderWithProviders } from '../../../test-utils';
import PracticeModeScreen from '../PracticeModeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock stores
jest.mock('../../../store/progressStore', () => ({
  useProgressStore: jest.fn(),
}));

jest.mock('../../../store/kanjiStore', () => ({
  useKanjiStore: jest.fn(),
}));

// Mock SRSService
jest.mock('../../../services/practice/SRSService', () => ({
  SRSService: {
    getDueKanji: jest.fn(),
    getNewKanji: jest.fn(),
  },
}));

const { useProgressStore } = require('../../../store/progressStore');
const { useKanjiStore } = require('../../../store/kanjiStore');
const { SRSService } = require('../../../services/practice/SRSService');

describe('PracticeModeScreen', () => {
  const mockKanjiData = [
    {
      id: 'U+4E00',
      character: '一',
      meanings: ['one'],
      strokes: 1,
      strokeOrder: [{ path: 'M 10 10 L 90 10' }],
    },
    {
      id: 'U+4E8C',
      character: '二',
      meanings: ['two'],
      strokes: 2,
      strokeOrder: [{ path: 'M 10 10 L 90 10' }, { path: 'M 10 30 L 90 30' }],
    },
    {
      id: 'U+4E09',
      character: '三',
      meanings: ['three'],
      strokes: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useKanjiStore.mockReturnValue({
      kanjiData: mockKanjiData,
    });
  });

  it('renders correctly with available cards', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {
        'U+4E00': { kanjiId: 'U+4E00', nextReview: Date.now() - 1000 },
      },
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C', 'U+4E09']);

    const { toJSON } = renderWithProviders(<PracticeModeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with no available cards', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { toJSON } = renderWithProviders(<PracticeModeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays practice mode cards', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue(['U+4E00', 'U+4E8C']);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('Practice Modes')).toBeTruthy();
    expect(getByText('🎴 Flashcards')).toBeTruthy();
    expect(getByText('✍️ Stroke Order')).toBeTruthy();
    expect(getByText('❓ Multiple Choice')).toBeTruthy();
    expect(getByText('📚 Context Practice')).toBeTruthy();
  });

  it('displays cards ready info when cards available', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C']);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('📚 Cards Ready')).toBeTruthy();
    expect(getByText('1 due for review • 1 new')).toBeTruthy();
  });

  it('shows correct kanji count for stroke order', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    // 2 kanji have strokeOrder data in mockKanjiData
    expect(getByText(/Start Practice \(2 kanji\)/)).toBeTruthy();
  });

  it('disables flashcards when no cards available', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('No cards available')).toBeTruthy();
  });
});
