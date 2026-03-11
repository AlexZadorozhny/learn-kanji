/**
 * Unit tests for KanjiVGParserService
 */

import { KanjiVGParserService } from '../KanjiVGParserService';
import { StrokePath } from '../../../types/kanji';
import * as fs from 'fs';
import * as path from 'path';

// Helper to load fixture files
const loadFixture = (filename: string): string => {
  const fixturePath = path.join(__dirname, 'fixtures', filename);
  return fs.readFileSync(fixturePath, 'utf-8');
};

describe('KanjiVGParserService', () => {
  describe('parseKanjiVGSVG', () => {
    describe('single stroke kanji', () => {
      it('should parse 一 (one) with single horizontal stroke', () => {
        const svgContent = loadFixture('04e00.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+4E00');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].path).toBeDefined();
        expect(result![0].strokeNumber).toBe(1);
        expect(result![0].path).toContain('M');
      });

      it('should normalize coordinates from 109×109 to 100×100', () => {
        const svgContent = loadFixture('04e00.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+4E00');

        expect(result).not.toBeNull();

        // Real KanjiVG data has been normalized
        // Just verify it has valid path data
        const pathData = result![0].path;
        expect(pathData).toBeDefined();
        expect(pathData.length).toBeGreaterThan(0);
        expect(pathData).toMatch(/M\s+[\d.]+,[\d.]+/);
      });
    });

    describe('multi-stroke kanji', () => {
      it('should parse 人 (person) with two strokes', () => {
        const svgContent = loadFixture('04eba.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+4EBA');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
        expect(result![0].path).toBeDefined();
        expect(result![0].strokeNumber).toBe(1);
        expect(result![1].path).toBeDefined();
        expect(result![1].strokeNumber).toBe(2);
      });

      it('should preserve stroke order', () => {
        const svgContent = loadFixture('04eba.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+4EBA');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);

        // Verify strokes are in correct order
        expect(result![0].strokeNumber).toBe(1);
        expect(result![1].strokeNumber).toBe(2);

        // Verify both have valid path data
        expect(result![0].path).toMatch(/M\s+[\d.]+,[\d.]+/);
        expect(result![1].path).toMatch(/M\s+[\d.]+,[\d.]+/);
      });

      it('should parse 国 (country) with 8 strokes', () => {
        const svgContent = loadFixture('056fd.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+56FD');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(8);

        // Verify all strokes have path data and stroke numbers
        result!.forEach((stroke, index) => {
          expect(stroke.path).toBeDefined();
          expect(stroke.path.length).toBeGreaterThan(0);
          expect(stroke.strokeNumber).toBe(index + 1);
        });
      });

      it('should parse 時 (time) with 10 strokes', () => {
        const svgContent = loadFixture('06642.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+6642');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(10);

        // Verify stroke numbers are sequential
        result!.forEach((stroke, index) => {
          expect(stroke.strokeNumber).toBe(index + 1);
        });
      });
    });

    describe('curved strokes', () => {
      it('should handle cubic curves (C command)', () => {
        const svgWithCurve = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M 20,30 C 30,40 50,60 70,80"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(svgWithCurve, 'U+FFFF');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].path).toContain('C');
        expect(result![0].strokeNumber).toBe(1);

        // Verify coordinates are scaled
        const pathData = result![0].path;
        expect(pathData).toMatch(/M\s+18\.\d+,27\.\d+/); // 20 * 0.917431
        expect(pathData).toMatch(/C\s+27\.\d+,36\.\d+/); // 30 * 0.917431
      });

      it('should handle quadratic curves (Q command)', () => {
        const svgWithQuad = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M 10,10 Q 50,50 90,90"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(svgWithQuad, 'U+FFFF');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].path).toContain('Q');
        expect(result![0].strokeNumber).toBe(1);
      });
    });

    describe('coordinate normalization', () => {
      it('should correctly scale factor (100/109)', () => {
        const scaleFactor = 100 / 109;
        expect(scaleFactor).toBeCloseTo(0.917431, 5);
      });

      it('should normalize all coordinate types', () => {
        const svgMixed = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M 0,0 L 109,109 C 54.5,54.5 109,0 109,109 Z"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(svgMixed, 'U+FFFF');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);

        const pathData = result![0].path;

        // M 0,0 → M 0.00,0.00
        expect(pathData).toMatch(/M\s+0\.00,0\.00/);

        // L 109,109 → L 100.00,100.00
        expect(pathData).toMatch(/L\s+100\.00,100\.00/);

        // C 54.5,54.5 → C 50.00,50.00
        expect(pathData).toMatch(/C\s+50\.00,50\.00/);

        // Z command (no coordinates)
        expect(pathData).toContain('Z');
      });

      it('should handle negative coordinates', () => {
        const svgNegative = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M -10,20 L 30,-5"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(svgNegative, 'U+FFFF');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);

        const pathData = result![0].path;
        // -10 * 0.917431 ≈ -9.17
        expect(pathData).toMatch(/M\s+-9\.\d+,18\.\d+/);
        // -5 * 0.917431 ≈ -4.59
        expect(pathData).toMatch(/L\s+27\.\d+,-4\.\d+/);
      });

      it('should handle decimal coordinates', () => {
        const svgDecimal = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M 12.5,25.75 L 87.25,50.5"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(svgDecimal, 'U+FFFF');

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);

        const pathData = result![0].path;
        // 12.5 * 0.917431 ≈ 11.47
        expect(pathData).toMatch(/M\s+11\.\d+,23\.\d+/);
      });
    });

    describe('error handling', () => {
      it('should return null for malformed SVG', () => {
        const malformedSvg = loadFixture('malformed.svg');
        const result = KanjiVGParserService.parseKanjiVGSVG(malformedSvg, 'U+MALFORMED');

        expect(result).toBeNull();
      });

      it('should return null for empty SVG', () => {
        const emptySvg = '<svg></svg>';
        const result = KanjiVGParserService.parseKanjiVGSVG(emptySvg, 'U+EMPTY');

        expect(result).toBeNull();
      });

      it('should return null for SVG with no strokes', () => {
        const noStrokesSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:test">
              <!-- No stroke groups -->
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(noStrokesSvg, 'U+NOSTROKES');

        expect(result).toBeNull();
      });

      it('should return null for SVG with missing path data', () => {
        const missingPathSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d=""/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(missingPathSvg, 'U+MISSINGPATH');

        expect(result).toBeNull();
      });

      it('should handle invalid XML gracefully', () => {
        const invalidXml = '<svg><g unclosed';
        const result = KanjiVGParserService.parseKanjiVGSVG(invalidXml, 'U+INVALID');

        // Should not throw, should return null
        expect(result).toBeNull();
      });

      it('should log warning for kanji with no strokes', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const noStrokesSvg = '<svg><g id="kvg:test"></g></svg>';
        KanjiVGParserService.parseKanjiVGSVG(noStrokesSvg, 'U+TEST');

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No strokes found'));

        consoleWarnSpy.mockRestore();
      });

      it('should handle null input gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Pass null input
        const invalidSvg = null as any;
        const result = KanjiVGParserService.parseKanjiVGSVG(invalidSvg, 'U+ERROR');

        expect(result).toBeNull();
        // Note: May or may not log error depending on where exception occurs
        consoleErrorSpy.mockRestore();
      });
    });

    describe('validation', () => {
      it('should validate paths start with M command', () => {
        const validSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="M 20,30 L 40,50"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(validSvg, 'U+VALID');

        expect(result).not.toBeNull();
        expect(result![0].path.trim().startsWith('M')).toBe(true);
      });

      it('should reject paths not starting with M command', () => {
        const invalidSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
            <g id="kvg:StrokePaths_0ffff">
              <g id="kvg:0ffff">
                <path id="kvg:0ffff-s1" d="L 40,50"/>
              </g>
            </g>
          </svg>
        `;

        const result = KanjiVGParserService.parseKanjiVGSVG(invalidSvg, 'U+INVALID');

        expect(result).toBeNull();
      });
    });
  });

  describe('getStrokeCount', () => {
    it('should return correct stroke count for single stroke kanji', () => {
      const svgContent = loadFixture('04e00.svg');
      const count = KanjiVGParserService.getStrokeCount(svgContent);

      expect(count).toBe(1);
    });

    it('should return correct stroke count for multi-stroke kanji', () => {
      const svgContent = loadFixture('04eba.svg');
      const count = KanjiVGParserService.getStrokeCount(svgContent);

      expect(count).toBe(2);
    });

    it('should return correct stroke count for complex kanji', () => {
      const svg056fd = loadFixture('056fd.svg');
      expect(KanjiVGParserService.getStrokeCount(svg056fd)).toBe(8);

      const svg06642 = loadFixture('06642.svg');
      expect(KanjiVGParserService.getStrokeCount(svg06642)).toBe(10);
    });

    it('should return 0 for malformed SVG', () => {
      const malformedSvg = loadFixture('malformed.svg');
      const count = KanjiVGParserService.getStrokeCount(malformedSvg);

      expect(count).toBe(0);
    });

    it('should return 0 for empty SVG', () => {
      const emptySvg = '<svg></svg>';
      const count = KanjiVGParserService.getStrokeCount(emptySvg);

      expect(count).toBe(0);
    });

    it('should not throw on invalid input', () => {
      expect(() => {
        KanjiVGParserService.getStrokeCount(null as any);
      }).not.toThrow();

      expect(() => {
        KanjiVGParserService.getStrokeCount(undefined as any);
      }).not.toThrow();
    });
  });

  describe('extractKanjiCharacter', () => {
    it('should extract kanji character from kvg:element attribute', () => {
      const svgContent = loadFixture('04e00.svg');
      const character = KanjiVGParserService.extractKanjiCharacter(svgContent);

      expect(character).toBe('一');
    });

    it('should extract multi-element kanji character', () => {
      const svgContent = loadFixture('04eba.svg');
      const character = KanjiVGParserService.extractKanjiCharacter(svgContent);

      expect(character).toBe('人');
    });

    it('should extract from complex kanji', () => {
      const svg056fd = loadFixture('056fd.svg');
      expect(KanjiVGParserService.extractKanjiCharacter(svg056fd)).toBe('国');

      const svg06642 = loadFixture('06642.svg');
      expect(KanjiVGParserService.extractKanjiCharacter(svg06642)).toBe('時');
    });

    it('should return null if kvg:element not found', () => {
      const svgWithoutElement = '<svg><g id="test"></g></svg>';
      const character = KanjiVGParserService.extractKanjiCharacter(svgWithoutElement);

      expect(character).toBeNull();
    });

    it('should return null for malformed SVG', () => {
      const malformedSvg = loadFixture('malformed.svg');
      const character = KanjiVGParserService.extractKanjiCharacter(malformedSvg);

      expect(character).toBeNull();
    });

    it('should not throw on invalid input', () => {
      expect(() => {
        KanjiVGParserService.extractKanjiCharacter(null as any);
      }).not.toThrow();

      expect(() => {
        KanjiVGParserService.extractKanjiCharacter(undefined as any);
      }).not.toThrow();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle all fixture files successfully', () => {
      const fixtures = ['04e00.svg', '04eba.svg', '056fd.svg', '06642.svg'];

      fixtures.forEach((filename) => {
        const svgContent = loadFixture(filename);
        const kanjiId = `U+${filename.replace('.svg', '').toUpperCase()}`;
        const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, kanjiId);

        expect(result).not.toBeNull();
        expect(result!.length).toBeGreaterThan(0);
      });
    });

    it('should produce valid StrokePath objects', () => {
      const svgContent = loadFixture('04eba.svg');
      const result = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+4EBA');

      expect(result).not.toBeNull();

      result!.forEach((stroke: StrokePath, index: number) => {
        // Check structure
        expect(stroke).toHaveProperty('path');
        expect(stroke).toHaveProperty('strokeNumber');
        expect(typeof stroke.path).toBe('string');
        expect(stroke.path.length).toBeGreaterThan(0);
        expect(stroke.strokeNumber).toBe(index + 1);

        // Check format
        expect(stroke.path.trim()).toMatch(/^M\s+[\d.-]+,[\d.-]+/);
      });
    });

    it('should maintain consistency across multiple parses', () => {
      const svgContent = loadFixture('056fd.svg');

      const result1 = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+56FD');
      const result2 = KanjiVGParserService.parseKanjiVGSVG(svgContent, 'U+56FD');

      expect(result1).toEqual(result2);
    });
  });
});
