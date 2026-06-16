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
import type { TeamMember, Organization } from '../types/about.type';
import { navigation } from '../utils/navigation';

function localizedFromPair(es: any, en: any) {
  return { es: es || '', en: en || '' };
}

function localizedArray(es: string[] | undefined, en: string[] | undefined) {
  const esArr = es || [];
  const enArr = en || [];
  const len = Math.max(esArr.length, enArr.length);
  const out: { es: string; en: string }[] = [];
  for (let i = 0; i < len; i++) {
    out.push({ es: esArr[i] || '', en: enArr[i] || esArr[i] || '' });
  }
  return out;
}

export function getListingsFallback(): Listing[] {
  return (legacyCategoryData as any[]).map((item) => {
    const tags = localizedArray(item.tags_es, item.tags_en);
    const amenities = localizedArray(item.amenities_es, item.amenities_en);
    const list: Listing = {
      id: item.id,
      slug: item.slug,
      name: localizedFromPair(item.name_es, item.name_en),
      shortDescription: localizedFromPair(item.description_es, item.description_en),
      description: localizedFromPair(item.description_es, item.description_en),
      categoryId: item.categoryId,
      tags,
      amenities,
      schedule: item.schedule
        ? { text: localizedFromPair(item.schedule.text_es, item.schedule.text_en) }
        : undefined,
      recommendations: item.recommendations
        ? {
            bestTimeToVisit: localizedFromPair(item.recommendations.bestTime_es, item.recommendations.bestTime_en),
            whatToBring: localizedArray(item.recommendations.bring_es, item.recommendations.bring_en),
          }
        : undefined,
      contact: item.contact,
      location: item.location && item.location.lat != null && item.location.lng != null
        ? {
            lat: item.location.lat,
            lng: item.location.lng,
            address: localizedFromPair(
              item.location.address_es ?? item.location.name_es ?? item.location.name ?? '',
              item.location.address_en ?? item.location.name_en ?? item.location.name ?? ''
            ),
            name: localizedFromPair(
              item.location.name_es ?? item.location.name ?? '',
              item.location.name_en ?? item.location.name ?? ''
            ),
          }
        : undefined,
      pricing: item.price ? { price: item.price } : undefined,
      media: {
        mainImageUrl: item.image,
        galleryUrls: item.gallery || [],
      },
      image: item.image,
      isFeatured: item.isFeatured,
      category: {
        id: item.categoryId,
        slug: item.categoryId,
        name: localizedFromPair(item.category_name_es, item.category_name_en),
      },
      href: {
        es: navigation.siteDetail(item.slug, 'es'),
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
