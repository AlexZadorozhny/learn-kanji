/**
 * Configuration for adaptive stroke validation.
 *
 * Provides intelligent threshold adjustment based on:
 * - Kanji complexity (stroke count)
 * - Learning mode (first few attempts get more lenient thresholds)
 * - Stroke type (curved vs straight)
 */
export class ValidationConfig {
  /**
   * Get adaptive accuracy threshold based on total stroke count.
   *
   * Rationale:
   * - Easy kanji (1-2 strokes): Higher standard, users can be more precise
   * - Medium kanji (3-7 strokes): Moderate standard, balancing accuracy and progress
   * - Complex kanji (8+ strokes): More lenient, focus on overall shape
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Minimum accuracy threshold (0-100)
   */
  static getAccuracyThreshold(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 75; // Easy kanji - strict
    } else if (totalStrokes <= 7) {
      return 65; // Medium kanji - moderate
    } else {
      return 60; // Complex kanji - lenient
    }
  }

  /**
   * Apply learning mode adjustment to threshold.
   *
   * For the first 3 attempts on any stroke, we reduce the threshold by 10%
   * to help users learn the motion without being discouraged.
   *
   * @param baseThreshold Base accuracy threshold
   * @param attemptCount Number of attempts user has made on this stroke
   * @returns Adjusted threshold
   */
  static applyLearningMode(
    baseThreshold: number,
    attemptCount: number
  ): number {
    if (attemptCount <= 3) {
      return Math.max(50, baseThreshold - 10); // Minimum 50% even in learning mode
    }
    return baseThreshold;
  }

  /**
   * Get Fréchet distance threshold for curved strokes.
   *
   * This threshold is used specifically for shape matching on curved strokes.
   * It's more lenient than geometric validation because curve matching is
   * inherently more difficult.
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Minimum Fréchet similarity score (0-100)
   */
  static getFrechetThreshold(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 70; // Easy kanji - strict
    } else if (totalStrokes <= 7) {
      return 60; // Medium kanji - moderate
    } else {
      return 55; // Complex kanji - lenient
    }
  }

  /**
   * Get tolerance for start point validation.
   *
   * Returns the maximum allowed distance (in viewBox units, 0-100 scale)
   * between user's start point and correct start point.
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Maximum distance in viewBox units
   */
  static getStartPointTolerance(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 15; // Easy kanji - strict
    } else if (totalStrokes <= 7) {
      return 18; // Medium kanji - moderate
    } else {
      return 20; // Complex kanji - lenient
    }
  }

  /**
   * Get tolerance for end point validation.
   *
   * Returns the maximum allowed distance (in viewBox units, 0-100 scale)
   * between user's end point and correct end point.
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Maximum distance in viewBox units
   */
  static getEndPointTolerance(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 15; // Easy kanji - strict
    } else if (totalStrokes <= 7) {
      return 18; // Medium kanji - moderate
    } else {
      return 20; // Complex kanji - lenient
    }
  }

  /**
   * Get tolerance for direction validation.
   *
   * Returns the maximum allowed angle difference (in degrees)
   * between user's stroke direction and correct direction.
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Maximum angle difference in degrees
   */
  static getDirectionTolerance(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 45; // Easy kanji - strict
    } else if (totalStrokes <= 7) {
      return 50; // Medium kanji - moderate
    } else {
      return 55; // Complex kanji - lenient
    }
  }

  /**
   * Get bounding box tolerance.
   *
   * Returns the tolerance (in viewBox units) for bounding box validation.
   * This is used as a fallback validation method.
   *
   * @param totalStrokes Total number of strokes in the kanji
   * @returns Tolerance in viewBox units
   */
  static getBoundingBoxTolerance(totalStrokes: number): number {
    if (totalStrokes <= 2) {
      return 25; // Easy kanji
    } else if (totalStrokes <= 7) {
      return 28; // Medium kanji
    } else {
      return 30; // Complex kanji
    }
  }

  /**
   * Determine if Fréchet distance should be used for this stroke.
   *
   * Fréchet distance is computationally expensive (~50ms) but provides
   * better validation for curved strokes. Use it selectively.
   *
   * @param pathCommands SVG path commands from parsed stroke
   * @returns true if Fréchet distance should be used
   */
  static shouldUseFrechetDistance(pathCommands: string[]): boolean {
    // Use Fréchet distance if path contains curves (C or Q commands)
    return pathCommands.some(
      (cmd) => cmd.startsWith('C') || cmd.startsWith('Q')
    );
  }

  /**
   * Get recommended validation strategy for a stroke.
   *
   * @param pathCommands SVG path commands from parsed stroke
   * @param totalStrokes Total number of strokes in kanji
   * @returns Validation strategy name
   */
  static getValidationStrategy(
    pathCommands: string[],
    totalStrokes: number
  ): 'geometric' | 'frechet' | 'hybrid' {
    const hasCurves = this.shouldUseFrechetDistance(pathCommands);

    if (!hasCurves) {
      return 'geometric'; // Fast geometric validation for straight strokes
    }

    if (totalStrokes <= 3) {
      return 'hybrid'; // Both geometric and Fréchet for simple curved kanji
    }

    return 'frechet'; // Primarily Fréchet for complex curved kanji
  }
}
