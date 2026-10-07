/**
 * Responsive sizing of the home hero photos.
 *
 * Hero.astro renders every community photo twice: the mobile card (< 968px)
 * and the desktop half (>= 968px). The hidden variant is `display: none` but
 * an eager image still downloads, so each `sizes` resolves to `1px` outside
 * its own breakpoint: the browser then picks the smallest candidate for the
 * hidden copy instead of a full-size photo.
 */
export const HERO_SIZES = {
  /** Mobile card: full width minus the page gutters. */
  card: '(max-width: 967px) calc(100vw - 2rem), 1px',
  /** Desktop split: one half of the viewport. */
  half: '(min-width: 968px) 50vw, 1px',
} as const;

/** Build-time widths for the bundled hero photos (ascending). */
export const HERO_WIDTHS: readonly number[] = [320, 480, 640, 768, 960, 1280, 1920];
