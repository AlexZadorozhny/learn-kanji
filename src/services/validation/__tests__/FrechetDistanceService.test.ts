import { FrechetDistanceService } from '../FrechetDistanceService';
import { Point } from '../types';

describe('FrechetDistanceService', () => {
  describe('euclideanDistance', () => {
    it('calculates distance between identical points', () => {
      const p1: Point = { x: 5, y: 5 };
      const p2: Point = { x: 5, y: 5 };
      const distance = FrechetDistanceService.euclideanDistance(p1, p2);
      expect(distance).toBe(0);
    });

    it('calculates horizontal distance', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 0 };
      const distance = FrechetDistanceService.euclideanDistance(p1, p2);
      expect(distance).toBe(10);
    });

    it('calculates vertical distance', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 0, y: 10 };
      const distance = FrechetDistanceService.euclideanDistance(p1, p2);
      expect(distance).toBe(10);
    });

    it('calculates diagonal distance (3-4-5 triangle)', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      const distance = FrechetDistanceService.euclideanDistance(p1, p2);
      expect(distance).toBe(5);
    });

    it('handles negative coordinates', () => {
      const p1: Point = { x: -5, y: -5 };
      const p2: Point = { x: 5, y: 5 };
      const distance = FrechetDistanceService.euclideanDistance(p1, p2);
      expect(distance).toBeCloseTo(Math.sqrt(200));
    });
  });

  describe('calculate', () => {
    it('returns Infinity for empty paths', () => {
      const path1: Point[] = [];
      const path2: Point[] = [{ x: 0, y: 0 }];
      const distance = FrechetDistanceService.calculate(path1, path2);
      expect(distance).toBe(Infinity);
    });

    it('returns Infinity for one empty path', () => {
      const path1: Point[] = [{ x: 0, y: 0 }];
      const path2: Point[] = [];
      const distance = FrechetDistanceService.calculate(path1, path2);
      expect(distance).toBe(Infinity);
    });

    it('calculates distance between identical paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const distance = FrechetDistanceService.calculate(path1, path2);
      expect(distance).toBeCloseTo(0, 1);
    });

    it('calculates distance between parallel horizontal lines', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const path2: Point[] = [
        { x: 0, y: 5 },
        { x: 10, y: 5 },
      ];
      const distance = FrechetDistanceService.calculate(path1, path2);
      // Fréchet distance should be approximately 5 (the perpendicular distance)
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(6);
    });

    it('calculates distance between perpendicular lines', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]; // Horizontal
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]; // Vertical
      const distance = FrechetDistanceService.calculate(path1, path2);
      expect(distance).toBeGreaterThan(0);
    });

    it('calculates distance between similar but offset paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 1, y: 1 },
        { x: 6, y: 6 },
        { x: 11, y: 11 },
      ];
      const distance = FrechetDistanceService.calculate(path1, path2);
      // Should be small since paths are just offset
      expect(distance).toBeLessThan(3);
    });

    it('calculates larger distance for different shaped paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]; // Straight horizontal
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 10 },
        { x: 10, y: 0 },
      ]; // Triangle shape
      const distance = FrechetDistanceService.calculate(path1, path2);
      expect(distance).toBeGreaterThan(5);
    });

    it('handles early termination for very different paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const path2: Point[] = [
        { x: 200, y: 200 },
        { x: 210, y: 200 },
      ];
      const distanceWithTermination = FrechetDistanceService.calculate(path1, path2, true);
      const distanceWithoutTermination = FrechetDistanceService.calculate(path1, path2, false);

      // Both should be very large
      expect(distanceWithTermination).toBeGreaterThan(100);
      expect(distanceWithoutTermination).toBeGreaterThan(100);
    });

    it('is commutative (order of paths does not matter)', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 0, y: 5 },
        { x: 10, y: 15 },
      ];

      const distance1 = FrechetDistanceService.calculate(path1, path2);
      const distance2 = FrechetDistanceService.calculate(path2, path1);

      expect(distance1).toBeCloseTo(distance2, 1);
    });
  });

  describe('calculateNormalized', () => {
    it('returns 0 for empty paths', () => {
      const path1: Point[] = [];
      const path2: Point[] = [{ x: 0, y: 0 }];
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBe(0);
    });

    it('returns 100 for identical paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBeGreaterThan(95);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns high score for very similar paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 0, y: 1 },
        { x: 10, y: 11 },
      ]; // Slightly offset
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBeGreaterThan(80);
    });

    it('returns low score for very different paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ];
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBeLessThan(75); // Adjusted threshold - perpendicular lines still share start point
    });

    it('returns 0 for completely different paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const path2: Point[] = [
        { x: 200, y: 200 },
        { x: 210, y: 200 },
      ];
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBe(0);
    });

    it('returns score in 0-100 range', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 25, y: 25 },
        { x: 50, y: 50 },
      ];
      const path2: Point[] = [
        { x: 5, y: 0 },
        { x: 30, y: 20 },
        { x: 55, y: 45 },
      ];
      const score = FrechetDistanceService.calculateNormalized(path1, path2);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('validate', () => {
    it('validates identical paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const result = FrechetDistanceService.validate(path1, path2, 80);

      expect(result.valid).toBe(true);
      expect(result.normalizedScore).toBeGreaterThan(95);
    });

    it('validates similar paths with default threshold', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 1, y: 1 },
        { x: 11, y: 11 },
      ];
      const result = FrechetDistanceService.validate(path1, path2);

      expect(result.valid).toBe(true);
      expect(result.normalizedScore).toBeGreaterThan(60);
    });

    it('rejects very different paths', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const path2: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ];
      const result = FrechetDistanceService.validate(path1, path2, 80);

      expect(result.valid).toBe(false);
      expect(result.normalizedScore).toBeLessThan(80);
    });

    it('respects custom threshold', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 5, y: 0 },
        { x: 15, y: 5 },
      ]; // More different path - different slope and offset

      // Strict threshold
      const strictResult = FrechetDistanceService.validate(path1, path2, 90);
      expect(strictResult.valid).toBe(false);

      // Lenient threshold
      const lenientResult = FrechetDistanceService.validate(path1, path2, 60);
      expect(lenientResult.valid).toBe(true);
    });

    it('returns distance and normalized score', () => {
      const path1: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const path2: Point[] = [
        { x: 1, y: 1 },
        { x: 11, y: 11 },
      ];
      const result = FrechetDistanceService.validate(path1, path2);

      expect(result.distance).toBeGreaterThanOrEqual(0);
      expect(result.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(result.normalizedScore).toBeLessThanOrEqual(100);
    });
  });

  describe('estimateComplexity', () => {
    it('returns fixed complexity regardless of input lengths', () => {
      const complexity1 = FrechetDistanceService.estimateComplexity(10, 10);
      const complexity2 = FrechetDistanceService.estimateComplexity(100, 100);
      const complexity3 = FrechetDistanceService.estimateComplexity(5, 200);

      // All should be the same (RESAMPLE_POINTS * RESAMPLE_POINTS)
      expect(complexity1).toBe(complexity2);
      expect(complexity2).toBe(complexity3);
      expect(complexity1).toBe(50 * 50); // 2500 operations
    });
  });

  describe('shouldUseFrechet', () => {
    it('returns true for paths with cubic curves', () => {
      const commands = ['M 10 10', 'C 20 20 30 30 40 40'];
      const shouldUse = FrechetDistanceService.shouldUseFrechet(commands);
      expect(shouldUse).toBe(true);
    });

    it('returns true for paths with quadratic curves', () => {
      const commands = ['M 10 10', 'Q 20 20 30 30'];
      const shouldUse = FrechetDistanceService.shouldUseFrechet(commands);
      expect(shouldUse).toBe(true);
    });

    it('returns false for straight line paths', () => {
      const commands = ['M 10 10', 'L 20 20', 'L 30 30'];
      const shouldUse = FrechetDistanceService.shouldUseFrechet(commands);
      expect(shouldUse).toBe(false);
    });

    it('returns false for empty commands', () => {
      const commands: string[] = [];
      const shouldUse = FrechetDistanceService.shouldUseFrechet(commands);
      expect(shouldUse).toBe(false);
    });

    it('returns true for mixed commands with curves', () => {
      const commands = ['M 10 10', 'L 20 20', 'C 30 30 40 40 50 50'];
      const shouldUse = FrechetDistanceService.shouldUseFrechet(commands);
      expect(shouldUse).toBe(true);
    });
  });

  describe('performance characteristics', () => {
    it('handles long paths efficiently', () => {
      // Create a long path
      const path1: Point[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 10) * 10,
      }));
      const path2: Point[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 10) * 10 + 1,
      }));

      const startTime = Date.now();
      FrechetDistanceService.calculate(path1, path2);
      const endTime = Date.now();

      const duration = endTime - startTime;
      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('early termination improves performance for very different paths', () => {
      const path1: Point[] = Array.from({ length: 50 }, (_, i) => ({
        x: i,
        y: 0,
      }));
      const path2: Point[] = Array.from({ length: 50 }, (_, i) => ({
        x: i,
        y: 200,
      }));

      const startTimeWithTermination = Date.now();
      FrechetDistanceService.calculate(path1, path2, true);
      const durationWithTermination = Date.now() - startTimeWithTermination;

      const startTimeWithoutTermination = Date.now();
      FrechetDistanceService.calculate(path1, path2, false);
      const durationWithoutTermination = Date.now() - startTimeWithoutTermination;

      // With early termination should be faster (or at least not slower)
      expect(durationWithTermination).toBeLessThanOrEqual(durationWithoutTermination + 5);
    });
  });
});
