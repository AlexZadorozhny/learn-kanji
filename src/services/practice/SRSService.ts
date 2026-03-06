import { KanjiProgress } from '../../types/progress';

/**
 * Spaced Repetition System (SRS) Service
 * Implements simplified SM-2 algorithm for optimal review scheduling
 */
export class SRSService {
  /**
   * Calculate next review date and update SRS parameters based on user rating
   * @param progress Current kanji progress
   * @param quality User rating (0-5): 0=blackout, 1=incorrect, 2=difficult, 3=correct, 4=easy, 5=perfect
   * @returns Updated progress with new SRS values
   */
  static calculateNextReview(
    progress: KanjiProgress,
    quality: number
  ): Partial<KanjiProgress> {
    let { easinessFactor, interval, repetitions } = progress;

    // Update easiness factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // EF is constrained to minimum of 1.3
    easinessFactor = Math.max(
      1.3,
      easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Update interval and repetitions based on quality
    if (quality < 3) {
      // Incorrect answer: reset interval and repetitions
      repetitions = 0;
      interval = 1;
    } else {
      // Correct answer: increase interval
      if (repetitions === 0) {
        interval = 1; // First review: 1 day
      } else if (repetitions === 1) {
        interval = 6; // Second review: 6 days
      } else {
        interval = Math.round(interval * easinessFactor);
      }
      repetitions++;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Update status based on performance
    let status: KanjiProgress['status'] = progress.status;
    if (quality < 3) {
      status = 'learning';
    } else if (repetitions >= 5 && easinessFactor >= 2.0) {
      status = 'mastered';
    } else if (repetitions > 0) {
      status = 'review';
    }

    return {
      easinessFactor,
      interval,
      repetitions,
      nextReview: nextReview.toISOString(),
      lastReviewed: new Date().toISOString(),
      status,
    };
  }

  /**
   * Get kanji that are due for review
   * @param allProgress All kanji progress records
   * @returns Array of kanji IDs that need review
   */
  static getDueKanji(allProgress: Record<string, KanjiProgress>): string[] {
    const now = new Date();
    return Object.keys(allProgress).filter((kanjiId) => {
      const progress = allProgress[kanjiId];
      const nextReview = new Date(progress.nextReview);
      return nextReview <= now;
    });
  }

  /**
   * Get new kanji (not yet studied)
   * @param allKanjiIds All available kanji IDs
   * @param allProgress All kanji progress records
   * @param limit Maximum number of new kanji to return
   * @returns Array of new kanji IDs
   */
  static getNewKanji(
    allKanjiIds: string[],
    allProgress: Record<string, KanjiProgress>,
    limit: number = 5
  ): string[] {
    return allKanjiIds
      .filter((id) => !allProgress[id])
      .slice(0, limit);
  }

  /**
   * Convert user rating (1-4 buttons) to SM-2 quality (0-5 scale)
   * @param rating User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
   * @returns SM-2 quality score (0-5)
   */
  static ratingToQuality(rating: number): number {
    const qualityMap: Record<number, number> = {
      1: 0, // Again -> Complete blackout
      2: 3, // Hard -> Correct with difficulty
      3: 4, // Good -> Correct after hesitation
      4: 5, // Easy -> Perfect response
    };
    return qualityMap[rating] ?? 3;
  }
}
