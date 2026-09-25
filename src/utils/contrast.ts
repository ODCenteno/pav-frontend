/**
 * WCAG 2.x color contrast helpers.
 *
 * Relative luminance and contrast ratio follow the WCAG 2.2 definitions:
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses `#RGB` / `#RRGGBB` (leading `#` optional) into 0–255 channels. */
export function hexToRgb(hex: string): Rgb {
  const raw = hex.trim().replace(/^#/, '');
  const full = raw.length === 3 ? raw.split('').map((ch) => ch + ch).join('') : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function linearizeChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, from 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

/** WCAG contrast ratio between two colors, from 1 to 21. Order does not matter. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}
