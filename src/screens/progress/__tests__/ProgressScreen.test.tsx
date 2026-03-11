import { renderWithProviders } from '../../../test-utils';
import ProgressScreen from '../ProgressScreen';

// Mock the progress store before importing the component
jest.mock('../../../store/progressStore', () => ({
  useProgressStore: jest.fn(),
}));

const { useProgressStore } = require('../../../store/progressStore');

describe('ProgressScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default progress data', () => {
    useProgressStore.mockReturnValue({
      studyStats: {
        totalKanjiStudied: 5,
        kanjiMastered: 2,
        totalStudyTimeMinutes: 45,
        currentStreak: 3,
        longestStreak: 7,
        lastStudyDate: '2026-03-09T00:00:00.000Z',
      },
      kanjiProgress: {
        'U+4E00': {
          kanjiId: 'U+4E00',
          recognitionScore: 75,
          status: 'learning',
        },
        'U+4E8C': {
          kanjiId: 'U+4E8C',
          recognitionScore: 90,
          status: 'mastered',
        },
      },
      isLoaded: true,
      clearProgress: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<ProgressScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with empty progress', () => {
    useProgressStore.mockReturnValue({
      studyStats: {
        totalKanjiStudied: 0,
        kanjiMastered: 0,
        totalStudyTimeMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: new Date().toISOString(),
      },
      kanjiProgress: {},
      isLoaded: true,
      clearProgress: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<ProgressScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays study statistics correctly', () => {
    useProgressStore.mockReturnValue({
      studyStats: {
        totalKanjiStudied: 10,
        kanjiMastered: 5,
        totalStudyTimeMinutes: 120,
        currentStreak: 7,
        longestStreak: 14,
        lastStudyDate: '2026-03-09T00:00:00.000Z',
      },
      kanjiProgress: {},
      isLoaded: true,
      clearProgress: jest.fn(),
    });

    const { getByText } = renderWithProviders(<ProgressScreen />);

    expect(getByText('10')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('120 min')).toBeTruthy();
    expect(getByText('7 days')).toBeTruthy();
    expect(getByText('14 days')).toBeTruthy();
  });
});
