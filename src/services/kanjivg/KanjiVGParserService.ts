/**
 * KanjiVGParserService
 *
 * Parses KanjiVG SVG format into app's StrokePath[] format.
 *
 * KanjiVG Format:
 * - SVG viewBox: 0 0 109 109
 * - Each stroke in a <g> element with kvg:number attribute
 * - Path data in <path d="..."> element
 *
 * App Format:
 * - SVG viewBox: 0 0 100 100
 * - Array of StrokePath objects with normalized coordinates
 *
 * Data Attribution:
 * KanjiVG data © Ulrich Apel, CC BY-SA 3.0
 * https://kanjivg.tagaini.net/
 *
 * Modifications: Coordinates normalized from 109×109 to 100×100 viewBox
 */

import { StrokePath } from '../../types/kanji';

interface RawStroke {
  strokeNumber: number;
  pathData: string;
}

export class KanjiVGParserService {
  // KanjiVG uses 109×109 viewBox, app uses 100×100
  private static readonly KANJIVG_VIEWBOX_SIZE = 109;
  private static readonly APP_VIEWBOX_SIZE = 100;
  private static readonly SCALE_FACTOR =
    KanjiVGParserService.APP_VIEWBOX_SIZE / KanjiVGParserService.KANJIVG_VIEWBOX_SIZE;

  /**
   * Main entry point: Parse KanjiVG SVG string into StrokePath array
   *
   * @param svgContent - Raw SVG string from KanjiVG
   * @param kanjiId - Kanji ID (e.g., "U+4E00") for error reporting
   * @returns Array of StrokePath objects, or null if parsing fails
   */
  static parseKanjiVGSVG(svgContent: string, kanjiId: string): StrokePath[] | null {
    try {
      // Extract stroke paths with stroke numbers
      const rawStrokes = this.extractStrokePaths(svgContent);

      if (rawStrokes.length === 0) {
        console.warn(`KanjiVGParser: No strokes found in SVG for ${kanjiId}`);
        return null;
      }

      // Convert to StrokePath format with normalized coordinates
      const strokePaths: StrokePath[] = rawStrokes.map((raw) => ({
        path: this.normalizePathCoordinates(raw.pathData),
        strokeNumber: raw.strokeNumber,
      }));

      // Validate parsed data
      if (!this.validateStrokePaths(strokePaths)) {
        console.warn(`KanjiVGParser: Validation failed for ${kanjiId}`);
        return null;
      }

      return strokePaths;
    } catch (error) {
      console.error(`KanjiVGParser: Failed to parse SVG for ${kanjiId}:`, error);
      return null;
    }
  }

  /**
   * Extract stroke paths from SVG content
   *
   * KanjiVG format:
   * <g id="kvg:StrokePaths_04e00">
   *   <g id="kvg:04e00" kvg:element="一">
   *     <path id="kvg:04e00-s1" d="M 11,54.25 c 3.19,0.62 ..." />
   *     <path id="kvg:04e00-s2" d="M 20,30 L 40,50" />
   *   </g>
   * </g>
   *
   * Stroke number is extracted from path id (e.g., "kvg:04e00-s1" -> stroke 1)
   *
   * @param svgContent - Raw SVG string
   * @returns Array of raw strokes with stroke numbers
   */
  private static extractStrokePaths(svgContent: string): RawStroke[] {
    const rawStrokes: RawStroke[] = [];

    // Pattern to match <path> elements with id containing stroke number (e.g., kvg:04e00-s1)
    // Format: id="kvg:{hex}-s{number}" d="path data"
    const pathPattern = /<path[^>]*\sid="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]*)"/gi;

    let pathMatch;
    while ((pathMatch = pathPattern.exec(svgContent)) !== null) {
      const strokeNumber = parseInt(pathMatch[1], 10);
      const pathData = pathMatch[2].trim();

      if (pathData) {
        rawStrokes.push({
          strokeNumber,
          pathData,
        });
      }
    }

    // Sort by stroke number (ascending)
    rawStrokes.sort((a, b) => a.strokeNumber - b.strokeNumber);

    return rawStrokes;
  }

  /**
   * Normalize path coordinates from KanjiVG viewBox (109×109) to app viewBox (100×100)
   *
   * Handles SVG path commands:
   * - M/m (move): 2 coordinates
   * - L/l (line): 2 coordinates
   * - C/c (cubic curve): 6 coordinates (2 control points + 1 end point)
   * - Q/q (quadratic curve): 4 coordinates (1 control point + 1 end point)
   * - Z/z (close path): no coordinates
   *
   * Coordinates are scaled by SCALE_FACTOR (100/109 ≈ 0.917431)
   *
   * @param pathData - Original path string (e.g., "M 20,30 L 40,50")
   * @returns Normalized path string with scaled coordinates
   */
  private static normalizePathCoordinates(pathData: string): string {
    // Split path into commands and coordinates
    // Pattern: Command letter (M,L,C,Q,Z) followed by optional coordinates
    const commandPattern = /([MLCQZmlcqz])([^MLCQZmlcqz]*)/g;

    let normalized = '';
    let match;

    while ((match = commandPattern.exec(pathData)) !== null) {
      const command = match[1];
      const coordsString = match[2].trim();

      normalized += command;

      if (coordsString) {
        // Extract numbers (handles spaces, commas, negative numbers)
        const coords = coordsString.match(/-?\d+\.?\d*/g);

        if (coords) {
          // Scale all coordinate values
          const scaledCoords = coords.map((coord) => {
            const value = parseFloat(coord) * this.SCALE_FACTOR;
            // Round to 2 decimal places for cleaner output
            return value.toFixed(2);
          });

          // Reconstruct coordinate string
          normalized += ' ' + scaledCoords.join(',');
        }
      }

      if (command.toLowerCase() !== 'z') {
        normalized += ' ';
      }
    }

    return normalized.trim();
  }

  /**
   * Validate parsed stroke paths
   *
   * Checks:
   * - At least one stroke exists
   * - All paths have valid data
   * - All paths start with M/m command
   *
   * @param paths - Array of StrokePath objects
   * @returns true if valid, false otherwise
   */
  private static validateStrokePaths(paths: StrokePath[]): boolean {
    if (paths.length === 0) {
      return false;
    }

    for (const path of paths) {
      // Check path has data
      if (!path.path || path.path.length === 0) {
        return false;
      }

      // Check stroke number is valid
      if (!path.strokeNumber || path.strokeNumber < 1) {
        return false;
      }

      // Check path starts with Move command
      const trimmed = path.path.trim();
      if (!trimmed.startsWith('M') && !trimmed.startsWith('m')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Utility: Get stroke count from SVG without full parsing
   * Useful for quick validation or metadata extraction
   *
   * @param svgContent - Raw SVG string
   * @returns Number of strokes, or 0 if parsing fails
   */
  static getStrokeCount(svgContent: string): number {
    try {
      const groupPattern = /<g[^>]*kvg:number="(\d+)"/g;
      let count = 0;
      while (groupPattern.exec(svgContent) !== null) {
        count++;
      }

      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Utility: Extract kanji character from SVG if embedded
   * KanjiVG SVGs often include the kanji character in metadata
   *
   * @param svgContent - Raw SVG string
   * @returns Kanji character, or null if not found
   */
  static extractKanjiCharacter(svgContent: string): string | null {
    try {
      // Pattern: kvg:element attribute typically contains the character
      const elementPattern = /kvg:element="([^"]*)"/;
      const match = elementPattern.exec(svgContent);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch {
      return null;
    }
  }
}
