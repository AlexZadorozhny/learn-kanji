/**
 * Performance monitoring service for stroke validation.
 *
 * Tracks validation times, accuracy metrics, and device performance
 * to optimize validation algorithms and identify bottlenecks.
 */
export interface ValidationPerformanceMetrics {
  strokeType: 'straight' | 'curved' | 'complex';
  validationTime: number; // milliseconds
  accuracy: number; // 0-100
  valid: boolean;
  kanjiComplexity: 'easy' | 'medium' | 'complex';
  usedFrechet: boolean;
  timestamp: number;
}

export interface PerformanceStats {
  totalValidations: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  averageAccuracy: number;
  successRate: number;
  byStrokeType: {
    straight: { count: number; avgTime: number; avgAccuracy: number };
    curved: { count: number; avgTime: number; avgAccuracy: number };
    complex: { count: number; avgTime: number; avgAccuracy: number };
  };
  byComplexity: {
    easy: { count: number; avgTime: number; avgAccuracy: number };
    medium: { count: number; avgTime: number; avgAccuracy: number };
    complex: { count: number; avgTime: number; avgAccuracy: number };
  };
  slowValidations: ValidationPerformanceMetrics[];
}

export class PerformanceMonitor {
  private static metrics: ValidationPerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Keep last 1000 validations
  private static readonly SLOW_THRESHOLD = 100; // Log validations > 100ms
  private static readonly DEV_MODE = __DEV__ || false;

  /**
   * Record a validation operation for performance tracking.
   *
   * @param strokeType Type of stroke being validated
   * @param validationTime Time taken for validation (ms)
   * @param accuracy Validation accuracy score (0-100)
   * @param valid Whether validation passed
   * @param totalStrokes Total strokes in kanji (for complexity)
   * @param usedFrechet Whether Fréchet distance was used
   */
  static recordValidation(
    strokeType: 'straight' | 'curved' | 'complex',
    validationTime: number,
    accuracy: number,
    valid: boolean,
    totalStrokes: number,
    usedFrechet: boolean
  ): void {
    const kanjiComplexity = this.getKanjiComplexity(totalStrokes);

    const metric: ValidationPerformanceMetrics = {
      strokeType,
      validationTime,
      accuracy,
      valid,
      kanjiComplexity,
      usedFrechet,
      timestamp: Date.now(),
    };

    // Add to metrics array
    this.metrics.push(metric);

    // Trim if exceeds max size
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow validations in dev mode
    if (this.DEV_MODE && validationTime > this.SLOW_THRESHOLD) {
      console.warn(
        `[PerformanceMonitor] Slow validation detected: ${validationTime.toFixed(1)}ms`,
        {
          strokeType,
          accuracy,
          valid,
          usedFrechet,
          kanjiComplexity,
        }
      );
    }
  }

