import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

interface StrokeDirectionIndicatorProps {
  strokePath: string;
  visible: boolean;
}

/**
 * Component that displays directional indicators on stroke guide:
 * - Green dot at stroke start point
 * - Blue arrow at stroke end showing direction
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
  const arrowSize = 4; // Size of arrow in viewBox units
  const arrowPoints = calculateArrowPoints(endPoint.x, endPoint.y, angle, arrowSize);

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      style={styles.svg}
    >
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
    </Svg>
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

  for (const command of commands) {
    const type = command[0].toUpperCase();
    const coords = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    switch (type) {
      case 'M': // Move to
        if (coords.length >= 2) {
          currentPoint = { x: coords[0], y: coords[1] };
          if (!startPoint) {
            startPoint = { ...currentPoint };
          }
          endPoint = { ...currentPoint };
        }
        break;

      case 'L': // Line to
        if (coords.length >= 2) {
          currentPoint = { x: coords[0], y: coords[1] };
          endPoint = { ...currentPoint };
        }
        break;

      case 'C': // Cubic Bezier curve
        if (coords.length >= 6) {
          // End point is the last pair
          currentPoint = { x: coords[4], y: coords[5] };
          endPoint = { ...currentPoint };
        }
        break;

      case 'Q': // Quadratic Bezier curve
        if (coords.length >= 4) {
          // End point is the last pair
          currentPoint = { x: coords[2], y: coords[3] };
          endPoint = { ...currentPoint };
        }
        break;

      case 'Z': // Close path
        // Returns to start point
        if (startPoint) {
          currentPoint = { ...startPoint };
          endPoint = { ...currentPoint };
        }
        break;
    }
  }

  if (!startPoint || !endPoint) return null;

  // Calculate direction angle from start to end
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
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

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
