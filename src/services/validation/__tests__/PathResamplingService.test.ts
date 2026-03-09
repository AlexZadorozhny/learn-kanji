import { PathResamplingService } from '../PathResamplingService';
import { Point } from '../types';

describe('PathResamplingService', () => {
  describe('calculatePathLength', () => {
    it('returns 0 for empty path', () => {
      const length = PathResamplingService.calculatePathLength([]);
      expect(length).toBe(0);
    });

    it('returns 0 for single point', () => {
      const length = PathResamplingService.calculatePathLength([
        { x: 10, y: 10 },
      ]);
      expect(length).toBe(0);
    });

    it('calculates length of straight horizontal line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const length = PathResamplingService.calculatePathLength(points);
      expect(length).toBe(10);
    });

    it('calculates length of straight vertical line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ];
      const length = PathResamplingService.calculatePathLength(points);
      expect(length).toBe(10);
    });

    it('calculates length of diagonal line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ];
      const length = PathResamplingService.calculatePathLength(points);
      expect(length).toBe(5); // 3-4-5 triangle
    });

    it('calculates length of multi-segment path', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 4 },
      ];
      const length = PathResamplingService.calculatePathLength(points);
      expect(length).toBe(7); // 3 + 4
    });
  });

  describe('getPointAtDistance', () => {
    it('throws error for empty path', () => {
      expect(() => {
        PathResamplingService.getPointAtDistance([], 5);
      }).toThrow('Cannot get point from empty path');
    });

    it('returns first point for single-point path', () => {
      const points: Point[] = [{ x: 10, y: 20 }];
      const point = PathResamplingService.getPointAtDistance(points, 5);
      expect(point).toEqual({ x: 10, y: 20 });
    });

    it('returns first point for distance <= 0', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const point = PathResamplingService.getPointAtDistance(points, 0);
      expect(point).toEqual({ x: 0, y: 0 });
    });

    it('returns last point for distance exceeding path length', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const point = PathResamplingService.getPointAtDistance(points, 100);
      expect(point).toEqual({ x: 10, y: 0 });
    });

    it('interpolates point at middle of horizontal line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const point = PathResamplingService.getPointAtDistance(points, 5);
      expect(point.x).toBeCloseTo(5);
      expect(point.y).toBeCloseTo(0);
    });

    it('interpolates point at middle of diagonal line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const point = PathResamplingService.getPointAtDistance(
        points,
        Math.sqrt(50) // Half of sqrt(200)
      );
      expect(point.x).toBeCloseTo(5);
      expect(point.y).toBeCloseTo(5);
    });

    it('interpolates point in second segment of multi-segment path', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const point = PathResamplingService.getPointAtDistance(points, 15); // 10 + 5
      expect(point.x).toBeCloseTo(10);
      expect(point.y).toBeCloseTo(5);
    });
  });

  describe('resample', () => {
    it('returns empty array for empty path', () => {
      const resampled = PathResamplingService.resample([], 10);
      expect(resampled).toEqual([]);
    });

    it('returns single point for single-point path', () => {
      const points: Point[] = [{ x: 10, y: 20 }];
      const resampled = PathResamplingService.resample(points, 10);
      expect(resampled).toHaveLength(1);
      expect(resampled[0]).toEqual({ x: 10, y: 20 });
    });

    it('returns single point when targetCount is 1', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const resampled = PathResamplingService.resample(points, 1);
      expect(resampled).toHaveLength(1);
      expect(resampled[0]).toEqual({ x: 0, y: 0 });
    });

    it('resamples horizontal line to 3 points', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const resampled = PathResamplingService.resample(points, 3);
      expect(resampled).toHaveLength(3);
      expect(resampled[0].x).toBeCloseTo(0);
      expect(resampled[1].x).toBeCloseTo(5);
      expect(resampled[2].x).toBeCloseTo(10);
      expect(resampled[0].y).toBeCloseTo(0);
      expect(resampled[1].y).toBeCloseTo(0);
      expect(resampled[2].y).toBeCloseTo(0);
    });

    it('resamples diagonal line to 5 points', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const resampled = PathResamplingService.resample(points, 5);
      expect(resampled).toHaveLength(5);
      expect(resampled[0]).toEqual({ x: 0, y: 0 });
      expect(resampled[4]).toEqual({ x: 10, y: 10 });
      // Check intermediate points
      expect(resampled[2].x).toBeCloseTo(5);
      expect(resampled[2].y).toBeCloseTo(5);
    });

    it('resamples multi-segment path uniformly', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const resampled = PathResamplingService.resample(points, 5);
      expect(resampled).toHaveLength(5);
      expect(resampled[0]).toEqual({ x: 0, y: 0 });
      expect(resampled[4]).toEqual({ x: 10, y: 10 });
    });

    it('handles path with zero length (all points identical)', () => {
      const points: Point[] = [
        { x: 5, y: 5 },
        { x: 5, y: 5 },
        { x: 5, y: 5 },
      ];
      const resampled = PathResamplingService.resample(points, 10);
      expect(resampled).toHaveLength(10);
      resampled.forEach((point) => {
        expect(point.x).toBe(5);
        expect(point.y).toBe(5);
      });
    });

    it('maintains shape when resampling', () => {
      // Create a square path
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 },
      ];
      const resampled = PathResamplingService.resample(points, 20);
      expect(resampled).toHaveLength(20);

      // Check that resampled points stay within the square bounds
      resampled.forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(10);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('simplify', () => {
    it('returns empty array for empty path', () => {
      const simplified = PathResamplingService.simplify([]);
      expect(simplified).toEqual([]);
    });

    it('returns same path for 2 points', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const simplified = PathResamplingService.simplify(points);
      expect(simplified).toHaveLength(2);
      expect(simplified).toEqual(points);
    });

    it('simplifies straight line to 2 points', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ];
      const simplified = PathResamplingService.simplify(points, 1.0);
      expect(simplified).toHaveLength(2);
      expect(simplified[0]).toEqual({ x: 0, y: 0 });
      expect(simplified[1]).toEqual({ x: 10, y: 10 });
    });

    it('preserves points that deviate from line', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 10 }, // Significant deviation
        { x: 10, y: 0 },
      ];
      const simplified = PathResamplingService.simplify(points, 1.0);
      expect(simplified.length).toBeGreaterThan(2);
      expect(simplified).toContainEqual({ x: 5, y: 10 });
    });

    it('uses tolerance to control simplification', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 2 },
        { x: 10, y: 0 },
      ];

      // Strict tolerance keeps the middle point
      const strictSimplified = PathResamplingService.simplify(points, 1.0);
      expect(strictSimplified.length).toBeGreaterThan(2);

      // Lenient tolerance removes the middle point
      const lenientSimplified = PathResamplingService.simplify(points, 5.0);
      expect(lenientSimplified).toHaveLength(2);
    });
  });
});
