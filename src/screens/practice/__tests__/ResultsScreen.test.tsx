import { renderWithProviders } from '../../../test-utils';
import ResultsScreen from '../ResultsScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock stores
jest.mock('../../../store/practiceStore', () => ({
  usePracticeStore: jest.fn(),
}));

jest.mock('../../../store/kanjiStore', () => ({
  useKanjiStore: jest.fn(),
}));

const { usePracticeStore } = require('../../../store/practiceStore');
const { useKanjiStore } = require('../../../store/kanjiStore');

describe('ResultsScreen', () => {
  const mockKanjiData = [
    {
      id: 'U+4E00',
      character: '一',
      meanings: ['one', 'single'],
      onYomi: [{ reading: 'イチ', romaji: 'ichi' }],
      kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
      strokes: 1,
      frequencyRank: 1,
    },
    {
      id: 'U+4E8C',
      character: '二',
      meanings: ['two'],
      onYomi: [{ reading: 'ニ', romaji: 'ni' }],
      kunYomi: [{ reading: 'ふた', romaji: 'futa' }],
      strokes: 2,
      frequencyRank: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useKanjiStore.mockReturnValue({
      kanjiData: mockKanjiData,
    });
  });

  it('renders correctly with high accuracy session', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        startTime: Date.now() - 60000,
        results: [
          { kanjiId: 'U+4E00', correct: true, timeSpent: 5 },
          { kanjiId: 'U+4E8C', correct: true, timeSpent: 4 },
        ],
      },
    });

    const { toJSON } = renderWithProviders(<ResultsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with medium accuracy session', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        startTime: Date.now() - 60000,
        results: [
          { kanjiId: 'U+4E00', correct: true, timeSpent: 5 },
          { kanjiId: 'U+4E8C', correct: false, timeSpent: 8 },
        ],
      },
    });

    const { toJSON } = renderWithProviders(<ResultsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with low accuracy session', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        startTime: Date.now() - 60000,
        results: [
          { kanjiId: 'U+4E00', correct: false, timeSpent: 10 },
          { kanjiId: 'U+4E8C', correct: false, timeSpent: 12 },
        ],
      },
    });

    const { toJSON } = renderWithProviders(<ResultsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('does not render when no session exists', () => {
    usePracticeStore.mockReturnValue({
      currentSession: null,
    });

    const { queryByText } = renderWithProviders(<ResultsScreen />);
    // Should not render any content when no session
    expect(queryByText('Session Complete!')).toBeNull();
    expect(queryByText('Great work!')).toBeNull();
  });

  it('displays correct statistics', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        startTime: Date.now() - 60000,
        results: [
          { kanjiId: 'U+4E00', correct: true, timeSpent: 5 },
          { kanjiId: 'U+4E8C', correct: true, timeSpent: 3 },
        ],
      },
    });

    const { getByText } = renderWithProviders(<ResultsScreen />);

    expect(getByText('Session Complete!')).toBeTruthy();
    expect(getByText('2/2')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy();
    expect(getByText('4s')).toBeTruthy(); // Average time
  });

  it('displays card review section', () => {
    usePracticeStore.mockReturnValue({
      currentSession: {
        mode: 'flashcard',
        startTime: Date.now() - 60000,
        results: [
          { kanjiId: 'U+4E00', correct: true, timeSpent: 5 },
          { kanjiId: 'U+4E8C', correct: false, timeSpent: 8 },
        ],
      },
    });

    const { getByText } = renderWithProviders(<ResultsScreen />);

    expect(getByText('Card Review')).toBeTruthy();
    expect(getByText('一')).toBeTruthy();
    expect(getByText('二')).toBeTruthy();
    expect(getByText('one')).toBeTruthy();
    expect(getByText('two')).toBeTruthy();
  });
});
