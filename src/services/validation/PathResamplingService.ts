import { Point } from './types';

/**
 * Service for resampling paths to uniform point distributions.
 *
 * This is essential for comparing paths of different point densities,
 * such as when comparing a user's drawn stroke (variable density based
 * on drawing speed) with a target stroke (fixed SVG path).
 */
export class PathResamplingService {
  /**
   * Calculate the total length of a path by summing distances between consecutive points.
   *
   * @param points Array of points defining the path
   * @returns Total path length
   */
  static calculatePathLength(points: Point[]): number {
    if (points.length < 2) {
      return 0;
    }

    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      totalLength += this.distance(points[i - 1], points[i]);
    }

    return totalLength;
  }

  /**
   * Get the point at a specific distance along the path.
   * Uses linear interpolation between points.
   *
   * @param points Array of points defining the path
   * @param targetDistance Distance along the path (0 to pathLength)
   * @returns Point at the specified distance, or last point if distance exceeds path length
   */
  static getPointAtDistance(points: Point[], targetDistance: number): Point {
    if (points.length === 0) {
      throw new Error('Cannot get point from empty path');
    }

    if (points.length === 1 || targetDistance <= 0) {
      return { ...points[0] };
    }

    let accumulatedDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const segmentLength = this.distance(points[i - 1], points[i]);
      const nextDistance = accumulatedDistance + segmentLength;

      if (nextDistance >= targetDistance) {
        // Target distance is within this segment - interpolate
        const segmentProgress =
          segmentLength > 0
            ? (targetDistance - accumulatedDistance) / segmentLength
            : 0;

        return {
          x:
            points[i - 1].x + (points[i].x - points[i - 1].x) * segmentProgress,
          y:
            points[i - 1].y + (points[i].y - points[i - 1].y) * segmentProgress,
        };
      }

      accumulatedDistance = nextDistance;
    }

    // Target distance exceeds path length - return last point
    return { ...points[points.length - 1] };
  }

  /**
   * Resample a path to have a uniform distribution of points.
   *
   * This converts a path with variable point density into one with
   * evenly-spaced points, which is essential for fair comparison
   * using algorithms like Fréchet distance.
   *
   * @param points Original path points
   * @param targetCount Desired number of points in resampled path
   * @returns Resampled path with targetCount evenly-spaced points
   */
  static resample(points: Point[], targetCount: number): Point[] {
    if (points.length === 0) {
      return [];
    }

    if (points.length === 1) {
      return [{ ...points[0] }];
    }

    if (targetCount <= 1) {
      return [{ ...points[0] }];
    }

    const pathLength = this.calculatePathLength(points);

    if (pathLength === 0) {
      // All points are the same - return duplicates of first point
      return Array(targetCount).fill(null).map(() => ({ ...points[0] }));
    }

    // Calculate spacing between resampled points
    const spacing = pathLength / (targetCount - 1);

    const resampledPoints: Point[] = [];

    // Always include the first point
    resampledPoints.push({ ...points[0] });

    // Add evenly-spaced intermediate points
    for (let i = 1; i < targetCount - 1; i++) {
      const distance = i * spacing;
      resampledPoints.push(this.getPointAtDistance(points, distance));
    }

    // Always include the last point
    resampledPoints.push({ ...points[points.length - 1] });

    return resampledPoints;
  }

  /**
   * Calculate Euclidean distance between two points.
   *
   * @param p1 First point
   * @param p2 Second point
   * @returns Distance between the points
   */
  private static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Simplify a path by removing redundant points while preserving shape.
   * Uses Douglas-Peucker algorithm with a tolerance parameter.
   *
   * @param points Original path points
   * @param tolerance Maximum distance a point can be from the simplified line
   * @returns Simplified path with fewer points
   */
  static simplify(points: Point[], tolerance: number = 1.0): Point[] {
    if (points.length <= 2) {
      return [...points];
    }

    return this.douglasPeucker(points, 0, points.length - 1, tolerance);
  }

  /**
   * Douglas-Peucker algorithm for path simplification.
   * Recursively simplifies the path by removing points that contribute
   * little to the overall shape.
   *
   * @param points Original path points
   * @param startIndex Start index of segment to simplify
   * @param endIndex End index of segment to simplify
   * @param tolerance Maximum allowed distance from simplified line
   * @returns Simplified segment
   */
  private static douglasPeucker(
    points: Point[],
    startIndex: number,
    endIndex: number,
    tolerance: number
  ): Point[] {
    let maxDistance = 0;
    let maxIndex = 0;

    const start = points[startIndex];
    const end = points[endIndex];

    // Find the point with maximum distance from the line segment
    for (let i = startIndex + 1; i < endIndex; i++) {
      const distance = this.perpendicularDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If max distance exceeds tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(
        points,
        startIndex,
        maxIndex,
        tolerance
      );
      const right = this.douglasPeucker(points, maxIndex, endIndex, tolerance);

      // Combine results (remove duplicate point at junction)
      return [...left.slice(0, -1), ...right];
    } else {
      // All points within tolerance - return just start and end
      return [start, end];
    }
  }

  /**
   * Calculate perpendicular distance from a point to a line segment.
   *
   * @param point Point to measure distance from
   * @param lineStart Start of line segment
   * @param lineEnd End of line segment
   * @returns Perpendicular distance
   */
  private static perpendicularDistance(
    point: Point,
    lineStart: Point,
    lineEnd: Point
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      // Line segment is actually a point
      return this.distance(point, lineStart);
    }

    // Calculate projection of point onto line
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
          lengthSquared
      )
    );

    const projection = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return this.distance(point, projection);
  }
}
