import { BasicStrokeValidator } from '../BasicStrokeValidator';

describe('BasicStrokeValidator', () => {
  describe('validate', () => {
    it('validates correct stroke', () => {
      const targetPath = 'M 10 10 L 50 50';
      const userPath = 'M 11 11 L 51 51'; // Slightly off but within tolerance

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBeGreaterThan(80);
      expect(result.metrics).toBeDefined();
      expect(result.metrics!.startPointAccuracy).toBeGreaterThan(80);
      expect(result.metrics!.endPointAccuracy).toBeGreaterThan(80);
      expect(result.metrics!.directionAccuracy).toBeGreaterThan(90);
    });

    it('rejects stroke with incorrect start point', () => {
      const targetPath = 'M 10 10 L 50 50';
      const userPath = 'M 30 30 L 50 50'; // Start point way off

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Start point');
      expect(result.metrics!.startPointAccuracy).toBeLessThan(50);
    });

    it('rejects stroke with incorrect end point', () => {
      const targetPath = 'M 10 10 L 50 50';
      const userPath = 'M 10 10 L 30 30'; // End point too short

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('End point');
      expect(result.metrics!.endPointAccuracy).toBeLessThan(50);
    });

    it('rejects stroke with incorrect direction', () => {
      const targetPath = 'M 10 10 L 50 50'; // Diagonal down-right
      const userPath = 'M 12 12 L 52 12'; // Horizontal right (wrong direction), similar length

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(false);
      // Should fail on direction or overall validation
      expect(result.metrics!.directionAccuracy).toBeLessThan(60);
    });

    it('handles reversed stroke (backwards)', () => {
      const targetPath = 'M 10 10 L 50 50';
      const userPath = 'M 50 50 L 10 10'; // Drawn backwards

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(false);
      // Start and end points are swapped
      expect(result.metrics!.startPointAccuracy).toBeLessThan(30);
      expect(result.metrics!.endPointAccuracy).toBeLessThan(30);
    });

    it('validates horizontal right stroke', () => {
      const targetPath = 'M 10 50 L 90 50';
      const userPath = 'M 12 50 L 88 50';

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(true);
      expect(result.metrics!.directionAccuracy).toBeGreaterThan(95);
    });

    it('validates vertical down stroke', () => {
      const targetPath = 'M 50 10 L 50 90';
      const userPath = 'M 50 12 L 50 88';

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(true);
      expect(result.metrics!.directionAccuracy).toBeGreaterThan(95);
    });

    it('validates diagonal stroke', () => {
      const targetPath = 'M 10 10 L 90 90';
      const userPath = 'M 12 12 L 88 88';

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(true);
      expect(result.metrics!.directionAccuracy).toBeGreaterThan(95);
    });

    it('validates curved stroke', () => {
      const targetPath = 'M 10 10 C 30 30 50 50 70 70';
      const userPath = 'M 12 12 C 32 32 52 52 72 72';

      const result = BasicStrokeValidator.validate(userPath, targetPath);

      expect(result.valid).toBe(true);
    });

    it('falls back to bounding box validation', () => {
      const targetPath = 'M 10 10 L 50 50';
      // User path slightly off in start/end, but within bbox tolerance
      const userPath = 'M 16 12 L 54 52';

      const result = BasicStrokeValidator.validate(userPath, targetPath, {
        startPointTolerance: 5, // Strict
        endPointTolerance: 5, // Strict
        directionTolerance: 10, // Strict
      });

      // Should fail geometric validation but pass bbox
      expect(result.metrics!.shapeAccuracy).toBeGreaterThan(0);
    });

    it('returns invalid for empty paths', () => {
      const result = BasicStrokeValidator.validate('', 'M 10 10 L 50 50');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid');
      expect(result.accuracy).toBe(0);
    });

    it('uses custom configuration', () => {
      const targetPath = 'M 10 10 L 50 50';
      const userPath = 'M 20 20 L 50 50'; // Start point off by ~14 units

      // Should fail with default tolerance (15)
      const strictResult = BasicStrokeValidator.validate(userPath, targetPath, {
        startPointTolerance: 10,
      });
      expect(strictResult.valid).toBe(false);

      // Should pass with lenient tolerance (20)
      const lenientResult = BasicStrokeValidator.validate(userPath, targetPath, {
        startPointTolerance: 20,
      });
      expect(lenientResult.valid).toBe(true);
    });
  });

  describe('validateStartPoint', () => {
    it('validates exact start point', () => {
      const result = BasicStrokeValidator.validateStartPoint(
        { x: 10, y: 10 },
        { x: 10, y: 10 },
        15
      );

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('validates nearby start point', () => {
      const result = BasicStrokeValidator.validateStartPoint(
        { x: 12, y: 13 }, // Distance ~3.6 units
        { x: 10, y: 10 },
        15
      );

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBeGreaterThan(70);
    });

    it('rejects far start point', () => {
      const result = BasicStrokeValidator.validateStartPoint(
        { x: 30, y: 30 },
        { x: 10, y: 10 },
        15
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Start point');
    });

    it('calculates accuracy proportionally', () => {
      const result1 = BasicStrokeValidator.validateStartPoint(
        { x: 15, y: 10 }, // 5 units away
        { x: 10, y: 10 },
        15
      );

      const result2 = BasicStrokeValidator.validateStartPoint(
        { x: 20, y: 10 }, // 10 units away
        { x: 10, y: 10 },
        15
      );

      expect(result1.accuracy).toBeGreaterThan(result2.accuracy);
    });
  });

  describe('validateEndPoint', () => {
    it('validates exact end point', () => {
      const result = BasicStrokeValidator.validateEndPoint({ x: 50, y: 50 }, { x: 50, y: 50 }, 15);

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('validates nearby end point', () => {
      const result = BasicStrokeValidator.validateEndPoint({ x: 52, y: 53 }, { x: 50, y: 50 }, 15);

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBeGreaterThan(70);
    });

    it('rejects far end point', () => {
      const result = BasicStrokeValidator.validateEndPoint({ x: 70, y: 70 }, { x: 50, y: 50 }, 15);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('End point');
    });
  });

  describe('validateDirection', () => {
    it('validates exact direction', () => {
      const result = BasicStrokeValidator.validateDirection(
        Math.PI / 4, // 45 degrees
        Math.PI / 4, // 45 degrees
        45
      );

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('validates similar direction', () => {
      const result = BasicStrokeValidator.validateDirection(
        Math.PI / 4, // 45 degrees
        Math.PI / 3, // 60 degrees (15 degrees off)
        45
      );

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBeGreaterThan(60);
    });

    it('rejects opposite direction', () => {
      const result = BasicStrokeValidator.validateDirection(
        0, // 0 degrees (right)
        Math.PI, // 180 degrees (left)
        45
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Direction');
    });

    it('rejects perpendicular direction', () => {
      const result = BasicStrokeValidator.validateDirection(
        0, // 0 degrees (right)
        Math.PI / 2, // 90 degrees (down)
        45
      );

      expect(result.valid).toBe(false);
    });
  });

  describe('validateBoundingBox', () => {
    const bbox = { minX: 10, minY: 10, maxX: 50, maxY: 50 };

    it('validates stroke within bounding box', () => {
      const result = BasicStrokeValidator.validateBoundingBox(
        { x: 15, y: 15 },
        { x: 45, y: 45 },
        bbox,
        25
      );

      expect(result.valid).toBe(true);
      expect(result.accuracy).toBe(100);
    });

    it('validates stroke at bounding box edges', () => {
      const result = BasicStrokeValidator.validateBoundingBox(
        { x: 10, y: 10 },
        { x: 50, y: 50 },
        bbox,
        25
      );

      expect(result.valid).toBe(true);
    });

    it('rejects stroke completely outside bbox', () => {
      const result = BasicStrokeValidator.validateBoundingBox(
        { x: 80, y: 80 }, // Outside bbox (minX:10, maxX:50) + tolerance 25 = 75
        { x: 100, y: 100 },
        bbox,
        25
      );

      expect(result.valid).toBe(false);
      expect(result.accuracy).toBe(0);
    });

    it('gives partial accuracy for partially inside bbox', () => {
      const result = BasicStrokeValidator.validateBoundingBox(
        { x: 15, y: 15 }, // Inside
        { x: 80, y: 80 }, // Outside
        bbox,
        25
      );

      expect(result.valid).toBe(false);
      expect(result.accuracy).toBe(50);
    });
  });

  describe('pointsToPath', () => {
    it('converts points to SVG path', () => {
      const points = [
        { x: 10, y: 10 },
        { x: 30, y: 30 },
        { x: 50, y: 50 },
      ];

      const path = BasicStrokeValidator.pointsToPath(points);

      expect(path).toBe('M 10 10 L 30 30 L 50 50');
    });

    it('handles empty points array', () => {
      const path = BasicStrokeValidator.pointsToPath([]);

      expect(path).toBe('');
    });

    it('handles single point', () => {
      const points = [{ x: 10, y: 10 }];

      const path = BasicStrokeValidator.pointsToPath(points);

      expect(path).toBe('M 10 10');
    });
  });
});
