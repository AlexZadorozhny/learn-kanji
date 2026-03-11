import { SRSService } from '../SRSService';
import { KanjiProgress } from '../../../types/progress';

describe('SRSService', () => {
  describe('calculateNextReview', () => {
    const baseProgress: KanjiProgress = {
      kanjiId: 'U+4E00',
      recognitionScore: 50,
      readingScore: 50,
      writingScore: 50,
      contextScore: 50,
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      status: 'learning',
    };

    it('resets progress on incorrect answer (quality < 3)', () => {
      const result = SRSService.calculateNextReview(baseProgress, 2);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.status).toBe('learning');
    });

    it('increases interval on correct answer (quality >= 3)', () => {
      const result = SRSService.calculateNextReview(baseProgress, 4);

      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1); // First review interval
    });

    it('sets status to mastered after 5+ repetitions with good EF', () => {
      const masteredProgress: KanjiProgress = {
        ...baseProgress,
        repetitions: 4,
        easinessFactor: 2.0,
      };

      const result = SRSService.calculateNextReview(masteredProgress, 5);

      expect(result.repetitions).toBe(5);
      expect(result.status).toBe('mastered');
    });

    it('calculates easiness factor correctly', () => {
      const result = SRSService.calculateNextReview(baseProgress, 5);

      expect(result.easinessFactor).toBeGreaterThan(baseProgress.easinessFactor);
    });

    it('constrains easiness factor to minimum of 1.3', () => {
      const lowEFProgress: KanjiProgress = {
        ...baseProgress,
        easinessFactor: 1.3,
      };

      const result = SRSService.calculateNextReview(lowEFProgress, 0);

      expect(result.easinessFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getDueKanji', () => {
    it('returns kanji due for review', () => {
      const kanjiProgress = {
        'U+4E00': {
          kanjiId: 'U+4E00',
          nextReview: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        } as KanjiProgress,
        'U+4E8C': {
          kanjiId: 'U+4E8C',
          nextReview: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        } as KanjiProgress,
      };

      const dueKanji = SRSService.getDueKanji(kanjiProgress);

      expect(dueKanji).toEqual(['U+4E00']);
    });

    it('returns empty array when no kanji are due', () => {
      const kanjiProgress = {
        'U+4E00': {
          kanjiId: 'U+4E00',
          nextReview: new Date(Date.now() + 86400000).toISOString(),
        } as KanjiProgress,
      };

      const dueKanji = SRSService.getDueKanji(kanjiProgress);

      expect(dueKanji).toEqual([]);
    });
  });

  describe('getNewKanji', () => {
    it('returns new kanji not yet in progress', () => {
      const allKanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09'];
      const kanjiProgress = {
        'U+4E00': {} as KanjiProgress,
      };

      const newKanji = SRSService.getNewKanji(allKanjiIds, kanjiProgress, 5);

      expect(newKanji).toEqual(['U+4E8C', 'U+4E09']);
    });

    it('limits returned kanji to maxCount', () => {
      const allKanjiIds = ['U+4E00', 'U+4E8C', 'U+4E09', 'U+56DB', 'U+4E94'];
      const kanjiProgress = {};

      const newKanji = SRSService.getNewKanji(allKanjiIds, kanjiProgress, 2);

      expect(newKanji.length).toBe(2);
    });
  });

  describe('ratingToQuality', () => {
    it('converts rating 1 (Again) to quality 0', () => {
      expect(SRSService.ratingToQuality(1)).toBe(0);
    });

    it('converts rating 2 (Hard) to quality 3', () => {
      expect(SRSService.ratingToQuality(2)).toBe(3);
    });

    it('converts rating 3 (Good) to quality 4', () => {
      expect(SRSService.ratingToQuality(3)).toBe(4);
    });

    it('converts rating 4 (Easy) to quality 5', () => {
      expect(SRSService.ratingToQuality(4)).toBe(5);
    });
  });
});
