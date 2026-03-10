import React from 'react';
import { renderWithProviders, fireEvent } from '../../../test-utils';
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

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    // All 3 kanji are in BUNDLED_KANJI_IDS and have stroke data available
    // Both Stroke Order and Context Practice will have this text
    const buttons = getAllByText(/Start Practice \(3 kanji\)/);
    expect(buttons.length).toBeGreaterThan(0);
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

  it('shows flashcard button enabled with available cards', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C']);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('Start (2 cards)')).toBeTruthy();
  });

  it('shows stroke order button with available kanji', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    // All 3 kanji are in BUNDLED_KANJI_IDS and have stroke data available
    // Both Stroke Order and Context Practice will have this text
    const buttons = getAllByText(/Start Practice \(3 kanji\)/);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows multiple choice button with available kanji', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText(/Start Quiz \(3 questions\)/)).toBeTruthy();
  });

  it('shows context practice button with available kanji', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    // Both Stroke Order and Context Practice will have this text
    const buttons = getAllByText(/Start Practice \(3 kanji\)/);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disables stroke order when no kanji with stroke data', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [
        {
          id: 'U+9999',
          character: '香',
          meanings: ['fragrance'],
          strokes: 9,
          // ID not in BUNDLED_KANJI_IDS, so no stroke data available
        },
      ],
    });
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('No kanji available')).toBeTruthy();
  });

  it('disables multiple choice when no kanji available', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [],
    });
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    const noKanjiTexts = getAllByText('No questions available');
    expect(noKanjiTexts.length).toBeGreaterThan(0);
  });

  it('shows correct button text with 1 card available', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    expect(getByText('Start (1 cards)')).toBeTruthy();
  });

  it('renders with dark theme', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C']);

    const { toJSON } = renderWithProviders(<PracticeModeScreen />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('navigates to FlashcardScreen when flashcard button is pressed', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([{ kanjiId: 'U+4E00' }]);
    SRSService.getNewKanji.mockReturnValue(['U+4E8C']);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    const button = getByText('Start (2 cards)');
    fireEvent.press(button);

    expect(mockNavigate).toHaveBeenCalledWith('FlashcardScreen', {});
  });

  it('navigates to StrokeOrderScreen when stroke order button is pressed', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    // All 3 kanji are in BUNDLED_KANJI_IDS and have stroke data available
    // Both Stroke Order and Context Practice have same text, get the first one (Stroke Order)
    const buttons = getAllByText(/Start Practice \(3 kanji\)/);
    fireEvent.press(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('StrokeOrderScreen', expect.objectContaining({
      sessionKey: expect.any(Number)
    }));
  });

  it('navigates to MultipleChoiceScreen when multiple choice button is pressed', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    const button = getByText(/Start Quiz \(3 questions\)/);
    fireEvent.press(button);

    expect(mockNavigate).toHaveBeenCalledWith('MultipleChoiceScreen', {});
  });

  it('navigates to ContextPracticeScreen when context practice button is pressed', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getAllByText } = renderWithProviders(<PracticeModeScreen />);

    // Both Stroke Order and Context Practice have same text, get the second one (Context Practice)
    const buttons = getAllByText(/Start Practice \(3 kanji\)/);
    fireEvent.press(buttons[1]);

    expect(mockNavigate).toHaveBeenCalledWith('ContextPracticeScreen', {});
  });

  it('does not navigate when flashcard button is disabled', () => {
    useProgressStore.mockReturnValue({
      kanjiProgress: {},
    });
    SRSService.getDueKanji.mockReturnValue([]);
    SRSService.getNewKanji.mockReturnValue([]);

    const { getByText } = renderWithProviders(<PracticeModeScreen />);

    const button = getByText('No cards available');
    fireEvent.press(button);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
