export interface MistakeLog {
  timestamp: string;
  practiceMode: 'flashcard' | 'writing' | 'quiz' | 'context';
  mistakeType: string; // e.g., "confused_with", "stroke_order_error"
  details?: any;
}

export interface KanjiProgress {
  kanjiId: string;
  status: 'new' | 'learning' | 'mastered' | 'review';
  recognitionScore: number;      // 0-100
  writingScore: number;          // 0-100
  readingScore: number;          // 0-100
  contextScore: number;          // 0-100
  lastReviewed: string;          // ISO date
  nextReview: string;            // SRS schedule (ISO date)
  totalAttempts: number;
  correctAttempts: number;
  mistakeHistory: MistakeLog[];
  // SRS-specific fields
  easinessFactor: number;        // 1.3 to 2.5 (default: 2.5)
  interval: number;              // Days until next review
  repetitions: number;           // Consecutive correct reviews
}

export interface StudyStats {
  totalKanjiStudied: number;
  kanjiMastered: number;
  totalStudyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;         // ISO date
}

export interface UserProgress {
  userId: string;
  kanjiProgress: Record<string, KanjiProgress>; // Keyed by kanji.id
  studyStats: StudyStats;
  lastStudyDate: string;
  currentLesson: number;
}
