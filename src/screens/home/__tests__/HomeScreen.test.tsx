import React from 'react';
import { renderWithProviders } from '../../../test-utils';
import { mockKanjiOne, mockKanjiTwo } from '../../../test-utils/mock-data';
import HomeScreen from '../HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock kanji store
jest.mock('../../../store/kanjiStore', () => ({
  useKanjiStore: jest.fn(),
}));

const { useKanjiStore } = require('../../../store/kanjiStore');

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with kanji data', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [mockKanjiOne, mockKanjiTwo],
      loading: false,
      loadKanji: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('shows loading state', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [],
      loading: true,
      loadKanji: jest.fn(),
    });

    const { toJSON } = renderWithProviders(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays loading indicator when loading', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [],
      loading: true,
      loadKanji: jest.fn(),
    });

    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText('Loading kanji...')).toBeTruthy();
  });

  it('displays kanji count in header', () => {
    useKanjiStore.mockReturnValue({
      kanjiData: [mockKanjiOne, mockKanjiTwo],
      loading: false,
      loadKanji: jest.fn(),
    });

    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText('2 characters available')).toBeTruthy();
  });

  it('calls loadKanji on mount', () => {
    const mockLoadKanji = jest.fn();
    useKanjiStore.mockReturnValue({
      kanjiData: [],
      loading: false,
      loadKanji: mockLoadKanji,
    });

    renderWithProviders(<HomeScreen />);

    expect(mockLoadKanji).toHaveBeenCalledTimes(1);
  });
});
