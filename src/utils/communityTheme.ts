/**
 * Community theming (redesign contract §2).
 *
 * `communityStyle` resolves a `CommunityRef` into the inline CSS custom
 * properties consumed by cards, badges and page sections:
 *
 *   - `--community-color`      large surfaces, icons and borders (>= 3:1 on white)
 *   - `--community-color-text` small text and tags (>= 4.5:1 on white, WCAG AA)
 *
 * Without a community the site's current primary color applies. The site
 * primary (#5A8A80, `--color-primary` in `src/styles/globals.css`) only
 * reaches ~3.9:1 on white, so the default text color is a darker emerald
 * that clears the 4.5:1 AA threshold — enforced by unit tests, mirroring
 * `src/data/__tests__/communities.test.ts`.
 */

import type { CommunityRef } from '../types/community.type';
import { getCommunityBySlug } from '../data/communities';

/** Inline style object for Astro's `style` attribute. */
export interface CommunityStyle {
  '--community-color': string;
  '--community-color-text': string;
}

/** Site primary (`--color-primary` / `--color-emerald` in globals.css). */
export const SITE_PRIMARY_COLOR = '#5A8A80';

/**
 * Darker emerald used for small text when no community theme applies.
 * ~6:1 on white (>= 4.5:1 WCAG AA), asserted in communityTheme.test.ts.
 */
export const SITE_PRIMARY_TEXT_COLOR = '#3D6B62';

/**
 * Resolve the community theme custom properties. A missing community (or a
 * ref with empty colors) falls back to the site primary pair.
 */
export function communityStyle(community?: CommunityRef | null): CommunityStyle {
  if (!community) {
    return {
      '--community-color': SITE_PRIMARY_COLOR,
      '--community-color-text': SITE_PRIMARY_TEXT_COLOR,
    };
  }
  return {
    '--community-color': (community.color || '').trim() || SITE_PRIMARY_COLOR,
    '--community-color-text': (community.textColor || '').trim() || SITE_PRIMARY_TEXT_COLOR,
  };
}

/**
 * Resolve the badge icon URL for a community: the CMS `badgeIcon` media wins;
 * when empty, the bundled PNG from `src/data/communities.ts` serves as
 * fallback. Returns '' when there is nothing to render (no community, or an
 * unknown slug without a CMS icon) — callers hide the image in that case.
 */
export function communityBadgeIcon(community?: CommunityRef | null): string {
  if (!community) return '';
  if (community.badgeIcon) return community.badgeIcon;
  const fixture = getCommunityBySlug(community.slug);
  return fixture?.iconPath || '';
}
