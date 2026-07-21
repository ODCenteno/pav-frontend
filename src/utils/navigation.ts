import { getRelativeLocaleUrl } from "astro:i18n";

/**
 * Centralized navigation helper to manage URLs across the site.
 * This prepares the app for CMS integration where slugs might be dynamic.
 */
export const navigation = {
  home: (locale: string = "es-MX") => getRelativeLocaleUrl(locale, ""),
  experiences: (locale: string = "es-MX") => getRelativeLocaleUrl(locale, "experiencias"),
  sites: (locale: string = "es-MX") => getRelativeLocaleUrl(locale, "sitios"),
  siteDetail: (slug: string, locale: string = "es-MX") => getRelativeLocaleUrl(locale, `sitios/${slug}`),
  about: (locale: string = "es-MX") => getRelativeLocaleUrl(locale, "acerca"),
  guide: (locale: string = "es-MX") => getRelativeLocaleUrl(locale, "guide"),
  legal: (slug: string = "privacy-notice", locale: string = "es-MX") => getRelativeLocaleUrl(locale, `legal/${slug}`),
  homeAnchor: (anchor: string, locale: string = "es-MX") => {
    const home = getRelativeLocaleUrl(locale, "");
    // Ensure we don't end up with // if home is /
    const base = home.endsWith("/") ? home.slice(0, -1) : home;
    return `${base}#${anchor.replace(/^#/, "")}`;
  },

  /**
   * Returns the URL for the same page in a different locale.
   */
  toggleLocale: (currentPath: string, currentLocale: string, targetLocale: string) => {
    const prefix = `/${currentLocale}/`;
    const relativePath = currentPath.startsWith(prefix) 
      ? currentPath.slice(prefix.length) 
      : (currentPath === `/${currentLocale}` ? "" : currentPath.replace(/^\//, ""));
    
    return getRelativeLocaleUrl(targetLocale, relativePath);
  }
};
