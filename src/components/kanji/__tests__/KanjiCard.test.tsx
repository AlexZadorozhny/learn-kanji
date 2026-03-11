import { renderWithProviders } from '../../../test-utils';
import KanjiCard from '../KanjiCard';
import { mockKanjiOne, mockKanjiTwo } from '../../../test-utils/mock-data';

describe('KanjiCard', () => {
  it('renders correctly with kanji data', () => {
    const { toJSON } = renderWithProviders(<KanjiCard kanji={mockKanjiOne} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with different kanji', () => {
    const { toJSON } = renderWithProviders(<KanjiCard kanji={mockKanjiTwo} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with onPress handler', () => {
    const mockPress = jest.fn();
    const { toJSON } = renderWithProviders(<KanjiCard kanji={mockKanjiOne} onPress={mockPress} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays character, meanings, and readings', () => {
    const { getByText } = renderWithProviders(<KanjiCard kanji={mockKanjiOne} />);

    expect(getByText('一')).toBeTruthy();
    expect(getByText('one, single')).toBeTruthy();
    expect(getByText('イチ, イツ')).toBeTruthy();
  });
});
