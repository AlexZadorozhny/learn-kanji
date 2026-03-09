import { Point } from './types';
import { PathResamplingService } from './PathResamplingService';

/**
 * Service for calculating Fréchet distance between two paths.
 *
 * The Fréchet distance is a measure of similarity between curves that takes
 * into account the location and ordering of points. It's often described as
 * the minimum leash length needed to walk a dog along one curve while you
 * walk along another.
 *
 * This implementation uses the discrete Fréchet distance with dynamic programming
 * for efficient computation on mobile devices.
 */
export class FrechetDistanceService {
  private static readonly RESAMPLE_POINTS = 50; // Fixed point count for comparison
  private static readonly MAX_DISTANCE_THRESHOLD = 100; // Early termination threshold

  /**
   * Calculate the discrete Fréchet distance between two paths.
   *
   * @param path1 First path as array of points
   * @param path2 Second path as array of points
   * @param earlyTermination If true, stops early when distance exceeds threshold
   * @returns The Fréchet distance (lower is more similar)
   */
  static calculate(
    path1: Point[],
    path2: Point[],
    earlyTermination: boolean = true
  ): number {
    if (path1.length === 0 || path2.length === 0) {
      return Infinity;
    }

    // Resample both paths to uniform point distribution
    const resampledPath1 = PathResamplingService.resample(
      path1,
      this.RESAMPLE_POINTS
    );
    const resampledPath2 = PathResamplingService.resample(
      path2,
      this.RESAMPLE_POINTS
    );

    const m = resampledPath1.length;
    const n = resampledPath2.length;

    // Use TypedArray for performance
    const dp = new Float32Array(m * n);

    // Helper to access 2D array stored as 1D
    const getDP = (i: number, j: number): number => dp[i * n + j];
    const setDP = (i: number, j: number, value: number): void => {
      dp[i * n + j] = value;
    };

    // Initialize first cell
    setDP(
      0,
      0,
      this.euclideanDistance(resampledPath1[0], resampledPath2[0])
    );

    // Initialize first column
    for (let i = 1; i < m; i++) {
      const dist = this.euclideanDistance(resampledPath1[i], resampledPath2[0]);
      setDP(i, 0, Math.max(getDP(i - 1, 0), dist));
    }

    // Initialize first row
    for (let j = 1; j < n; j++) {
      const dist = this.euclideanDistance(resampledPath1[0], resampledPath2[j]);
      setDP(0, j, Math.max(getDP(0, j - 1), dist));
    }

    // Fill the DP table
    for (let i = 1; i < m; i++) {
      let minInRow = Infinity;

      for (let j = 1; j < n; j++) {
        const dist = this.euclideanDistance(
          resampledPath1[i],
          resampledPath2[j]
        );

        const minPrev = Math.min(
          getDP(i - 1, j), // vertical
          getDP(i, j - 1), // horizontal
          getDP(i - 1, j - 1) // diagonal
        );

        const frechetDist = Math.max(minPrev, dist);
        setDP(i, j, frechetDist);

        minInRow = Math.min(minInRow, frechetDist);
      }

      // Early termination: if the entire row exceeds threshold, path is too different
      if (earlyTermination && minInRow > this.MAX_DISTANCE_THRESHOLD) {
        return minInRow;
      }
    }

    return getDP(m - 1, n - 1);
  }

  /**
   * Calculate normalized Fréchet distance as a similarity score (0-100).
   *
   * @param path1 First path as array of points
   * @param path2 Second path as array of points
   * @returns Similarity score: 100 = identical, 0 = completely different
   */
  static calculateNormalized(path1: Point[], path2: Point[]): number {
    if (path1.length === 0 || path2.length === 0) {
      return 0;
    }

    const distance = this.calculate(path1, path2);

    // Handle early termination case
    if (distance >= this.MAX_DISTANCE_THRESHOLD) {
      return 0;
    }

    // Normalize to 0-100 scale
    // Distance of 0 = 100% similarity
    // Distance of 50 = 0% similarity (chosen as reasonable threshold for SVG viewBox 0-100)
    const maxReasonableDistance = 50;
    const normalized = Math.max(
      0,
      100 * (1 - distance / maxReasonableDistance)
    );

    return Math.round(normalized);
  }

  /**
   * Calculate Euclidean distance between two points.
   *
   * @param p1 First point
   * @param p2 Second point
   * @returns Euclidean distance
   */
  static euclideanDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate Fréchet distance and return validation result.
   *
   * @param userPath User's drawn path
   * @param targetPath Correct target path
   * @param threshold Minimum similarity score required (0-100)
   * @returns Object with valid flag, distance, and normalized score
   */
  static validate(
    userPath: Point[],
    targetPath: Point[],
    threshold: number = 60
  ): {
    valid: boolean;
    distance: number;
    normalizedScore: number;
  } {
    const distance = this.calculate(userPath, targetPath);
    const normalizedScore = this.calculateNormalized(userPath, targetPath);

    return {
      valid: normalizedScore >= threshold,
      distance,
      normalizedScore,
    };
  }

  /**
   * Estimate computational complexity for given path lengths.
   * Used for performance monitoring and optimization decisions.
   *
   * @param path1Length Length of first path
   * @param path2Length Length of second path
   * @returns Estimated number of operations
   */
  static estimateComplexity(
    path1Length: number,
    path2Length: number
  ): number {
    // After resampling, both paths will have RESAMPLE_POINTS points
    // Complexity is O(n²) for the DP algorithm
    return this.RESAMPLE_POINTS * this.RESAMPLE_POINTS;
  }

  /**
   * Check if Fréchet distance should be used based on path characteristics.
   * Used to decide between geometric validation and shape matching.
   *
   * @param pathCommands SVG path commands from parsed stroke
   * @returns true if path has curves and would benefit from Fréchet distance
   */
  static shouldUseFrechet(pathCommands: string[]): boolean {
    // Use Fréchet distance if path contains curves (C or Q commands)
    return pathCommands.some(
      (cmd) => cmd.startsWith('C') || cmd.startsWith('Q')
    );
  }
}
