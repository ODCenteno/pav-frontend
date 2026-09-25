import { describe, it, expect } from 'vitest';
import { hexToRgb, relativeLuminance, contrastRatio } from '../contrast';

describe('hexToRgb', () => {
  it('parses 6-digit hex with or without #', () => {
    expect(hexToRgb('#0CA58C')).toEqual({ r: 12, g: 165, b: 140 });
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('expands 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('throws on invalid input', () => {
    expect(() => hexToRgb('#12')).toThrow();
    expect(() => hexToRgb('#zzzzzz')).toThrow();
  });
});

describe('relativeLuminance (WCAG 2.x)', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('uses the linear segment for very dark channels', () => {
    // 0x0A / 255 = 0.0392 <= 0.04045 -> linear branch (c / 12.92)
    expect(relativeLuminance('#0A0A0A')).toBeCloseTo(10 / 255 / 12.92, 6);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#08806D', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#08806D'), 10);
  });

  it('matches a known reference value (#767676 on white ~ 4.54)', () => {
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });
});
