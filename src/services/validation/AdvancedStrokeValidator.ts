import { Point, ValidationResult } from './types';
import { PathParserService } from './PathParserService';
import { BasicStrokeValidator } from './BasicStrokeValidator';
import { FrechetDistanceService } from './FrechetDistanceService';
import { FeedbackMessageService } from './FeedbackMessageService';
import { ValidationConfig } from './ValidationConfig';

/**
 * Advanced stroke validator with adaptive thresholds and hybrid validation pipeline.
 *
 * Validation Pipeline (5 steps):
 * 1. Fast rejections - start/end point validation (1-2ms)
 * 2. Direction validation (2-5ms)
 * 3. Fréchet distance for curved strokes (30-50ms, selective)
 * 4. Bounding box fallback for straight strokes (1-2ms)
 * 5. Combined scoring and threshold application
 *
 * Features:
 * - Adaptive thresholds based on kanji complexity
 * - Learning mode (lenient for first 3 attempts)
 * - Hybrid geometric + shape matching
 * - Performance optimized (<50ms average)
 */
export class AdvancedStrokeValidator {
  /**
   * Validate a user stroke against a target stroke with adaptive thresholds.
   *
   * @param userStrokePath SVG path of user's drawn stroke
   * @param targetStrokePath SVG path of correct stroke
   * @param totalStrokes Total number of strokes in the kanji
   * @param attemptCount Number of attempts user has made on this stroke (for learning mode)
   * @returns Validation result with detailed metrics
   */
  static validate(
    userStrokePath: string,
    targetStrokePath: string,
    totalStrokes: number = 5,
    attemptCount: number = 1
  ): ValidationResult {
    // Parse both strokes
    const userStroke = PathParserService.parse(userStrokePath);
    const targetStroke = PathParserService.parse(targetStrokePath);

    if (!userStroke || !targetStroke) {
      return {
        valid: false,
        reason: 'Invalid stroke data',
        accuracy: 0,
      };
    }

    // Get adaptive thresholds
    const baseThreshold = ValidationConfig.getAccuracyThreshold(totalStrokes);
    const accuracyThreshold = ValidationConfig.applyLearningMode(
      baseThreshold,
      attemptCount
    );

    const startPointTolerance =
      ValidationConfig.getStartPointTolerance(totalStrokes);
    const endPointTolerance =
      ValidationConfig.getEndPointTolerance(totalStrokes);
    const directionTolerance =
      ValidationConfig.getDirectionTolerance(totalStrokes);
    const bboxTolerance = ValidationConfig.getBoundingBoxTolerance(totalStrokes);

    // Step 1: Validate start point (fast rejection)
    const startPointResult = BasicStrokeValidator.validateStartPoint(
      userStroke.startPoint,
      targetStroke.startPoint,
      startPointTolerance
    );

    // Step 2: Validate end point (fast rejection)
    const endPointResult = BasicStrokeValidator.validateEndPoint(
      userStroke.endPoint,
      targetStroke.endPoint,
      endPointTolerance
    );

    // Step 3: Validate direction (fast rejection)
    const directionResult = BasicStrokeValidator.validateDirection(
      userStroke.direction,
      targetStroke.direction,
      directionTolerance
    );

    // Step 4: Determine if Fréchet distance should be used
    const shouldUseFrechet = ValidationConfig.shouldUseFrechetDistance(
      targetStroke.commands.map((cmd) => cmd.type)
    );

    let frechetScore = 0;
    let frechetValid = false;

    if (shouldUseFrechet) {
      // Convert parsed strokes to point arrays for Fréchet distance
      const userPoints = this.extractPointsFromPath(userStrokePath);
      const targetPoints = this.extractPointsFromPath(targetStrokePath);

      const frechetThreshold =
        ValidationConfig.getFrechetThreshold(totalStrokes);
      const frechetResult = FrechetDistanceService.validate(
        userPoints,
        targetPoints,
        frechetThreshold
      );

      frechetScore = frechetResult.normalizedScore;
      frechetValid = frechetResult.valid;
    }

    // Step 5: Bounding box fallback validation
    const bboxResult = BasicStrokeValidator.validateBoundingBox(
      userStroke.startPoint,
      userStroke.endPoint,
      targetStroke.boundingBox,
      bboxTolerance
    );

    // Calculate overall accuracy based on validation strategy
    let accuracy: number;
    let valid: boolean;

    if (shouldUseFrechet) {
      // Hybrid approach: Geometric validation + Fréchet distance
      const geometricAccuracy =
        startPointResult.accuracy * 0.3 +
        endPointResult.accuracy * 0.3 +
        directionResult.accuracy * 0.2 +
        bboxResult.accuracy * 0.2;

      // Determine which accuracy to use based on which validation passed
      const geometricPass =
        startPointResult.valid &&
        endPointResult.valid &&
        directionResult.valid;

      // FIX: If geometric validation passes, use geometric accuracy alone
      // Don't let poor Fréchet score drag down a geometrically correct stroke
      if (geometricPass) {
        accuracy = Math.round(geometricAccuracy);
        valid = true; // Geometric validation is sufficient
      } else if (frechetValid) {
        // If Fréchet passes but geometry doesn't, use Fréchet score
        accuracy = frechetScore;
        valid = true;
      } else if (bboxResult.valid) {
        // Bounding box fallback - combine scores and check threshold
        accuracy = Math.round(geometricAccuracy * 0.4 + frechetScore * 0.6);
        valid = accuracy >= accuracyThreshold;
      } else {
        // Nothing passed - combine scores for reporting
        accuracy = Math.round(geometricAccuracy * 0.4 + frechetScore * 0.6);
        valid = false;
      }
    } else {
      // Pure geometric approach for straight strokes
      const geometricAccuracy = Math.round(
        startPointResult.accuracy * 0.4 +
          endPointResult.accuracy * 0.4 +
          directionResult.accuracy * 0.2
      );

      // Pass if: (start AND end AND direction) OR bbox
      const geometricPass =
        startPointResult.valid &&
        endPointResult.valid &&
        directionResult.valid;

      if (geometricPass) {
        accuracy = geometricAccuracy;
        valid = true;
      } else if (bboxResult.valid) {
        // Bounding box fallback - check accuracy threshold
        accuracy = geometricAccuracy;
        valid = accuracy >= accuracyThreshold;
      } else {
        accuracy = geometricAccuracy;
        valid = false;
      }
    }

    // Generate helpful feedback if validation failed
    const reason = this.generateFailureReason(
      valid,
      startPointResult,
      endPointResult,
      directionResult,
      bboxResult,
      userStroke,
      targetStroke
    );

    return {
      valid,
      reason,
      accuracy,
      metrics: {
        startPointAccuracy: startPointResult.accuracy,
        endPointAccuracy: endPointResult.accuracy,
        directionAccuracy: directionResult.accuracy,
        shapeAccuracy: shouldUseFrechet ? frechetScore : bboxResult.accuracy,
      },
    };
  }

