import React from 'react';
import { G, Circle, Polygon } from 'react-native-svg';

interface StrokeDirectionIndicatorProps {
  strokePath: string;
  visible: boolean;
}

/**
 * Component that displays directional indicators on stroke guide:
 * - Green dot at stroke start point
 * - Blue arrow at stroke end showing direction
 *
 * NOTE: Returns SVG elements directly (no wrapper) to avoid nested SVG issues on Android
 */
export default function StrokeDirectionIndicator({
  strokePath,
  visible,
}: StrokeDirectionIndicatorProps) {
  if (!visible) {
    return null;
  }

  // Parse the SVG path to extract start and end points
  const pathInfo = parsePathForIndicators(strokePath);

  if (!pathInfo) {
    return null;
  }

  const { startPoint, endPoint, angle } = pathInfo;

  // Calculate arrow points (triangle pointing in direction of stroke)
  const arrowSize = 8; // Size of arrow in viewBox units (2x larger for visibility)
  const arrowPoints = calculateArrowPoints(endPoint.x, endPoint.y, angle, arrowSize);

  return (
    <G>
      {/* Start point indicator (green dot) */}
      <Circle
        cx={startPoint.x}
        cy={startPoint.y}
        r={2.5}
        fill="#4caf50"
        opacity={0.9}
      />

      {/* End point indicator (arrow) */}
      <Polygon
        points={arrowPoints}
        fill="#2196f3"
        opacity={0.85}
      />
    </G>
  );
}

interface Point {
  x: number;
  y: number;
}

interface PathInfo {
  startPoint: Point;
  endPoint: Point;
  angle: number; // In radians
}

/**
 * Parse SVG path to extract start point, end point, and direction angle.
 * Supports M (move), L (line), C (cubic curve), Q (quadratic curve) commands.
 */
function parsePathForIndicators(pathData: string): PathInfo | null {
  if (!pathData) return null;

  // Remove extra whitespace and split by commands
  const cleaned = pathData.trim().replace(/\s+/g, ' ');

  // Extract all commands and their coordinates
  const commands = cleaned.match(/[MLCQZ][^MLCQZ]*/gi);

  if (!commands || commands.length === 0) return null;

  let startPoint: Point | null = null;
  let endPoint: Point | null = null;
  let currentPoint: Point = { x: 0, y: 0 };
  let previousPoint: Point = { x: 0, y: 0 }; // Track previous point for angle calculation

  for (const command of commands) {
    const type = command[0].toUpperCase();
    const isRelative = command[0] === command[0].toLowerCase() && command[0] !== 'Z';
    const coords = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    switch (type) {
      case 'M': // Move to
        if (coords.length >= 2) {
          previousPoint = { ...currentPoint };
          if (isRelative) {
            currentPoint = { x: currentPoint.x + coords[0], y: currentPoint.y + coords[1] };
          } else {
            currentPoint = { x: coords[0], y: coords[1] };
          }
          if (!startPoint) {
            startPoint = { ...currentPoint };
          }
          endPoint = { ...currentPoint };
        }
        break;

      case 'L': // Line to
        if (coords.length >= 2) {
          previousPoint = { ...currentPoint };
          if (isRelative) {
            currentPoint = { x: currentPoint.x + coords[0], y: currentPoint.y + coords[1] };
          } else {
            currentPoint = { x: coords[0], y: coords[1] };
          }
          endPoint = { ...currentPoint };
        }
        break;

      case 'C': // Cubic Bezier curve
        if (coords.length >= 6) {
          // For direction at end, use second control point to end point
          if (isRelative) {
            previousPoint = { x: currentPoint.x + coords[2], y: currentPoint.y + coords[3] };
            currentPoint = { x: currentPoint.x + coords[4], y: currentPoint.y + coords[5] };
          } else {
            previousPoint = { x: coords[2], y: coords[3] }; // Second control point
            currentPoint = { x: coords[4], y: coords[5] }; // End point
          }
          endPoint = { ...currentPoint };
        }
        break;

      case 'Q': // Quadratic Bezier curve
        if (coords.length >= 4) {
          // For direction at end, use control point to end point
          if (isRelative) {
            previousPoint = { x: currentPoint.x + coords[0], y: currentPoint.y + coords[1] };
            currentPoint = { x: currentPoint.x + coords[2], y: currentPoint.y + coords[3] };
          } else {
            previousPoint = { x: coords[0], y: coords[1] }; // Control point
            currentPoint = { x: coords[2], y: coords[3] }; // End point
          }
          endPoint = { ...currentPoint };
        }
        break;

      case 'Z': // Close path
        // Returns to start point
        if (startPoint) {
          previousPoint = { ...currentPoint };
          currentPoint = { ...startPoint };
          endPoint = { ...currentPoint };
        }
        break;
    }
  }

  if (!startPoint || !endPoint) return null;

  // Calculate direction angle from previous point to end point (direction at end of stroke)
  const dx = endPoint.x - previousPoint.x;
  const dy = endPoint.y - previousPoint.y;
  const angle = Math.atan2(dy, dx);

  return {
    startPoint,
    endPoint,
    angle,
  };
}

/**
 * Calculate triangle points for directional arrow.
 * Returns a string suitable for SVG polygon points attribute.
 */
function calculateArrowPoints(
  x: number,
  y: number,
  angle: number,
  size: number
): string {
  // Arrow points form an isosceles triangle pointing in the direction of angle
  // Tip of arrow is at (x, y)

  const tipX = x;
  const tipY = y;

  // Base points are offset backwards and to the sides
  const baseAngle1 = angle + Math.PI - Math.PI / 6; // 150 degrees from direction
  const baseAngle2 = angle - Math.PI + Math.PI / 6; // 210 degrees from direction

  const base1X = x + size * Math.cos(baseAngle1);
  const base1Y = y + size * Math.sin(baseAngle1);

  const base2X = x + size * Math.cos(baseAngle2);
  const base2Y = y + size * Math.sin(baseAngle2);

  return `${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`;
}
