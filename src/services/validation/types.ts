/**
 * Shared types for stroke validation services
 */

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z';
  coords: number[];
  absolute: boolean;
}

export interface ParsedStroke {
  startPoint: Point;
  endPoint: Point;
  direction: number; // Angle in radians
  boundingBox: BoundingBox;
  commands: PathCommand[];
  length: number; // Approximate path length
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  accuracy: number; // 0-100
  metrics?: {
    startPointAccuracy?: number;
    endPointAccuracy?: number;
    directionAccuracy?: number;
    shapeAccuracy?: number;
  };
}

export interface ValidationConfig {
  startPointTolerance: number; // Units in viewBox coordinates
  endPointTolerance: number;
  directionTolerance: number; // Degrees
  minimumAccuracy: number; // 0-100
}