  /**
   * Convert SVG path to array of points for Fréchet distance calculation.
   * Extracts all coordinate pairs from the path.
   *
   * @param pathData SVG path string
   * @returns Array of points
   */
  private static extractPointsFromPath(pathData: string): Point[] {
    const parsed = PathParserService.parse(pathData);
    if (!parsed) return [];

    const points: Point[] = [];

    // Extract points from all commands
    parsed.commands.forEach((cmd) => {
      if (cmd.type === 'M' || cmd.type === 'L') {
        // Move and Line commands have a single point
        points.push({ x: cmd.x, y: cmd.y });
      } else if (cmd.type === 'C') {
        // Cubic Bezier: control point 1, control point 2, end point
        if (cmd.x1 !== undefined && cmd.y1 !== undefined) {
          points.push({ x: cmd.x1, y: cmd.y1 });
        }
        if (cmd.x2 !== undefined && cmd.y2 !== undefined) {
          points.push({ x: cmd.x2, y: cmd.y2 });
        }
        points.push({ x: cmd.x, y: cmd.y });
      } else if (cmd.type === 'Q') {
        // Quadratic Bezier: control point, end point
        if (cmd.x1 !== undefined && cmd.y1 !== undefined) {
          points.push({ x: cmd.x1, y: cmd.y1 });
        }
        points.push({ x: cmd.x, y: cmd.y });
      }
      // Skip 'Z' (close path) as it doesn't add new points
    });

    return points;
  }

  /**
   * Generate detailed failure reason with helpful feedback.
   *
   * @param valid Overall validation result
   * @param startPointResult Start point validation result
   * @param endPointResult End point validation result
   * @param directionResult Direction validation result
   * @param bboxResult Bounding box validation result
   * @param userStroke Parsed user stroke
   * @param targetStroke Parsed target stroke
   * @returns Failure reason with guidance
   */
  private static generateFailureReason(
    valid: boolean,
    startPointResult: ValidationResult,
    endPointResult: ValidationResult,
    directionResult: ValidationResult,
    bboxResult: ValidationResult,
    userStroke: any,
    targetStroke: any
  ): string | undefined {
    if (valid) {
      return undefined;
    }

    // Use FeedbackMessageService for specific guidance
    return FeedbackMessageService.generateCombinedFeedback(
      !startPointResult.valid,
      !endPointResult.valid,
      !directionResult.valid,
      userStroke.startPoint,
      targetStroke.startPoint,
      userStroke.endPoint,
      targetStroke.endPoint,
      userStroke.direction,
      targetStroke.direction
    );
  }

  /**
   * Convert user-drawn points to SVG path string.
   * Helper method for integration with drawing components.
   *
   * @param points Array of points drawn by user
   * @returns SVG path string
   */
  static pointsToPath(points: Point[]): string {
    return BasicStrokeValidator.pointsToPath(points);
  }

  /**
   * Get validation statistics for performance monitoring.
   *
   * @param totalStrokes Total number of strokes in kanji
   * @param attemptCount Current attempt count
   * @returns Object with threshold values for monitoring
   */
  static getValidationStats(
    totalStrokes: number,
    attemptCount: number
  ): {
    accuracyThreshold: number;
    startPointTolerance: number;
    endPointTolerance: number;
    directionTolerance: number;
    isLearningMode: boolean;
  } {
    const baseThreshold = ValidationConfig.getAccuracyThreshold(totalStrokes);
    const accuracyThreshold = ValidationConfig.applyLearningMode(
      baseThreshold,
      attemptCount
    );

    return {
      accuracyThreshold,
      startPointTolerance:
        ValidationConfig.getStartPointTolerance(totalStrokes),
      endPointTolerance: ValidationConfig.getEndPointTolerance(totalStrokes),
      directionTolerance:
        ValidationConfig.getDirectionTolerance(totalStrokes),
      isLearningMode: attemptCount <= 3,
    };
  }
}
