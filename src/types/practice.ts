import { KanjiCharacter } from './kanji';

export type PracticeMode = 'flashcard' | 'writing' | 'quiz' | 'context';

export interface PracticeSession {
  id: string;
  mode: PracticeMode;
  kanjiIds: string[];
  startTime: string;          // ISO date
  endTime?: string;           // ISO date
  completed: boolean;
  currentIndex: number;
  results: PracticeResult[];
}

export interface PracticeResult {
  kanjiId: string;
  correct: boolean;
  rating?: number;            // 0-5 for SRS (flashcard mode)
  timeSpent: number;          // seconds
  mistakeType?: string;
}

export interface QuizQuestion {
  id: string;
  kanji: KanjiCharacter;
  questionType: 'meaningToKanji' | 'kanjiToMeaning' | 'reading';
  question: string;
  correctAnswer: string;
  options: string[];          // 4 options including correct answer
  correctIndex: number;       // Index of correct answer in options
}

export interface FlashcardState {
  showAnswer: boolean;
  rating: number | null;
}
