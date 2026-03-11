import { Point } from './types';

/**
 * Service for generating helpful feedback messages for stroke validation failures.
 */
export class FeedbackMessageService {
  /**
   * Generate feedback for start point errors.
   * @param userStart User's start point
   * @param targetStart Correct start point
   * @returns Directional guidance message
   */
  static generateStartPointFeedback(userStart: Point, targetStart: Point): string {
    const dx = targetStart.x - userStart.x;
    const dy = targetStart.y - userStart.y;

    const horizontal = this.getHorizontalDirection(dx);
    const vertical = this.getVerticalDirection(dy);

    if (horizontal && vertical) {
      return `Begin your stroke ${vertical} and ${horizontal}`;
    } else if (horizontal) {
      return `Begin your stroke ${horizontal}`;
    } else if (vertical) {
      return `Begin your stroke ${vertical}`;
    }

    return 'Begin your stroke at the correct position';
  }

  /**
   * Generate feedback for end point errors.
   * @param userEnd User's end point
   * @param targetEnd Correct end point
   * @returns Directional guidance message
   */
  static generateEndPointFeedback(userEnd: Point, targetEnd: Point): string {
    const dx = targetEnd.x - userEnd.x;
    const dy = targetEnd.y - userEnd.y;

    const horizontal = this.getHorizontalDirection(dx);
    const vertical = this.getVerticalDirection(dy);

    if (horizontal && vertical) {
      return `End your stroke ${vertical} and ${horizontal}`;
    } else if (horizontal) {
      return `End your stroke ${horizontal}`;
    } else if (vertical) {
      return `End your stroke ${vertical}`;
    }

    return 'End your stroke at the correct position';
  }

  /**
   * Generate feedback for direction errors.
   * @param userAngle User's direction angle in radians
   * @param targetAngle Correct direction angle in radians
   * @returns Directional guidance message
   */
  static generateDirectionFeedback(userAngle: number, targetAngle: number): string {
    // Convert to degrees
    const userDeg = this.radiansToDegrees(userAngle);
    const targetDeg = this.radiansToDegrees(targetAngle);

    // Determine primary direction of target stroke
    const direction = this.getDirectionFromAngle(targetDeg);

    // Calculate minimum angular distance
    let angleDiff = targetDeg - userDeg;

    // Normalize to -180 to 180 range for shortest angular distance
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    if (Math.abs(angleDiff) < 30) {
      return `Draw more ${direction}`;
    }

    // User is significantly off - provide correction
    if (angleDiff > 0) {
      // Need to rotate counterclockwise (more upward/leftward)
      if (Math.abs(angleDiff) > 135) {
        return 'You drew in the opposite direction';
      }
      return `Draw more ${this.getRotationFeedback(targetDeg, 'ccw')}`;
    } else {
      // Need to rotate clockwise (more downward/rightward)
      if (Math.abs(angleDiff) > 135) {
        return 'You drew in the opposite direction';
      }
      return `Draw more ${this.getRotationFeedback(targetDeg, 'cw')}`;
    }
  }

  /**
   * Generate generic shape feedback.
   */
  static generateShapeFeedback(): string {
    return 'Follow the guide stroke more closely';
  }

  /**
   * Generate combined feedback from multiple validation errors.
   */
  static generateCombinedFeedback(
    hasStartError: boolean,
    hasEndError: boolean,
    hasDirectionError: boolean,
    userStart?: Point,
    targetStart?: Point,
    userEnd?: Point,
    targetEnd?: Point,
    userAngle?: number,
    targetAngle?: number
  ): string {
    const messages: string[] = [];

    // Priority: Start point > End point > Direction
    if (hasStartError && userStart && targetStart) {
      messages.push(this.generateStartPointFeedback(userStart, targetStart));
    }

    if (hasEndError && userEnd && targetEnd) {
      messages.push(this.generateEndPointFeedback(userEnd, targetEnd));
    }

    if (hasDirectionError && userAngle !== undefined && targetAngle !== undefined) {
      messages.push(this.generateDirectionFeedback(userAngle, targetAngle));
    }

    // Return most relevant message
    if (messages.length > 0) {
      return messages[0]; // Return primary issue
    }

    return this.generateShapeFeedback();
  }

  // Private helper methods

  private static getHorizontalDirection(dx: number): string | null {
    if (Math.abs(dx) < 5) return null; // Not significant
    return dx > 0 ? 'to the right' : 'to the left';
  }

  private static getVerticalDirection(dy: number): string | null {
    if (Math.abs(dy) < 5) return null; // Not significant
    return dy > 0 ? 'lower' : 'higher';
  }

  private static getDirectionFromAngle(degrees: number): string {
    // Normalize to 0-360
    const normalized = this.normalizeDegrees(degrees);

    // Divide into 8 directions
    if (normalized >= 337.5 || normalized < 22.5) return 'rightward';
    if (normalized >= 22.5 && normalized < 67.5) return 'diagonally down-right';
    if (normalized >= 67.5 && normalized < 112.5) return 'downward';
    if (normalized >= 112.5 && normalized < 157.5) return 'diagonally down-left';
    if (normalized >= 157.5 && normalized < 202.5) return 'leftward';
    if (normalized >= 202.5 && normalized < 247.5) return 'diagonally up-left';
    if (normalized >= 247.5 && normalized < 292.5) return 'upward';
    return 'diagonally up-right';
  }

  private static getRotationFeedback(targetDegrees: number, rotation: 'cw' | 'ccw'): string {
    // Determine what direction to move toward
    const normalized = this.normalizeDegrees(targetDegrees);

    if (rotation === 'cw') {
      // Clockwise = more downward/rightward
      if (normalized < 90) return 'downward';
      if (normalized < 180) return 'leftward';
      if (normalized < 270) return 'upward';
      return 'rightward';
    } else {
      // Counter-clockwise = more upward/leftward
      if (normalized < 90) return 'upward';
      if (normalized < 180) return 'rightward';
      if (normalized < 270) return 'downward';
      return 'leftward';
    }
  }

  private static radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  private static normalizeDegrees(degrees: number): number {
    let normalized = degrees % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  }
}
