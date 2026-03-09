import { usePracticeStore } from '../practiceStore';
import { PracticeResult } from '../../types/practice';

describe('practiceStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePracticeStore.setState({
      currentSession: null,
    });
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = usePracticeStore.getState();

    expect(state.currentSession).toBeNull();
  });

  it('startSession creates new session with correct mode', () => {
    usePracticeStore.getState().startSession('flashcard', ['U+4E00', 'U+4E8C']);

    const state = usePracticeStore.getState();
    expect(state.currentSession).not.toBeNull();
    expect(state.currentSession?.mode).toBe('flashcard');
  });

  it('startSession sets kanjiIds correctly', () => {
    const kanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09'];

    usePracticeStore.getState().startSession('quiz', kanjiIds);

    const state = usePracticeStore.getState();
    expect(state.currentSession?.kanjiIds).toEqual(kanjiIds);
    expect(state.currentSession?.kanjiIds.length).toBe(3);
  });

  it('startSession initializes session with default values', () => {
    usePracticeStore.getState().startSession('flashcard', ['U+4E00']);

    const session = usePracticeStore.getState().currentSession;
    expect(session).not.toBeNull();
    expect(session?.id).toMatch(/^session_\d+$/);
    expect(session?.completed).toBe(false);
    expect(session?.currentIndex).toBe(0);
    expect(session?.results).toEqual([]);
    expect(session?.startTime).toBeDefined();
  });

  it('addResult adds result to results array', () => {
    usePracticeStore.getState().startSession('quiz', ['U+4E00', 'U+4E8C']);

    const result: PracticeResult = {
      kanjiId: 'U+4E00',
      correct: true,
      rating: 5,
      timeSpent: 3,
    };

    usePracticeStore.getState().addResult(result);

    const session = usePracticeStore.getState().currentSession;
    expect(session?.results.length).toBe(1);
    expect(session?.results[0]).toEqual(result);
  });

  it('addResult accumulates multiple results', () => {
    usePracticeStore.getState().startSession('quiz', ['U+4E00', 'U+4E8C']);

    const result1: PracticeResult = {
      kanjiId: 'U+4E00',
      correct: true,
      rating: 5,
      timeSpent: 3,
    };

    const result2: PracticeResult = {
      kanjiId: 'U+4E8C',
      correct: false,
      rating: 2,
      timeSpent: 5,
    };

    usePracticeStore.getState().addResult(result1);
    usePracticeStore.getState().addResult(result2);

    const session = usePracticeStore.getState().currentSession;
    expect(session?.results.length).toBe(2);
    expect(session?.results[0]).toEqual(result1);
    expect(session?.results[1]).toEqual(result2);
  });

  it('nextCard increments currentIndex', () => {
    usePracticeStore.getState().startSession('flashcard', ['U+4E00', 'U+4E8C', 'U+4E09']);

    expect(usePracticeStore.getState().currentSession?.currentIndex).toBe(0);

    usePracticeStore.getState().nextCard();
    expect(usePracticeStore.getState().currentSession?.currentIndex).toBe(1);

    usePracticeStore.getState().nextCard();
    expect(usePracticeStore.getState().currentSession?.currentIndex).toBe(2);
  });

  it('getSessionResults returns all results', () => {
    usePracticeStore.getState().startSession('quiz', ['U+4E00', 'U+4E8C']);

    const result1: PracticeResult = {
      kanjiId: 'U+4E00',
      correct: true,
      rating: 5,
      timeSpent: 3,
    };

    const result2: PracticeResult = {
      kanjiId: 'U+4E8C',
      correct: false,
      rating: 2,
      timeSpent: 5,
    };

    usePracticeStore.getState().addResult(result1);
    usePracticeStore.getState().addResult(result2);

    const results = usePracticeStore.getState().getSessionResults();
    expect(results.length).toBe(2);
    expect(results).toEqual([result1, result2]);
  });

  it('getSessionResults returns empty array when no session', () => {
    const results = usePracticeStore.getState().getSessionResults();
    expect(results).toEqual([]);
  });

  it('getSessionProgress returns correct current and total', () => {
    usePracticeStore.getState().startSession('flashcard', ['U+4E00', 'U+4E8C', 'U+4E09']);

    let progress = usePracticeStore.getState().getSessionProgress();
    expect(progress.current).toBe(0);
    expect(progress.total).toBe(3);

    usePracticeStore.getState().nextCard();
    progress = usePracticeStore.getState().getSessionProgress();
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(3);
  });

  it('getSessionProgress returns zeros when no session', () => {
    const progress = usePracticeStore.getState().getSessionProgress();
    expect(progress.current).toBe(0);
    expect(progress.total).toBe(0);
  });

  it('endSession sets completed to true and adds endTime', () => {
    usePracticeStore.getState().startSession('flashcard', ['U+4E00']);

    const beforeEnd = usePracticeStore.getState().currentSession;
    expect(beforeEnd?.completed).toBe(false);
    expect(beforeEnd?.endTime).toBeUndefined();

    usePracticeStore.getState().endSession();

    const afterEnd = usePracticeStore.getState().currentSession;
    expect(afterEnd?.completed).toBe(true);
    expect(afterEnd?.endTime).toBeDefined();
  });

  it('endSession does nothing when no session exists', () => {
    expect(usePracticeStore.getState().currentSession).toBeNull();

    // Should not throw error
    usePracticeStore.getState().endSession();

    expect(usePracticeStore.getState().currentSession).toBeNull();
  });

  it('addResult does nothing when no session exists', () => {
    expect(usePracticeStore.getState().currentSession).toBeNull();

    const result: PracticeResult = {
      kanjiId: 'U+4E00',
      correct: true,
      rating: 5,
      timeSpent: 3,
    };

    // Should not throw error
    usePracticeStore.getState().addResult(result);

    expect(usePracticeStore.getState().currentSession).toBeNull();
  });

  it('nextCard does nothing when no session exists', () => {
    expect(usePracticeStore.getState().currentSession).toBeNull();

    // Should not throw error
    usePracticeStore.getState().nextCard();

    expect(usePracticeStore.getState().currentSession).toBeNull();
  });
});
