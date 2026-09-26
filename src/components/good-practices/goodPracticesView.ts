/**
 * Adapters from the single-locale `GoodPracticesPage` to the props of the
 * reused guide components. Those components pick `data.x[lang]` from a
 * `{ 'es-MX', en }` pair; the page is already resolved for one locale, so
 * both keys carry the same value. Each adapter returns null when its
 * section has nothing to show, and the page skips it.
 */
import type { GoodPracticesPage } from "@/types/good-practices.type";

/** Public CONANP protected-areas site, used when the CMS has no URL. */
export const CONANP_FALLBACK_URL = "https://descubreanp.conanp.gob.mx/";

type Localized<T> = { "es-MX": T; en: T };

export function sameInBothLocales<T>(value: T): Localized<T> {
  return { "es-MX": value, en: value };
}

const hasText = (value?: string | null): value is string => Boolean(value?.trim());

function protectedLinkHref(page: GoodPracticesPage): string {
  return page.protectedArea?.linkHref?.trim() || page.conanpUrl?.trim() || CONANP_FALLBACK_URL;
}

export function toProtectedAreaProps(page: GoodPracticesPage, fallbackLabel = "CONANP") {
  const block = page.protectedArea;
  if (!block || !hasText(block.title)) return null;
  return {
    title: sameInBothLocales(block.title),
    text: sameInBothLocales(block.text ?? ""),
    link: {
      label: sameInBothLocales(block.linkLabel?.trim() || fallbackLabel),
      href: protectedLinkHref(page),
    },
  };
}

export function toInfluenceProps(page: GoodPracticesPage) {
  const header = page.influenceHeader;
  if (!header || !hasText(header.title)) return null;
  return {
    title: sameInBothLocales(header.title),
    text: sameInBothLocales(page.influenceText ?? ""),
  };
}

export function toFishingProps(page: GoodPracticesPage) {
  const header = page.fishingHeader;
  if (!header || !hasText(header.title)) return null;
  return {
    title: sameInBothLocales(header.title),
    text: sameInBothLocales(page.fishingText ?? ""),
    rules: sameInBothLocales(page.fishingRules),
  };
}

export function toRecommendationsProps(page: GoodPracticesPage) {
  const header = page.recommendationsHeader;
  if (!header || !hasText(header.title) || page.recommendations.length === 0) return null;
  return {
    title: sameInBothLocales(header.title),
    items: sameInBothLocales(page.recommendations),
  };
}

/**
 * CONANP button under the ANP map. Skipped when the protected-area section
 * right above already links to the same URL (the guide fallback does).
 */
export function resolveConanpButtonHref(page: GoodPracticesPage): string | undefined {
  const href = page.conanpUrl?.trim() || CONANP_FALLBACK_URL;
  const protectedHref = page.protectedArea?.title ? protectedLinkHref(page) : undefined;
  return href === protectedHref ? undefined : href;
}

/** For CMS text passed to components that render with `set:html` (HeroPage). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
