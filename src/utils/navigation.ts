import { getRelativeLocaleUrl } from "astro:i18n";

// Astro's configured URL locales (must match astro.config.mjs i18n.locales).
// The rest of the app uses Strapi/listing locale codes like "es-MX" / "en";
// translate those to Astro's URL codes before calling getRelativeLocaleUrl.
const STRAPI_LOCALE_TO_URL_LOCALE: Record<string, string> = {
  "es-MX": "es",
  es: "es",
  en: "en",
  "en-US": "en",
};

function toUrlLocale(locale: string): string {
  return STRAPI_LOCALE_TO_URL_LOCALE[locale] ?? locale;
}

/**
 * Centralized navigation helper to manage URLs across the site.
 * This prepares the app for CMS integration where slugs might be dynamic.
 */
export const navigation = {
  home: (locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), ""),
  experiences: (locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), "experiencias"),
  sites: (locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), "sitios"),
  siteDetail: (slug: string, locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), `sitios/${slug}`),
  about: (locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), "acerca"),
  guide: (locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), "guide"),
  legal: (slug: string = "privacy-notice", locale: string = "es-MX") => getRelativeLocaleUrl(toUrlLocale(locale), `legal/${slug}`),
  homeAnchor: (anchor: string, locale: string = "es-MX") => {
    const home = getRelativeLocaleUrl(toUrlLocale(locale), "");
    // Ensure we don't end up with // if home is /
    const base = home.endsWith("/") ? home.slice(0, -1) : home;
    return `${base}#${anchor.replace(/^#/, "")}`;
  },

  /**
   * Returns the URL for the same page in a different locale.
   */
  toggleLocale: (currentPath: string, currentLocale: string, targetLocale: string) => {
    const urlLocale = toUrlLocale(currentLocale);
    const targetUrlLocale = toUrlLocale(targetLocale);
    const prefix = `/${urlLocale}/`;
    const relativePath = currentPath.startsWith(prefix)
      ? currentPath.slice(prefix.length)
      : (currentPath === `/${urlLocale}` ? "" : currentPath.replace(/^\//, ""));

    return getRelativeLocaleUrl(targetUrlLocale, relativePath);
  }
};
