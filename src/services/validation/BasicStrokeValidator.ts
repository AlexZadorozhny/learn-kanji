import { Point, ValidationResult, ValidationConfig } from './types';
import { PathParserService } from './PathParserService';

/**
 * Basic geometric stroke validator.
 * Validates strokes based on start point, end point, and direction.
 */
export class BasicStrokeValidator {
  private static readonly DEFAULT_CONFIG: ValidationConfig = {
    startPointTolerance: 15,
    endPointTolerance: 15,
    directionTolerance: 45, // degrees
    minimumAccuracy: 65,
  };

  /**
   * Validate a user stroke against a target stroke.
   * @param userStrokePath SVG path of user's drawn stroke
   * @param targetStrokePath SVG path of correct stroke
   * @param config Optional validation configuration
   * @returns Validation result with accuracy metrics
   */
  static validate(
    userStrokePath: string,
    targetStrokePath: string,
    config: Partial<ValidationConfig> = {}
  ): ValidationResult {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };

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

    // Validate start point
    const startPointResult = this.validateStartPoint(
      userStroke.startPoint,
      targetStroke.startPoint,
      fullConfig.startPointTolerance
    );

    // Validate end point
    const endPointResult = this.validateEndPoint(
      userStroke.endPoint,
      targetStroke.endPoint,
      fullConfig.endPointTolerance
    );

    // Validate direction
    const directionResult = this.validateDirection(
      userStroke.direction,
      targetStroke.direction,
      fullConfig.directionTolerance
    );

    // Validate bounding box (fallback validation)
    const bboxResult = this.validateBoundingBox(
      userStroke.startPoint,
      userStroke.endPoint,
      targetStroke.boundingBox,
      25 // tolerance in units
    );

    // Calculate overall accuracy (weighted average)
    const accuracy =
      startPointResult.accuracy * 0.4 +
      endPointResult.accuracy * 0.4 +
      directionResult.accuracy * 0.2;

    // Pass if: (start AND end AND direction) OR bounding box
    const geometricPass = startPointResult.valid && endPointResult.valid && directionResult.valid;

    const valid = geometricPass || bboxResult.valid;

    return {
      valid: valid && accuracy >= fullConfig.minimumAccuracy,
      reason: this.getFailureReason(startPointResult, endPointResult, directionResult, bboxResult),
      accuracy: Math.round(accuracy),
      metrics: {
        startPointAccuracy: startPointResult.accuracy,
        endPointAccuracy: endPointResult.accuracy,
        directionAccuracy: directionResult.accuracy,
        shapeAccuracy: bboxResult.accuracy,
      },
    };
  }

  /**
   * Validate stroke start point.
   */
  static validateStartPoint(
    userStart: Point,
    targetStart: Point,
    tolerance: number
  ): ValidationResult {
    const distance = PathParserService.distance(userStart, targetStart);

    // Calculate accuracy: 100% at distance 0, 0% at tolerance distance
    const accuracy = Math.max(0, 100 * (1 - distance / tolerance));

    return {
      valid: distance <= tolerance,
      reason: distance > tolerance ? `Start point off by ${Math.round(distance)} units` : undefined,
      accuracy: Math.round(accuracy),
    };
  }

  /**
   * Validate stroke end point.
   */
  static validateEndPoint(userEnd: Point, targetEnd: Point, tolerance: number): ValidationResult {
    const distance = PathParserService.distance(userEnd, targetEnd);

    // Calculate accuracy: 100% at distance 0, 0% at tolerance distance
    const accuracy = Math.max(0, 100 * (1 - distance / tolerance));

    return {
      valid: distance <= tolerance,
      reason: distance > tolerance ? `End point off by ${Math.round(distance)} units` : undefined,
      accuracy: Math.round(accuracy),
    };
  }

  /**
   * Validate stroke direction.
   */
  static validateDirection(
    userDirection: number,
    targetDirection: number,
    toleranceDegrees: number
  ): ValidationResult {
    const angleDiff = PathParserService.angleDifference(userDirection, targetDirection);

    // Calculate accuracy: 100% at 0 degrees, 0% at tolerance degrees
    const accuracy = Math.max(0, 100 * (1 - angleDiff / toleranceDegrees));

    return {
      valid: angleDiff <= toleranceDegrees,
      reason:
        angleDiff > toleranceDegrees ? `Direction off by ${Math.round(angleDiff)}°` : undefined,
      accuracy: Math.round(accuracy),
    };
  }

  /**
   * Validate using bounding box approach (fallback method).
   * Checks if stroke endpoints are within target's bounding box.
   */
  static validateBoundingBox(
    userStart: Point,
    userEnd: Point,
    targetBBox: { minX: number; minY: number; maxX: number; maxY: number },
    tolerance: number
  ): ValidationResult {
    const { minX, minY, maxX, maxY } = targetBBox;

    // Check if both start and end points are within the expanded bounding box
    const startInside =
      userStart.x >= minX - tolerance &&
      userStart.x <= maxX + tolerance &&
      userStart.y >= minY - tolerance &&
      userStart.y <= maxY + tolerance;

    const endInside =
      userEnd.x >= minX - tolerance &&
      userEnd.x <= maxX + tolerance &&
      userEnd.y >= minY - tolerance &&
      userEnd.y <= maxY + tolerance;

    const accuracy = startInside && endInside ? 100 : startInside || endInside ? 50 : 0;

    return {
      valid: startInside && endInside,
      reason: !startInside || !endInside ? 'Stroke outside target area' : undefined,
      accuracy,
    };
  }

  /**
   * Generate a descriptive failure reason.
   */
  private static getFailureReason(
    startResult: ValidationResult,
    endResult: ValidationResult,
    directionResult: ValidationResult,
    bboxResult: ValidationResult
  ): string | undefined {
    // If all validations pass, no reason needed
    if (startResult.valid && endResult.valid && directionResult.valid) {
      return undefined;
    }

    // Collect all failure reasons
    const reasons: string[] = [];

    if (!startResult.valid && startResult.reason) {
      reasons.push(startResult.reason);
    }
    if (!endResult.valid && endResult.reason) {
      reasons.push(endResult.reason);
    }
    if (!directionResult.valid && directionResult.reason) {
      reasons.push(directionResult.reason);
    }

    // If bounding box also fails, add generic message
    if (!bboxResult.valid && reasons.length === 0) {
      reasons.push('Follow the guide stroke more closely');
    }

    return reasons.length > 0 ? reasons.join(', ') : undefined;
  }

  /**
   * Convert user-drawn points to SVG path.
   */
  static pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }
}
