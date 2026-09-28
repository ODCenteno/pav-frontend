/**
 * Good-practices page CMS fetcher with static fallback (contract §7 / §9).
 *
 * `getGoodPracticesPage` never throws. When the single type is missing or a
 * section comes back empty, the static `src/data/guideData.js` values serve
 * as fallback per section — plus a placeholder campaign block for
 * "Abracemos el Golfo". The `guide-page` content type itself is gone
 * (contract §10), so there is no CMS-backed fallback layer anymore.
 */

import type { GoodPracticesPage, CampaignBlock } from '../../types/good-practices.type';
import {
  transformGoodPracticesPage,
  type GoodPracticesPageAttributes,
} from '../../utils/strapiTransformer';
import {
  heroData,
  fishingData,
  protectedAreaData,
  influenceData,
  recommendationsData,
  directionsData,
  ctaData,
} from '../../data/guideData';
import { navigation } from '../../utils/navigation';
import { safe, strapiGetOne, toStrapiLocale } from './http';

/** Contract §9 populate set for `GET /api/good-practices-page`. */
const GOOD_PRACTICES_POPULATE: Record<string, string> = {
  'populate[0]': 'hero.images',
  'populate[1]': 'intro',
  'populate[2]': 'protectedArea',
  'populate[3]': 'anpMapImage',
  'populate[4]': 'influenceHeader',
  'populate[5]': 'fishingHeader',
  'populate[6]': 'fishingRules',
  'populate[7]': 'fishingRefugeMapImage',
  'populate[8]': 'recommendationsHeader',
  'populate[9]': 'recommendations',
  'populate[10]': 'tipsHeader',
  'populate[11]': 'tips',
  'populate[12]': 'campaign.logo',
  'populate[13]': 'finalCta',
};

type FallbackLocale = 'es-MX' | 'en';

/**
 * Fallback hero copy for the good-practices page (CMS fallback data, per
 * locale). The guide hero describes the destination, not this page, so only
 * its image is reused.
 */
const HERO_FALLBACK: Record<FallbackLocale, { title: string; description: string }> = {
  'es-MX': {
    title: 'Buenas Prácticas y Turismo Sustentable',
    description:
      'Cómo visitar Puerto Agua Verde y Rancho San Cosme cuidando su naturaleza, su mar y a su gente.',
  },
  en: {
    title: 'Good Practices and Sustainable Tourism',
    description:
      'How to visit Puerto Agua Verde and Rancho San Cosme while caring for their nature, their sea and their people.',
  },
};

/** The guide's driving tips are served under a visitor-tips header. */
const TIPS_TITLE_FALLBACK: Record<FallbackLocale, string> = {
  'es-MX': 'Consejos al visitante',
  en: 'Visitor tips',
};

/**
 * Placeholder campaign block for "Abracemos el Golfo" (CMS fallback data).
 * It has no `url` / `linkLabel` until RED provides them, so the block renders
 * without a button.
 */
const CAMPAIGN_PLACEHOLDER: Record<FallbackLocale, CampaignBlock> = {
  'es-MX': {
    title: 'Abracemos el Golfo',
    description: 'Campaña comunitaria para cuidar el Golfo de California. Muy pronto más información.',
  },
  en: {
    title: 'Abracemos el Golfo',
    description: 'A community campaign to care for the Gulf of California. More information coming soon.',
  },
};

/**
 * Build the static-data fallback page for one locale from
 * `src/data/guideData.js` (contract §7 / §9). Used whenever the
 * `good-practices-page` single type is missing or a section comes back
 * empty. The CTA buttons link home.
 */
