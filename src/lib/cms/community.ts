/**
 * Community CMS fetchers with fixture fallback (contract §4 / §9).
 *
 * `getCommunities` / `getCommunityBySlug` never throw: when the CMS is
 * unreachable, errors, or returns an empty list, the fixture-derived
 * Communities from `src/data/communities.ts` are served instead (mirroring
 * the "never null" style of `getGuidePage`). Per-field completion — CMS
 * value wins, fixtures fill the gaps — lives in `transformCommunity`.
 */

import type { Community } from '../../types/community.type';
import {
  transformCommunity,
  type CommunityAttributes,
} from '../../utils/strapiTransformer';
// The fixture lookup is aliased: this module exports its own
// `getCommunityBySlug` fetcher, and the import would collide in this scope.
import { communities, getCommunityBySlug as getFixtureBySlug } from '../../data/communities';
import { safe, strapiGet, toStrapiLocale } from './http';

/** Contract §9 populate set for `GET /api/communities`. */
const COMMUNITY_POPULATE: Record<string, string> = {
  'populate[0]': 'badgeIcon',
  'populate[1]': 'heroImage',
  'populate[2]': 'location',
  'populate[3]': 'historyHeader',
  'populate[4]': 'historyMilestones',
  'populate[5]': 'touristMapImage',
  'populate[6]': 'highlightsHeader',
  'populate[7]': 'highlights.image',
  'populate[8]': 'quickFactsHeader',
  'populate[9]': 'quickFacts',
  'populate[10]': 'gallery',
  'populate[11]': 'finalCta',
};

/**
 * Build the fixture-derived Community view model. Routes through
 * `transformCommunity` with an empty raw item so fixture completion is the
 * single mapping path for fixture and CMS data alike. Unknown slugs return
 * null (there is nothing to serve).
 */
function communityFromFixture(slug: string, locale: string): Community | null {
  const fixture = getFixtureBySlug(slug);
  if (!fixture) return null;
  return transformCommunity(
    { documentId: fixture.slug, attributes: { slug: fixture.slug } },
    locale,
  );
}

/**
 * All communities ordered by `order` (CMS `sort=order:asc`). Falls back to
 * both fixture communities when the CMS returns nothing.
 */
export async function getCommunities(locale: string = 'es-MX'): Promise<Community[]> {
  const fromCms = await safe(() =>
    strapiGet<CommunityAttributes>('/communities', {
      sort: 'order:asc',
      locale: toStrapiLocale(locale),
      ...COMMUNITY_POPULATE,
    }),
  );

  if (fromCms && fromCms.data.length > 0) {
    return fromCms.data.map((item) => transformCommunity(item, locale));
  }

  return communities.flatMap((f) => {
    const c = communityFromFixture(f.slug, locale);
    return c ? [c] : [];
  });
}

/**
 * One community by slug, or null when neither the CMS nor the fixtures know
 * the slug (fixture lookup also covers a CMS outage).
 */
export async function getCommunityBySlug(
  slug: string,
  locale: string = 'es-MX',
): Promise<Community | null> {
  const fromCms = await safe(() =>
    strapiGet<CommunityAttributes>('/communities', {
      'filters[slug][$eq]': slug,
      locale: toStrapiLocale(locale),
      ...COMMUNITY_POPULATE,
    }),
  );

  if (fromCms && fromCms.data.length > 0) {
    return transformCommunity(fromCms.data[0], locale);
  }

  return communityFromFixture(slug, locale);
}
