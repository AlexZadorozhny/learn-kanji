import { PerformanceMonitor } from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Clear metrics before each test
    PerformanceMonitor.clearMetrics();
  });

  describe('recordValidation', () => {
    it('records a validation metric', () => {
      PerformanceMonitor.recordValidation('straight', 25, 85, true, 5, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.totalValidations).toBe(1);
      expect(stats.averageTime).toBe(25);
      expect(stats.averageAccuracy).toBe(85);
      expect(stats.successRate).toBe(100);
    });

    it('records multiple validations', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 45, 75, true, 5, true);
      PerformanceMonitor.recordValidation('straight', 30, 80, false, 8, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.totalValidations).toBe(3);
      expect(stats.averageTime).toBeCloseTo((20 + 45 + 30) / 3, 1);
      expect(stats.averageAccuracy).toBeCloseTo((90 + 75 + 80) / 3, 1);
    });

    it('categorizes by stroke type', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 45, 75, true, 5, true);
      PerformanceMonitor.recordValidation('straight', 30, 80, false, 8, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byStrokeType.straight.count).toBe(2);
      expect(stats.byStrokeType.curved.count).toBe(1);
      expect(stats.byStrokeType.complex.count).toBe(0);
    });

    it('categorizes by kanji complexity', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false); // easy
      PerformanceMonitor.recordValidation('curved', 45, 75, true, 5, true); // medium
      PerformanceMonitor.recordValidation('straight', 30, 80, false, 10, false); // complex

      const stats = PerformanceMonitor.getStats();
      expect(stats.byComplexity.easy.count).toBe(1);
      expect(stats.byComplexity.medium.count).toBe(1);
      expect(stats.byComplexity.complex.count).toBe(1);
    });
  });

  describe('getStats', () => {
    it('returns empty stats when no data', () => {
      const stats = PerformanceMonitor.getStats();

      expect(stats.totalValidations).toBe(0);
      expect(stats.averageTime).toBe(0);
      expect(stats.maxTime).toBe(0);
      expect(stats.minTime).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('calculates average time correctly', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 40, 80, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 30, 80, true, 5, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.averageTime).toBeCloseTo(30, 1);
    });

    it('calculates max and min time correctly', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 150, 80, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 30, 80, true, 5, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.maxTime).toBe(150);
      expect(stats.minTime).toBe(20);
    });

    it('calculates success rate correctly', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 25, 85, true, 5, false);
      PerformanceMonitor.recordValidation('straight', 30, 60, false, 5, false);
      PerformanceMonitor.recordValidation('straight', 35, 55, false, 5, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.successRate).toBe(50); // 2 out of 4
    });

    it('tracks slow validations', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 5, false);
      PerformanceMonitor.recordValidation('curved', 150, 75, true, 5, true); // Slow
      PerformanceMonitor.recordValidation('straight', 30, 80, true, 5, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.slowValidations.length).toBe(1);
      expect(stats.slowValidations[0].validationTime).toBe(150);
    });

    it('limits slow validations to last 10', () => {
      // Record 15 slow validations
      for (let i = 0; i < 15; i++) {
        PerformanceMonitor.recordValidation('curved', 110 + i, 80, true, 5, true);
      }

      const stats = PerformanceMonitor.getStats();
      expect(stats.slowValidations.length).toBe(10);
      // Should have the last 10 (times 115-124)
      expect(stats.slowValidations[0].validationTime).toBe(115);
      expect(stats.slowValidations[9].validationTime).toBe(124);
    });
  });

  describe('stroke type stats', () => {
    it('calculates stats for straight strokes', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('straight', 30, 80, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 50, 70, true, 5, true);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byStrokeType.straight.count).toBe(2);
      expect(stats.byStrokeType.straight.avgTime).toBe(25);
      expect(stats.byStrokeType.straight.avgAccuracy).toBe(85);
    });

    it('calculates stats for curved strokes', () => {
      PerformanceMonitor.recordValidation('curved', 40, 80, true, 5, true);
      PerformanceMonitor.recordValidation('curved', 60, 70, true, 5, true);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byStrokeType.curved.count).toBe(2);
      expect(stats.byStrokeType.curved.avgTime).toBe(50);
      expect(stats.byStrokeType.curved.avgAccuracy).toBe(75);
    });

    it('returns zero stats for stroke types with no data', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 2, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byStrokeType.curved.count).toBe(0);
      expect(stats.byStrokeType.curved.avgTime).toBe(0);
      expect(stats.byStrokeType.curved.avgAccuracy).toBe(0);
    });
  });

  describe('complexity stats', () => {
    it('calculates stats for easy kanji (1-2 strokes)', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 1, false);
      PerformanceMonitor.recordValidation('straight', 30, 85, true, 2, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byComplexity.easy.count).toBe(2);
      expect(stats.byComplexity.easy.avgTime).toBe(25);
      expect(stats.byComplexity.easy.avgAccuracy).toBe(87.5);
    });

    it('calculates stats for medium kanji (3-7 strokes)', () => {
      PerformanceMonitor.recordValidation('straight', 25, 80, true, 3, false);
      PerformanceMonitor.recordValidation('curved', 35, 75, true, 7, true);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byComplexity.medium.count).toBe(2);
      expect(stats.byComplexity.medium.avgTime).toBe(30);
      expect(stats.byComplexity.medium.avgAccuracy).toBe(77.5);
    });

    it('calculates stats for complex kanji (8+ strokes)', () => {
      PerformanceMonitor.recordValidation('complex', 40, 70, true, 8, false);
      PerformanceMonitor.recordValidation('complex', 50, 65, true, 12, false);

      const stats = PerformanceMonitor.getStats();
      expect(stats.byComplexity.complex.count).toBe(2);
      expect(stats.byComplexity.complex.avgTime).toBe(45);
      expect(stats.byComplexity.complex.avgAccuracy).toBe(67.5);
    });
  });

  describe('clearMetrics', () => {
    it('clears all recorded metrics', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 5, false);
      PerformanceMonitor.recordValidation('curved', 40, 75, true, 5, true);

      expect(PerformanceMonitor.getStats().totalValidations).toBe(2);

      PerformanceMonitor.clearMetrics();

      expect(PerformanceMonitor.getStats().totalValidations).toBe(0);
    });
  });

  describe('getRecentValidations', () => {
    it('returns last N validations', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 40, 80, true, 5, true);
      PerformanceMonitor.recordValidation('straight', 30, 85, true, 3, false);

      const recent = PerformanceMonitor.getRecentValidations(2);
      expect(recent.length).toBe(2);
      expect(recent[0].validationTime).toBe(40);
      expect(recent[1].validationTime).toBe(30);
    });

    it('returns all validations if count exceeds total', () => {
      PerformanceMonitor.recordValidation('straight', 20, 80, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 40, 75, true, 5, true);

      const recent = PerformanceMonitor.getRecentValidations(10);
      expect(recent.length).toBe(2);
    });

    it('returns last 10 by default', () => {
      for (let i = 0; i < 15; i++) {
        PerformanceMonitor.recordValidation('straight', 20 + i, 80, true, 2, false);
      }

      const recent = PerformanceMonitor.getRecentValidations();
      expect(recent.length).toBe(10);
      expect(recent[0].validationTime).toBe(25); // 20 + 5
      expect(recent[9].validationTime).toBe(34); // 20 + 14
    });
  });

  describe('isPerformanceGood', () => {
    it('returns true with no data', () => {
      expect(PerformanceMonitor.isPerformanceGood()).toBe(true);
    });

    it('returns true with insufficient data (<10 validations)', () => {
      for (let i = 0; i < 5; i++) {
        PerformanceMonitor.recordValidation('straight', 60, 80, true, 2, false);
      }

      expect(PerformanceMonitor.isPerformanceGood()).toBe(true);
    });

    it('returns true when performance is good', () => {
      for (let i = 0; i < 15; i++) {
        PerformanceMonitor.recordValidation('straight', 30, 80, true, 2, false);
      }

      expect(PerformanceMonitor.isPerformanceGood()).toBe(true);
    });

    it('returns false when average time exceeds 50ms', () => {
      for (let i = 0; i < 15; i++) {
        PerformanceMonitor.recordValidation('curved', 60, 75, true, 5, true);
      }

      expect(PerformanceMonitor.isPerformanceGood()).toBe(false);
    });

    it('returns false when max time exceeds 150ms', () => {
      for (let i = 0; i < 14; i++) {
        PerformanceMonitor.recordValidation('straight', 30, 80, true, 2, false);
      }
      PerformanceMonitor.recordValidation('complex', 200, 70, true, 10, true);

      expect(PerformanceMonitor.isPerformanceGood()).toBe(false);
    });
  });

  describe('getPerformanceReport', () => {
    it('returns message when no data', () => {
      const report = PerformanceMonitor.getPerformanceReport();
      expect(report).toContain('No validation data');
    });

    it('generates formatted report with data', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 45, 75, true, 5, true);
      PerformanceMonitor.recordValidation('straight', 30, 85, false, 8, false);

      const report = PerformanceMonitor.getPerformanceReport();
      expect(report).toContain('Performance Report');
      expect(report).toContain('3 validations');
      expect(report).toContain('Average Time');
      expect(report).toContain('By Stroke Type');
      expect(report).toContain('By Kanji Complexity');
    });

    it('includes all stroke types in report', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 45, 75, true, 5, true);
      PerformanceMonitor.recordValidation('complex', 35, 80, true, 8, false);

      const report = PerformanceMonitor.getPerformanceReport();
      expect(report).toContain('Straight:');
      expect(report).toContain('Curved:');
      expect(report).toContain('Complex:');
    });

    it('includes all complexity levels in report', () => {
      PerformanceMonitor.recordValidation('straight', 20, 90, true, 2, false);
      PerformanceMonitor.recordValidation('curved', 30, 80, true, 5, true);
      PerformanceMonitor.recordValidation('straight', 40, 75, true, 10, false);

      const report = PerformanceMonitor.getPerformanceReport();
      expect(report).toContain('Easy:');
      expect(report).toContain('Medium:');
      expect(report).toContain('Complex:');
    });
  });

  describe('metric limits', () => {
    it('limits stored metrics to MAX_METRICS (1000)', () => {
      // Record 1100 validations
      for (let i = 0; i < 1100; i++) {
        PerformanceMonitor.recordValidation('straight', 20, 80, true, 2, false);
      }

      const stats = PerformanceMonitor.getStats();
      expect(stats.totalValidations).toBe(1000);
    });

    it('removes oldest metrics when limit exceeded', () => {
      // Record metrics with unique times
      for (let i = 0; i < 1100; i++) {
        PerformanceMonitor.recordValidation('straight', i, 80, true, 2, false);
      }

      const recent = PerformanceMonitor.getRecentValidations(1);
      // Should have the most recent one (time = 1099)
      expect(recent[0].validationTime).toBe(1099);
    });
  });
});
