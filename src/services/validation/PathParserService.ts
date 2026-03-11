import { Point, BoundingBox, PathCommand, ParsedStroke } from './types';

/**
 * Service for parsing SVG path data and extracting stroke information.
 * Supports M (move), L (line), C (cubic curve), Q (quadratic curve), Z (close) commands.
 */
export class PathParserService {
  /**
   * Parse an SVG path string and extract stroke information.
   * @param pathData SVG path string (e.g., "M 10 10 L 50 50")
   * @returns Parsed stroke information or null if invalid
   */
  static parse(pathData: string): ParsedStroke | null {
    if (!pathData || typeof pathData !== 'string') {
      return null;
    }

    const commands = this.parseCommands(pathData);
    if (commands.length === 0) {
      return null;
    }

    const points = this.extractPoints(commands);
    if (points.length === 0) {
      return null;
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const direction = this.calculateDirection(startPoint, endPoint);
    const boundingBox = this.calculateBoundingBox(points);
    const length = this.estimateLength(points);

    return {
      startPoint,
      endPoint,
      direction,
      boundingBox,
      commands,
      length,
    };
  }

  /**
   * Parse SVG path data into individual commands.
   * Handles both absolute and relative coordinates.
   */
  private static parseCommands(pathData: string): PathCommand[] {
    const commands: PathCommand[] = [];

    // Clean up the path data
    const cleaned = pathData
      .trim()
      .replace(/,/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([MLCQZmlcqz])/g, '|$1 ') // Add delimiter before commands
      .split('|')
      .filter((s) => s.trim().length > 0);

    for (const commandStr of cleaned) {
      const type = commandStr[0] as string;
      const isAbsolute = type === type.toUpperCase();
      const coords = commandStr
        .slice(1)
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter((n) => !isNaN(n));

      const command: PathCommand = {
        type: type.toUpperCase() as PathCommand['type'],
        coords,
        absolute: isAbsolute,
      };

      commands.push(command);
    }

    return commands;
  }

  /**
   * Extract all points from path commands.
   * Converts relative coordinates to absolute.
   */
  private static extractPoints(commands: PathCommand[]): Point[] {
    const points: Point[] = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    for (const command of commands) {
      const { type, coords, absolute } = command;

      switch (type) {
        case 'M': // Move to
          if (coords.length >= 2) {
            currentX = absolute ? coords[0] : currentX + coords[0];
            currentY = absolute ? coords[1] : currentY + coords[1];
            startX = currentX;
            startY = currentY;
            points.push({ x: currentX, y: currentY });
          }
          break;

        case 'L': // Line to
          if (coords.length >= 2) {
            currentX = absolute ? coords[0] : currentX + coords[0];
            currentY = absolute ? coords[1] : currentY + coords[1];
            points.push({ x: currentX, y: currentY });
          }
          break;

        case 'C': // Cubic Bezier curve
          if (coords.length >= 6) {
            // Add control points for better length estimation
            const cp1x = absolute ? coords[0] : currentX + coords[0];
            const cp1y = absolute ? coords[1] : currentY + coords[1];
            const cp2x = absolute ? coords[2] : currentX + coords[2];
            const cp2y = absolute ? coords[3] : currentY + coords[3];
            currentX = absolute ? coords[4] : currentX + coords[4];
            currentY = absolute ? coords[5] : currentY + coords[5];

            // Sample curve at intervals for better representation
            points.push({ x: cp1x, y: cp1y });
            points.push({ x: cp2x, y: cp2y });
            points.push({ x: currentX, y: currentY });
          }
          break;

        case 'Q': // Quadratic Bezier curve
          if (coords.length >= 4) {
            // Add control point
            const cpx = absolute ? coords[0] : currentX + coords[0];
            const cpy = absolute ? coords[1] : currentY + coords[1];
            currentX = absolute ? coords[2] : currentX + coords[2];
            currentY = absolute ? coords[3] : currentY + coords[3];

            points.push({ x: cpx, y: cpy });
            points.push({ x: currentX, y: currentY });
          }
          break;

        case 'Z': // Close path
          // Return to start point
          currentX = startX;
          currentY = startY;
          if (
            points.length > 0 &&
            (points[points.length - 1].x !== startX || points[points.length - 1].y !== startY)
          ) {
            points.push({ x: currentX, y: currentY });
          }
          break;
      }
    }

    return points;
  }

  /**
   * Calculate direction angle from start to end point.
   * @returns Angle in radians (0 = right, π/2 = down)
   */
  private static calculateDirection(start: Point, end: Point): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Calculate bounding box for all points.
   */
  private static calculateBoundingBox(points: Point[]): BoundingBox {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }

  /**
   * Estimate path length by summing distances between consecutive points.
   */
  private static estimateLength(points: Point[]): number {
    if (points.length < 2) {
      return 0;
    }

    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }

    return length;
  }

  /**
   * Calculate distance between two points.
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Convert angle from radians to degrees.
   */
  static radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * Convert angle from degrees to radians.
   */
  static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculate angle difference in degrees (normalized to -180 to 180).
   */
  static angleDifference(angle1: number, angle2: number): number {
    let diff = this.radiansToDegrees(angle2 - angle1);

    // Normalize to -180 to 180
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    return Math.abs(diff);
  }
}
