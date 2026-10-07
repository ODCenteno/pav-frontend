import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { BADGE_ICON_SIZE, communities, COMMUNITY_SLUGS, getCommunityBySlug } from '../communities';
import { contrastRatio } from '../../utils/contrast';

const PUBLIC_DIR = fileURLToPath(new URL('../../../public', import.meta.url));
const WHITE = '#FFFFFF';
const HEX = /^#[0-9A-F]{6}$/i;

describe('community fixtures', () => {
  it('contains exactly the two contract communities', () => {
    expect(communities.map((c) => c.slug).sort()).toEqual(['puerto-agua-verde', 'rancho-san-cosme']);
    expect([...COMMUNITY_SLUGS].sort()).toEqual(['puerto-agua-verde', 'rancho-san-cosme']);
  });

  it('has unique slugs and unique orders', () => {
    const slugs = communities.map((c) => c.slug);
    const orders = communities.map((c) => c.order);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('encodes the contract colors, icons and orders', () => {
    expect(getCommunityBySlug('puerto-agua-verde')).toMatchObject({
      color: '#0CA58C',
      textColor: '#08806D',
      icon: 'fish',
      order: 1,
    });
    expect(getCommunityBySlug('rancho-san-cosme')).toMatchObject({
      color: '#EC6E0B',
      textColor: '#B85206',
      icon: 'donkey',
      order: 2,
    });
  });

  it('places both communities within the same coastal corridor (< 30 km apart)', () => {
    const [a, b] = communities.map((c) => c.location);
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    const distanceKm = 2 * 6371 * Math.asin(Math.sqrt(h));
    expect(distanceKm).toBeLessThan(30);
  });

  it('returns undefined for unknown slugs', () => {
    expect(getCommunityBySlug('agua-verde')).toBeUndefined();
  });

  it.each(communities.map((c) => [c.slug, c] as const))('%s has every required field', (_slug, c) => {
    for (const loc of ['es-MX', 'en'] as const) {
      expect(c.name[loc].length, `name.${loc}`).toBeGreaterThan(0);
      expect(c.tagline[loc].length, `tagline.${loc}`).toBeGreaterThan(0);
    }
    expect(c.color).toMatch(HEX);
    expect(c.textColor).toMatch(HEX);
    expect(c.iconPath).toMatch(/^\/images\/communities\/.+\.webp$/);
    expect(Number.isInteger(c.order)).toBe(true);
    expect(typeof c.location.lat).toBe('number');
    expect(typeof c.location.lng).toBe('number');
    expect(Math.abs(c.location.lat)).toBeLessThanOrEqual(90);
    expect(Math.abs(c.location.lng)).toBeLessThanOrEqual(180);
  });
});

describe('community color accessibility (WCAG 2.x on white)', () => {
  it.each(communities.map((c) => [c.slug, c.textColor] as const))(
    '%s textColor reaches 4.5:1 for small text',
    (_slug, textColor) => {
      expect(contrastRatio(textColor, WHITE)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(communities.map((c) => [c.slug, c.color] as const))(
    '%s color reaches 3:1 for large surfaces, icons and borders',
    (_slug, color) => {
      expect(contrastRatio(color, WHITE)).toBeGreaterThanOrEqual(3);
    },
  );
});

describe('bundled community icons', () => {
  it.each(communities.map((c) => [c.slug, c.iconPath] as const))('%s icon file exists in public/', (_slug, iconPath) => {
    expect(existsSync(path.join(PUBLIC_DIR, iconPath))).toBe(true);
  });
});

describe("bundled badge icons", () => {
  // Largest rendered badge: the desktop hero half, 3.25rem = 52px.
  const LARGEST_DISPLAYED_PX = 52;

  it("are WebP files at 2x the largest displayed size", async () => {
    const { default: sharp } = await import("sharp");
    for (const c of communities) {
      expect(c.iconPath).toMatch(/^\/images\/communities\/[a-z-]+\.webp$/);
      const meta = await sharp(`${PUBLIC_DIR}${c.iconPath}`).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(BADGE_ICON_SIZE.width);
      expect(meta.height).toBe(BADGE_ICON_SIZE.height);
    }
    expect(BADGE_ICON_SIZE.width).toBe(2 * LARGEST_DISPLAYED_PX);
  });
});
