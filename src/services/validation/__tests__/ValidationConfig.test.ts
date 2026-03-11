import { ValidationConfig } from '../ValidationConfig';

describe('ValidationConfig', () => {
  describe('getAccuracyThreshold', () => {
    it('returns 75 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getAccuracyThreshold(1)).toBe(75);
      expect(ValidationConfig.getAccuracyThreshold(2)).toBe(75);
    });

    it('returns 65 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getAccuracyThreshold(3)).toBe(65);
      expect(ValidationConfig.getAccuracyThreshold(5)).toBe(65);
      expect(ValidationConfig.getAccuracyThreshold(7)).toBe(65);
    });

    it('returns 60 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getAccuracyThreshold(8)).toBe(60);
      expect(ValidationConfig.getAccuracyThreshold(12)).toBe(60);
      expect(ValidationConfig.getAccuracyThreshold(20)).toBe(60);
    });
  });

  describe('applyLearningMode', () => {
    it('reduces threshold by 10 for first 3 attempts', () => {
      const baseThreshold = 70;

      expect(ValidationConfig.applyLearningMode(baseThreshold, 1)).toBe(60);
      expect(ValidationConfig.applyLearningMode(baseThreshold, 2)).toBe(60);
      expect(ValidationConfig.applyLearningMode(baseThreshold, 3)).toBe(60);
    });

    it('keeps original threshold after 3 attempts', () => {
      const baseThreshold = 70;

      expect(ValidationConfig.applyLearningMode(baseThreshold, 4)).toBe(70);
      expect(ValidationConfig.applyLearningMode(baseThreshold, 5)).toBe(70);
      expect(ValidationConfig.applyLearningMode(baseThreshold, 10)).toBe(70);
    });

    it('enforces minimum threshold of 50', () => {
      const baseThreshold = 55;

      expect(ValidationConfig.applyLearningMode(baseThreshold, 1)).toBe(50);
      expect(ValidationConfig.applyLearningMode(baseThreshold, 2)).toBe(50);
    });

    it('never goes below 50 even with very low base threshold', () => {
      const baseThreshold = 40;

      expect(ValidationConfig.applyLearningMode(baseThreshold, 1)).toBe(50);
    });
  });

  describe('getFrechetThreshold', () => {
    it('returns 70 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getFrechetThreshold(1)).toBe(70);
      expect(ValidationConfig.getFrechetThreshold(2)).toBe(70);
    });

    it('returns 60 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getFrechetThreshold(3)).toBe(60);
      expect(ValidationConfig.getFrechetThreshold(5)).toBe(60);
      expect(ValidationConfig.getFrechetThreshold(7)).toBe(60);
    });

    it('returns 55 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getFrechetThreshold(8)).toBe(55);
      expect(ValidationConfig.getFrechetThreshold(12)).toBe(55);
    });
  });

  describe('getStartPointTolerance', () => {
    it('returns 15 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getStartPointTolerance(1)).toBe(15);
      expect(ValidationConfig.getStartPointTolerance(2)).toBe(15);
    });

    it('returns 18 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getStartPointTolerance(3)).toBe(18);
      expect(ValidationConfig.getStartPointTolerance(5)).toBe(18);
      expect(ValidationConfig.getStartPointTolerance(7)).toBe(18);
    });

    it('returns 20 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getStartPointTolerance(8)).toBe(20);
      expect(ValidationConfig.getStartPointTolerance(12)).toBe(20);
    });
  });

  describe('getEndPointTolerance', () => {
    it('returns 15 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getEndPointTolerance(1)).toBe(15);
      expect(ValidationConfig.getEndPointTolerance(2)).toBe(15);
    });

    it('returns 18 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getEndPointTolerance(3)).toBe(18);
      expect(ValidationConfig.getEndPointTolerance(5)).toBe(18);
      expect(ValidationConfig.getEndPointTolerance(7)).toBe(18);
    });

    it('returns 20 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getEndPointTolerance(8)).toBe(20);
      expect(ValidationConfig.getEndPointTolerance(12)).toBe(20);
    });
  });

  describe('getDirectionTolerance', () => {
    it('returns 45 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getDirectionTolerance(1)).toBe(45);
      expect(ValidationConfig.getDirectionTolerance(2)).toBe(45);
    });

    it('returns 50 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getDirectionTolerance(3)).toBe(50);
      expect(ValidationConfig.getDirectionTolerance(5)).toBe(50);
      expect(ValidationConfig.getDirectionTolerance(7)).toBe(50);
    });

    it('returns 55 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getDirectionTolerance(8)).toBe(55);
      expect(ValidationConfig.getDirectionTolerance(12)).toBe(55);
    });
  });

  describe('getBoundingBoxTolerance', () => {
    it('returns 25 for easy kanji (1-2 strokes)', () => {
      expect(ValidationConfig.getBoundingBoxTolerance(1)).toBe(25);
      expect(ValidationConfig.getBoundingBoxTolerance(2)).toBe(25);
    });

    it('returns 28 for medium kanji (3-7 strokes)', () => {
      expect(ValidationConfig.getBoundingBoxTolerance(3)).toBe(28);
      expect(ValidationConfig.getBoundingBoxTolerance(5)).toBe(28);
      expect(ValidationConfig.getBoundingBoxTolerance(7)).toBe(28);
    });

    it('returns 30 for complex kanji (8+ strokes)', () => {
      expect(ValidationConfig.getBoundingBoxTolerance(8)).toBe(30);
      expect(ValidationConfig.getBoundingBoxTolerance(12)).toBe(30);
    });
  });

  describe('shouldUseFrechetDistance', () => {
    it('returns true for paths with cubic curves', () => {
      const commands = ['M 10 10', 'C 20 20 30 30 40 40'];
      expect(ValidationConfig.shouldUseFrechetDistance(commands)).toBe(true);
    });

    it('returns true for paths with quadratic curves', () => {
      const commands = ['M 10 10', 'Q 20 20 30 30'];
      expect(ValidationConfig.shouldUseFrechetDistance(commands)).toBe(true);
    });

    it('returns false for straight line paths', () => {
      const commands = ['M 10 10', 'L 20 20', 'L 30 30'];
      expect(ValidationConfig.shouldUseFrechetDistance(commands)).toBe(false);
    });

    it('returns false for empty commands', () => {
      const commands: string[] = [];
      expect(ValidationConfig.shouldUseFrechetDistance(commands)).toBe(false);
    });

    it('returns true for mixed commands with curves', () => {
      const commands = ['M 10 10', 'L 20 20', 'C 30 30 40 40 50 50'];
      expect(ValidationConfig.shouldUseFrechetDistance(commands)).toBe(true);
    });
  });

  describe('getValidationStrategy', () => {
    it('returns geometric for straight stroke paths', () => {
      const commands = ['M 10 10', 'L 50 50'];
      const strategy = ValidationConfig.getValidationStrategy(commands, 5);
      expect(strategy).toBe('geometric');
    });

    it('returns hybrid for simple curved kanji', () => {
      const commands = ['M 10 10', 'C 20 20 30 30 40 40'];
      const strategy = ValidationConfig.getValidationStrategy(commands, 2);
      expect(strategy).toBe('hybrid');
    });

    it('returns frechet for complex curved kanji', () => {
      const commands = ['M 10 10', 'Q 20 20 30 30'];
      const strategy = ValidationConfig.getValidationStrategy(commands, 8);
      expect(strategy).toBe('frechet');
    });

    it('returns geometric for straight strokes regardless of complexity', () => {
      const commands = ['M 10 10', 'L 20 20', 'L 30 30'];
      const strategy1 = ValidationConfig.getValidationStrategy(commands, 1);
      const strategy2 = ValidationConfig.getValidationStrategy(commands, 10);
      expect(strategy1).toBe('geometric');
      expect(strategy2).toBe('geometric');
    });
  });

  describe('adaptive threshold scaling', () => {
    it('shows progressively lenient thresholds as complexity increases', () => {
      const easy = ValidationConfig.getAccuracyThreshold(2);
      const medium = ValidationConfig.getAccuracyThreshold(5);
      const complex = ValidationConfig.getAccuracyThreshold(10);

      expect(easy).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(complex);
    });

    it('shows progressively lenient start point tolerances', () => {
      const easy = ValidationConfig.getStartPointTolerance(2);
      const medium = ValidationConfig.getStartPointTolerance(5);
      const complex = ValidationConfig.getStartPointTolerance(10);

      expect(complex).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(easy);
    });

    it('shows progressively lenient direction tolerances', () => {
      const easy = ValidationConfig.getDirectionTolerance(2);
      const medium = ValidationConfig.getDirectionTolerance(5);
      const complex = ValidationConfig.getDirectionTolerance(10);

      expect(complex).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(easy);
    });
  });

  describe('learning mode impact', () => {
    it('applies learning mode to all complexity levels', () => {
      const easyBase = ValidationConfig.getAccuracyThreshold(2);
      const mediumBase = ValidationConfig.getAccuracyThreshold(5);
      const complexBase = ValidationConfig.getAccuracyThreshold(10);

      const easyLearning = ValidationConfig.applyLearningMode(easyBase, 1);
      const mediumLearning = ValidationConfig.applyLearningMode(mediumBase, 1);
      const complexLearning = ValidationConfig.applyLearningMode(complexBase, 1);

      expect(easyLearning).toBeLessThan(easyBase);
      expect(mediumLearning).toBeLessThan(mediumBase);
      expect(complexLearning).toBeLessThan(complexBase);
    });

    it('maintains relative difficulty even in learning mode', () => {
      const easy = ValidationConfig.applyLearningMode(ValidationConfig.getAccuracyThreshold(2), 1);
      const medium = ValidationConfig.applyLearningMode(
        ValidationConfig.getAccuracyThreshold(5),
        1
      );
      const complex = ValidationConfig.applyLearningMode(
        ValidationConfig.getAccuracyThreshold(10),
        1
      );

      expect(easy).toBeGreaterThanOrEqual(medium);
      expect(medium).toBeGreaterThanOrEqual(complex);
    });
  });
});
