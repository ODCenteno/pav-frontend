/**
 * Dev fallback adapter.
 *
 * Transforms the legacy flat data files in `src/data/` into the same shape
 * returned by the CMS client. Used when Strapi is unreachable so the site
 * can still be developed and the production build doesn't fail.
 *
 * When Strapi is online, prefer the CMS client (`src/lib/cms.ts`).
 */

import { categoryData as legacyCategoryData } from './categoryData';
import {
  introData as legacyIntroData,
  valuesData as legacyValuesData,
  teamData as legacyTeamData,
  organizationsData as legacyOrgsData,
  communityMessageData as legacyCommunityData,
  collaborationData as legacyCollabData,
} from './aboutData';
import type { Listing } from '../types/listing.type';
import type { CommunityRef, CommunitySlug } from '../types/community.type';
import { getCommunityBySlug } from './communities';
import type { TeamMember, Organization } from '../types/about.type';
import { navigation } from '../utils/navigation';

/**
 * Mock community per seed listing, so offline builds exercise the community
 * badges, theme and carousel. Every seed with a location sits at Puerto Agua
 * Verde, so the Rancho San Cosme picks are the hiking, desert and "San Cosme"
 * seeds, chosen so both communities have featured listings. Dev data only.
 */
const RANCHO_SAN_COSME_SEEDS = new Set(['exp-02', 'acc-02', 'res-02', 'sit-01', 'sit-02', 'sit-03', 'ser-03']);

function seedCommunity(seedId: string, locale: string): CommunityRef | undefined {
  const slug: CommunitySlug = RANCHO_SAN_COSME_SEEDS.has(seedId) ? 'rancho-san-cosme' : 'puerto-agua-verde';
  const fixture = getCommunityBySlug(slug);
  if (!fixture) return undefined;
  return {
    slug,
    name: fixture.name[locale.startsWith('en') ? 'en' : 'es-MX'],
    color: fixture.color,
    textColor: fixture.textColor,
    badgeIcon: fixture.iconPath,
  };
}

function localizedFromPair(es: any, en: any) {
  return { 'es-MX': es || '', en: en || '' };
}

/**
 * Build the locale-specific listings fallback. Since the localization
 * migration, listing components (tags, schedule, amenities, recommendations)
 * carry single-locale plain strings in the view-model, so the bilingual
 * legacy seeds are resolved here for the requested locale.
 */
export function getListingsFallback(locale: string = 'es-MX'): Listing[] {
  const isEn = locale.startsWith('en');
  return (legacyCategoryData as any[]).map((item) => {
    const tags: string[] = (isEn ? item.tags_en : item.tags_es) || [];
    const amenityLabels: string[] = (isEn ? item.amenities_en : item.amenities_es) || [];
    const recommendations = item.recommendations
      ? [
          {
            label: isEn ? 'Best time to visit' : 'Mejor época para visitar',
            description: isEn ? item.recommendations.bestTime_en : item.recommendations.bestTime_es,
          },
          {
            label: isEn ? 'What to bring' : 'Qué llevar',
            description: ((isEn ? item.recommendations.bring_en : item.recommendations.bring_es) || []).join('\n'),
          },
        ]
          .filter((r) => (r.description || '').trim() !== '')
          .map((r) => ({ label: r.label, description: r.description }))
      : undefined;
    const list: Listing = {
      id: item.id,
      slug: item.slug,
      name: localizedFromPair(item.name_es, item.name_en),
      shortDescription: localizedFromPair(item.description_es, item.description_en),
      description: localizedFromPair(item.description_es, item.description_en),
      categoryId: item.categoryId,
      tags,
      amenities: amenityLabels.map((label) => ({ label })),
      schedule: item.schedule
        ? { text: (isEn ? item.schedule.text_en : item.schedule.text_es) || '' }
        : undefined,
      recommendations,
      contact: item.contact
        ? (({ website, ...rest }) => rest)(item.contact)
        : undefined,
      location: item.location && item.location.lat != null && item.location.lng != null
        ? {
            lat: item.location.lat,
            lng: item.location.lng,
          }
        : undefined,
      pricing: item.price ? { price: item.price } : undefined,
      media: {
        mainImageUrl: item.image,
        galleryUrls: item.gallery || [],
      },
      image: item.image,
      isFeatured: item.isFeatured,
      community: seedCommunity(item.id, locale),
      category: {
        id: item.categoryId,
        slug: item.categoryId,
        name: localizedFromPair(item.category_name_es, item.category_name_en),
      },
      href: {
        'es-MX': navigation.siteDetail(item.slug, 'es-MX'),
        en: navigation.siteDetail(item.slug, 'en'),
      },
    };
    return list;
  });
}

export function getTeamFallback(): TeamMember[] {
  return (legacyTeamData as any[]).map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    shortBio: m.shortBio,
    photo: m.photo,
    links: m.links,
    order: m.order,
    isFeatured: m.isFeatured,
  }));
}

export function getOrganizationsFallback(): Organization[] {
  return (legacyOrgsData as any[]).map((o) => ({
    id: o.id,
    name: o.name,
    type: o.type,
    shortDescription: o.shortDescription,
    logo: o.logo,
    links: o.links,
    order: o.order,
    isFeatured: o.isFeatured,
  }));
}

export function getAboutFallback() {
  return {
    introData: legacyIntroData,
    valuesData: legacyValuesData,
    teamData: legacyTeamData,
    organizationsData: legacyOrgsData,
    communityMessageData: legacyCommunityData,
    collaborationData: legacyCollabData,
  };
}