  /**
   * Get performance statistics for all recorded validations.
   *
   * @returns Aggregated performance statistics
   */
  static getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return this.getEmptyStats();
    }

    const totalValidations = this.metrics.length;
    const times = this.metrics.map((m) => m.validationTime);
    const accuracies = this.metrics.map((m) => m.accuracy);
    const successes = this.metrics.filter((m) => m.valid).length;

    // Calculate overall stats
    const averageTime = times.reduce((a, b) => a + b, 0) / totalValidations;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / totalValidations;
    const successRate = (successes / totalValidations) * 100;

    // Calculate stats by stroke type
    const byStrokeType = {
      straight: this.getStatsForStrokeType('straight'),
      curved: this.getStatsForStrokeType('curved'),
      complex: this.getStatsForStrokeType('complex'),
    };

    // Calculate stats by complexity
    const byComplexity = {
      easy: this.getStatsForComplexity('easy'),
      medium: this.getStatsForComplexity('medium'),
      complex: this.getStatsForComplexity('complex'),
    };

    // Get slow validations
    const slowValidations = this.metrics
      .filter((m) => m.validationTime > this.SLOW_THRESHOLD)
      .slice(-10); // Last 10 slow validations

    return {
      totalValidations,
      averageTime,
      maxTime,
      minTime,
      averageAccuracy,
      successRate,
      byStrokeType,
      byComplexity,
      slowValidations,
    };
  }

  /**
   * Get statistics for a specific stroke type.
   */
  private static getStatsForStrokeType(strokeType: 'straight' | 'curved' | 'complex'): {
    count: number;
    avgTime: number;
    avgAccuracy: number;
  } {
    const filtered = this.metrics.filter((m) => m.strokeType === strokeType);

    if (filtered.length === 0) {
      return { count: 0, avgTime: 0, avgAccuracy: 0 };
    }

    const avgTime = filtered.reduce((sum, m) => sum + m.validationTime, 0) / filtered.length;
    const avgAccuracy = filtered.reduce((sum, m) => sum + m.accuracy, 0) / filtered.length;

    return {
      count: filtered.length,
      avgTime: Math.round(avgTime * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    };
  }

  /**
   * Get statistics for a specific kanji complexity level.
   */
  private static getStatsForComplexity(complexity: 'easy' | 'medium' | 'complex'): {
    count: number;
    avgTime: number;
    avgAccuracy: number;
  } {
    const filtered = this.metrics.filter((m) => m.kanjiComplexity === complexity);

    if (filtered.length === 0) {
      return { count: 0, avgTime: 0, avgAccuracy: 0 };
    }

    const avgTime = filtered.reduce((sum, m) => sum + m.validationTime, 0) / filtered.length;
    const avgAccuracy = filtered.reduce((sum, m) => sum + m.accuracy, 0) / filtered.length;

    return {
      count: filtered.length,
      avgTime: Math.round(avgTime * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    };
  }

  /**
   * Clear all recorded metrics.
   * Useful for testing or resetting performance tracking.
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get recent validations (last N).
   *
   * @param count Number of recent validations to retrieve
   * @returns Array of recent validation metrics
   */
  static getRecentValidations(count: number = 10): ValidationPerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Check if validation performance is acceptable.
   * Returns true if average time is within target (<50ms average, <100ms max).
   *
   * @returns true if performance is good, false otherwise
   */
  static isPerformanceGood(): boolean {
    if (this.metrics.length < 10) {
      return true; // Not enough data yet
    }

    const stats = this.getStats();
    return stats.averageTime < 50 && stats.maxTime < 150;
  }

  /**
   * Get performance report as formatted string for logging.
   *
   * @returns Formatted performance report
   */
  static getPerformanceReport(): string {
    const stats = this.getStats();

    if (stats.totalValidations === 0) {
      return 'No validation data collected yet.';
    }

    return `
Performance Report (${stats.totalValidations} validations):
- Average Time: ${stats.averageTime.toFixed(1)}ms
- Max Time: ${stats.maxTime.toFixed(1)}ms
- Min Time: ${stats.minTime.toFixed(1)}ms
- Average Accuracy: ${stats.averageAccuracy.toFixed(1)}%
- Success Rate: ${stats.successRate.toFixed(1)}%

By Stroke Type:
- Straight: ${stats.byStrokeType.straight.count} validations, ${stats.byStrokeType.straight.avgTime}ms avg
- Curved: ${stats.byStrokeType.curved.count} validations, ${stats.byStrokeType.curved.avgTime}ms avg
- Complex: ${stats.byStrokeType.complex.count} validations, ${stats.byStrokeType.complex.avgTime}ms avg

By Kanji Complexity:
- Easy: ${stats.byComplexity.easy.count} validations, ${stats.byComplexity.easy.avgTime}ms avg
- Medium: ${stats.byComplexity.medium.count} validations, ${stats.byComplexity.medium.avgTime}ms avg
- Complex: ${stats.byComplexity.complex.count} validations, ${stats.byComplexity.complex.avgTime}ms avg

Slow Validations: ${stats.slowValidations.length}
    `.trim();
  }

  /**
   * Map total strokes to complexity level.
   */
  private static getKanjiComplexity(totalStrokes: number): 'easy' | 'medium' | 'complex' {
    if (totalStrokes <= 2) {
      return 'easy';
    } else if (totalStrokes <= 7) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  /**
   * Return empty stats structure.
   */
  private static getEmptyStats(): PerformanceStats {
    return {
      totalValidations: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: 0,
      averageAccuracy: 0,
      successRate: 0,
      byStrokeType: {
        straight: { count: 0, avgTime: 0, avgAccuracy: 0 },
        curved: { count: 0, avgTime: 0, avgAccuracy: 0 },
        complex: { count: 0, avgTime: 0, avgAccuracy: 0 },
      },
      byComplexity: {
        easy: { count: 0, avgTime: 0, avgAccuracy: 0 },
        medium: { count: 0, avgTime: 0, avgAccuracy: 0 },
        complex: { count: 0, avgTime: 0, avgAccuracy: 0 },
      },
      slowValidations: [],
    };
  }
}