function buildStaticFallback(locale: string): GoodPracticesPage {
  const l: FallbackLocale = locale.startsWith('en') ? 'en' : 'es-MX';

  const heroCopy = HERO_FALLBACK[l];
  const hero = {
    title: heroCopy.title,
    titleHighlight: '',
    description: heroCopy.description,
    ctaLabel: ctaData.btn[l],
    ctaLink: navigation.home(locale),
    images: [{ url: heroData.image, alt: heroCopy.title }],
  };

  const protectedArea = {
    title: protectedAreaData.title[l],
    text: protectedAreaData.text[l],
    linkLabel: protectedAreaData.link.label[l],
    linkHref: protectedAreaData.link.href,
  };

  const finalCta = {
    title: ctaData.title[l],
    description: ctaData.desc[l],
    buttonLabel: ctaData.btn[l],
    buttonLink: navigation.home(locale),
  };

  return {
    hero,
    // The guide's intro was a ranch/port block, not a section header; there
    // is no honest SectionHeader equivalent, so intro stays null in fallback.
    intro: null,
    protectedArea,
    anpMapImage: undefined,
    conanpUrl: protectedAreaData.link.href,
    influenceHeader: { title: influenceData.title[l], subtitle: '' },
    influenceText: influenceData.text[l],
    fishingHeader: { title: fishingData.title[l], subtitle: '' },
    fishingText: fishingData.text[l],
    fishingRules: fishingData.rules[l],
    fishingRefugeMapImage: undefined,
    recommendationsHeader: { title: recommendationsData.title[l], subtitle: '' },
    recommendations: recommendationsData.items[l],
    tipsHeader: { title: TIPS_TITLE_FALLBACK[l], subtitle: '' },
    tips: directionsData.drivingTips[l],
    campaign: CAMPAIGN_PLACEHOLDER[l],
    finalCta,
  };
}

/**
 * The good-practices page for one locale. Never throws: a missing single
 * type or any empty section falls back to the guide content described
 * above. CMS values always win over the fallback per section.
 */
export async function getGoodPracticesPage(locale: string = 'es-MX'): Promise<GoodPracticesPage> {
  const fromCms = await safe(() =>
    strapiGetOne<GoodPracticesPageAttributes>('/good-practices-page', {
      ...GOOD_PRACTICES_POPULATE,
      locale: toStrapiLocale(locale),
    }),
  );

  if (!fromCms) return buildStaticFallback(locale);

  const cms = transformGoodPracticesPage(fromCms, locale);

  const needsFallback =
    !cms.hero?.title ||
    !cms.protectedArea?.title ||
    !cms.influenceHeader?.title ||
    !cms.fishingHeader?.title ||
    cms.fishingRules.length === 0 ||
    !cms.recommendationsHeader?.title ||
    cms.recommendations.length === 0 ||
    !cms.tipsHeader?.title ||
    cms.tips.length === 0 ||
    !cms.campaign?.title ||
    !cms.finalCta?.title;
  if (!needsFallback) return cms;

  const fb = buildStaticFallback(locale);

  return {
    hero: cms.hero?.title ? cms.hero : fb.hero,
    intro: cms.intro?.title ? cms.intro : fb.intro,
    protectedArea: cms.protectedArea?.title ? cms.protectedArea : fb.protectedArea,
    anpMapImage: cms.anpMapImage,
    conanpUrl: cms.conanpUrl || fb.conanpUrl,
    influenceHeader: cms.influenceHeader?.title ? cms.influenceHeader : fb.influenceHeader,
    influenceText: cms.influenceText || fb.influenceText,
    fishingHeader: cms.fishingHeader?.title ? cms.fishingHeader : fb.fishingHeader,
    fishingText: cms.fishingText || fb.fishingText,
    fishingRules: cms.fishingRules.length ? cms.fishingRules : fb.fishingRules,
    fishingRefugeMapImage: cms.fishingRefugeMapImage,
    recommendationsHeader: cms.recommendationsHeader?.title
      ? cms.recommendationsHeader
      : fb.recommendationsHeader,
    recommendations: cms.recommendations.length ? cms.recommendations : fb.recommendations,
    tipsHeader: cms.tipsHeader?.title ? cms.tipsHeader : fb.tipsHeader,
    tips: cms.tips.length ? cms.tips : fb.tips,
    campaign: cms.campaign?.title ? cms.campaign : fb.campaign,
    finalCta: cms.finalCta?.title ? cms.finalCta : fb.finalCta,
  };
}
