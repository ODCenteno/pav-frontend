/**
 * Community fixtures for the redesign data contract.
 * Canonical spec: docs/contracts/redesign-data-contract.md
 *
 * These are the FE-side source of truth for slugs, brand colors and bundled
 * icons, and the fallback when the `community` collection type is not
 * reachable. Editorial content (tagline, description, history…) lives in
 * Strapi; the taglines below are placeholders.
 */
import type { LocalizedString } from '../types/i18n.type';
import type { Location } from '../types/common.type';
import type { CommunitySlug } from '../types/community.type';

export type CommunityIcon = 'fish' | 'donkey';

export interface CommunityFixture {
  slug: CommunitySlug;
  name: LocalizedString;
  tagline: LocalizedString;
  /** Hex. Large surfaces, icons and borders (>= 3:1 on white). */
  color: string;
  /** Hex. Small text and tags (>= 4.5:1 on white, WCAG AA). */
  textColor: string;
  icon: CommunityIcon;
  /** Bundled fallback for `community.badgeIcon`, served from /public. */
  iconPath: string;
  order: number;
  location: Location;
}

/**
 * Intrinsic size of the bundled badge icons (`iconPath`): 2x the largest
 * rendered badge (3.25rem = 52px in the desktop hero), resized from the
 * 223x226 PNG originals.
 */
export const BADGE_ICON_SIZE = { width: 104, height: 105 } as const;

export const COMMUNITY_SLUGS = ['puerto-agua-verde', 'rancho-san-cosme'] as const satisfies readonly CommunitySlug[];

export const communities: readonly CommunityFixture[] = [
  {
    slug: 'puerto-agua-verde',
    name: { 'es-MX': 'Puerto Agua Verde', en: 'Puerto Agua Verde' },
    // TODO(content): placeholder tagline, replaced by the CMS value.
    tagline: { 'es-MX': 'Comunidad pesquera frente al Mar de Cortés', en: 'Fishing community on the Sea of Cortez' },
    color: '#0CA58C',
    textColor: '#08806D',
    icon: 'fish',
    iconPath: '/images/communities/fish.webp',
    order: 1,
    // Source: pav-backend/scripts/import-csv-listings.js (PAV_COORDS).
    location: { lat: 25.51204, lng: -111.07577 },
  },
  {
    slug: 'rancho-san-cosme',
    name: { 'es-MX': 'Rancho San Cosme', en: 'Rancho San Cosme' },
    // TODO(content): placeholder tagline, replaced by the CMS value.
    tagline: { 'es-MX': 'Vida ranchera entre la sierra y el mar', en: 'Ranch life between the mountains and the sea' },
    color: '#EC6E0B',
    textColor: '#B85206',
    icon: 'donkey',
    iconPath: '/images/communities/donkey.webp',
    order: 2,
    // Source: OpenStreetMap hamlet "Rancho San Cosme" (Nominatim). The value in
    // pav-backend/scripts/import-csv-listings.js (24.16315, -110.3384) points to La Paz.
    location: { lat: 25.5784138, lng: -111.1694027 },
  },
];

export function getCommunityBySlug(slug: string): CommunityFixture | undefined {
  return communities.find((c) => c.slug === slug);
}
