import { PathParserService } from '../PathParserService';

describe('PathParserService', () => {
  describe('parse', () => {
    it('returns null for empty path', () => {
      expect(PathParserService.parse('')).toBeNull();
      expect(PathParserService.parse('   ')).toBeNull();
    });

    it('returns null for invalid input', () => {
      expect(PathParserService.parse(null as any)).toBeNull();
      expect(PathParserService.parse(undefined as any)).toBeNull();
      expect(PathParserService.parse(123 as any)).toBeNull();
    });

    it('parses simple line path (M L)', () => {
      const result = PathParserService.parse('M 10 20 L 50 60');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 20 });
      expect(result!.endPoint).toEqual({ x: 50, y: 60 });
      expect(result!.commands).toHaveLength(2);
      expect(result!.commands[0].type).toBe('M');
      expect(result!.commands[1].type).toBe('L');
    });

    it('parses path with multiple line segments', () => {
      const result = PathParserService.parse('M 10 10 L 30 30 L 50 20');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 10 });
      expect(result!.endPoint).toEqual({ x: 50, y: 20 });
    });

    it('parses cubic curve path (M C)', () => {
      const result = PathParserService.parse('M 10 10 C 20 20 40 40 50 50');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 10 });
      expect(result!.endPoint).toEqual({ x: 50, y: 50 });
      expect(result!.commands[1].type).toBe('C');
      expect(result!.commands[1].coords).toEqual([20, 20, 40, 40, 50, 50]);
    });

    it('parses quadratic curve path (M Q)', () => {
      const result = PathParserService.parse('M 10 10 Q 30 30 50 10');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 10 });
      expect(result!.endPoint).toEqual({ x: 50, y: 10 });
      expect(result!.commands[1].type).toBe('Q');
      expect(result!.commands[1].coords).toEqual([30, 30, 50, 10]);
    });

    it('parses path with Z (close) command', () => {
      const result = PathParserService.parse('M 10 10 L 50 10 L 50 50 Z');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 10 });
      // Z command should close back to start
      expect(result!.endPoint).toEqual({ x: 10, y: 10 });
    });

    it('handles paths with commas', () => {
      const result = PathParserService.parse('M 10,20 L 50,60');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 20 });
      expect(result!.endPoint).toEqual({ x: 50, y: 60 });
    });

    it('handles paths with extra whitespace', () => {
      const result = PathParserService.parse('M  10   20   L   50   60');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 20 });
      expect(result!.endPoint).toEqual({ x: 50, y: 60 });
    });

    it('handles relative commands (lowercase)', () => {
      const result = PathParserService.parse('M 10 10 l 40 50');

      expect(result).not.toBeNull();
      // Relative l 40 50 from (10, 10) should end at (50, 60)
      expect(result!.endPoint).toEqual({ x: 50, y: 60 });
      expect(result!.commands[1].absolute).toBe(false);
    });

    it('calculates correct bounding box', () => {
      const result = PathParserService.parse('M 10 10 L 50 60 L 80 20');

      expect(result).not.toBeNull();
      expect(result!.boundingBox).toEqual({
        minX: 10,
        minY: 10,
        maxX: 80,
        maxY: 60,
      });
    });

    it('calculates direction for horizontal right stroke', () => {
      const result = PathParserService.parse('M 10 50 L 90 50');

      expect(result).not.toBeNull();
      // Horizontal right should be 0 radians
      expect(result!.direction).toBeCloseTo(0, 5);
    });

    it('calculates direction for vertical down stroke', () => {
      const result = PathParserService.parse('M 50 10 L 50 90');

      expect(result).not.toBeNull();
      // Vertical down should be π/2 radians (90 degrees)
      expect(result!.direction).toBeCloseTo(Math.PI / 2, 5);
    });

    it('calculates direction for diagonal stroke', () => {
      const result = PathParserService.parse('M 10 10 L 50 50');

      expect(result).not.toBeNull();
      // 45-degree diagonal should be π/4 radians
      expect(result!.direction).toBeCloseTo(Math.PI / 4, 5);
    });

    it('estimates length for straight line', () => {
      const result = PathParserService.parse('M 0 0 L 30 40');

      expect(result).not.toBeNull();
      // Length should be sqrt(30^2 + 40^2) = 50
      expect(result!.length).toBeCloseTo(50, 1);
    });

    it('estimates length for multi-segment path', () => {
      const result = PathParserService.parse('M 0 0 L 30 0 L 30 40');

      expect(result).not.toBeNull();
      // Length should be 30 + 40 = 70
      expect(result!.length).toBeCloseTo(70, 1);
    });
  });

  describe('distance', () => {
    it('calculates distance between two points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };

      expect(PathParserService.distance(p1, p2)).toBeCloseTo(5, 5);
    });

    it('returns 0 for same point', () => {
      const p = { x: 10, y: 20 };

      expect(PathParserService.distance(p, p)).toBe(0);
    });
  });

  describe('angle conversions', () => {
    it('converts radians to degrees', () => {
      expect(PathParserService.radiansToDegrees(0)).toBe(0);
      expect(PathParserService.radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
      expect(PathParserService.radiansToDegrees(Math.PI)).toBeCloseTo(180, 5);
      expect(PathParserService.radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 5);
    });

    it('converts degrees to radians', () => {
      expect(PathParserService.degreesToRadians(0)).toBe(0);
      expect(PathParserService.degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 5);
      expect(PathParserService.degreesToRadians(180)).toBeCloseTo(Math.PI, 5);
      expect(PathParserService.degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 5);
    });
  });

  describe('angleDifference', () => {
    it('calculates small angle differences', () => {
      const angle1 = 0; // 0 degrees
      const angle2 = PathParserService.degreesToRadians(10); // 10 degrees

      expect(PathParserService.angleDifference(angle1, angle2)).toBeCloseTo(10, 1);
    });

    it('calculates large angle differences', () => {
      const angle1 = 0; // 0 degrees
      const angle2 = PathParserService.degreesToRadians(170); // 170 degrees

      expect(PathParserService.angleDifference(angle1, angle2)).toBeCloseTo(170, 1);
    });

    it('normalizes angles over 180 degrees', () => {
      const angle1 = 0; // 0 degrees
      const angle2 = PathParserService.degreesToRadians(350); // 350 degrees

      // Should normalize to 10 degrees (360 - 350)
      expect(PathParserService.angleDifference(angle1, angle2)).toBeCloseTo(10, 1);
    });

    it('handles negative angles', () => {
      const angle1 = PathParserService.degreesToRadians(10); // 10 degrees
      const angle2 = 0; // 0 degrees

      expect(PathParserService.angleDifference(angle1, angle2)).toBeCloseTo(10, 1);
    });

    it('returns absolute difference', () => {
      const angle1 = PathParserService.degreesToRadians(45); // 45 degrees
      const angle2 = PathParserService.degreesToRadians(135); // 135 degrees

      expect(PathParserService.angleDifference(angle1, angle2)).toBeCloseTo(90, 1);
      expect(PathParserService.angleDifference(angle2, angle1)).toBeCloseTo(90, 1);
    });
  });

  describe('edge cases', () => {
    it('handles single point path', () => {
      const result = PathParserService.parse('M 50 50');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 50, y: 50 });
      expect(result!.endPoint).toEqual({ x: 50, y: 50 });
      expect(result!.length).toBe(0);
    });

    it('handles path with only move commands', () => {
      const result = PathParserService.parse('M 10 10 M 50 50');

      expect(result).not.toBeNull();
      expect(result!.startPoint).toEqual({ x: 10, y: 10 });
      expect(result!.endPoint).toEqual({ x: 50, y: 50 });
    });

    it('handles malformed coordinates gracefully', () => {
      const result = PathParserService.parse('M 10 20 L abc def');

      expect(result).not.toBeNull();
      // Should parse valid M command, ignore invalid L command
      expect(result!.startPoint).toEqual({ x: 10, y: 20 });
    });
  });
});
