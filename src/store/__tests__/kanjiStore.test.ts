import { useKanjiStore } from '../kanjiStore';
import { sampleKanjiData } from '../../data/sample-data';

describe('kanjiStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useKanjiStore.setState({
      kanjiData: [],
      loading: false,
    });
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('has correct initial state', () => {
    const state = useKanjiStore.getState();

    expect(state.kanjiData).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('setKanjiData updates kanjiData', () => {
    const testData = [sampleKanjiData[0], sampleKanjiData[1]];

    useKanjiStore.getState().setKanjiData(testData);

    expect(useKanjiStore.getState().kanjiData).toEqual(testData);
    expect(useKanjiStore.getState().kanjiData.length).toBe(2);
  });

  it('setKanjiData replaces existing data', () => {
    // Set initial data
    useKanjiStore.getState().setKanjiData([sampleKanjiData[0]]);
    expect(useKanjiStore.getState().kanjiData.length).toBe(1);

    // Replace with new data
    const newData = [sampleKanjiData[1], sampleKanjiData[2]];
    useKanjiStore.getState().setKanjiData(newData);

    expect(useKanjiStore.getState().kanjiData).toEqual(newData);
    expect(useKanjiStore.getState().kanjiData.length).toBe(2);
  });

  it('loadKanji sets loading to true immediately', () => {
    jest.useFakeTimers();

    expect(useKanjiStore.getState().loading).toBe(false);

    useKanjiStore.getState().loadKanji();

    expect(useKanjiStore.getState().loading).toBe(true);

    jest.useRealTimers();
  });

  it('loadKanji sets loading to false after timeout', () => {
    jest.useFakeTimers();

    useKanjiStore.getState().loadKanji();
    expect(useKanjiStore.getState().loading).toBe(true);

    // Fast-forward 100ms (the timeout duration)
    jest.advanceTimersByTime(100);

    expect(useKanjiStore.getState().loading).toBe(false);

    jest.useRealTimers();
  });

  it('loadKanji populates kanjiData with sample data', () => {
    jest.useFakeTimers();

    expect(useKanjiStore.getState().kanjiData).toEqual([]);

    useKanjiStore.getState().loadKanji();
    jest.advanceTimersByTime(100);

    expect(useKanjiStore.getState().kanjiData).toEqual(sampleKanjiData);
    expect(useKanjiStore.getState().kanjiData.length).toBe(sampleKanjiData.length);
  });

  it('getKanjiById returns correct kanji for valid ID', () => {
    // Load data first
    useKanjiStore.getState().setKanjiData(sampleKanjiData);

    const kanji = useKanjiStore.getState().getKanjiById('U+4E00');

    expect(kanji).toBeDefined();
    expect(kanji?.id).toBe('U+4E00');
    expect(kanji?.character).toBe('一');
  });

  it('getKanjiById returns undefined for non-existent ID', () => {
    useKanjiStore.getState().setKanjiData(sampleKanjiData);

    const kanji = useKanjiStore.getState().getKanjiById('U+INVALID');

    expect(kanji).toBeUndefined();
  });

  it('getKanjiById returns undefined when kanjiData is empty', () => {
    expect(useKanjiStore.getState().kanjiData).toEqual([]);

    const kanji = useKanjiStore.getState().getKanjiById('U+4E00');

    expect(kanji).toBeUndefined();
  });
});
