import { getRelativeLocaleUrl } from "astro:i18n";

/**
 * Centralized navigation helper to manage URLs across the site.
 * This prepares the app for CMS integration where slugs might be dynamic.
 */
export const navigation = {
  /**
   * Returns the localized home URL.
   */
  home: (locale: string = "es") => getRelativeLocaleUrl(locale, ""),

  /**
   * Returns the localized URL for the experiences page.
   */
  experiences: (locale: string = "es") => getRelativeLocaleUrl(locale, "experiencias"),

  /**
   * Returns the localized URL for the sites directory.
   */
  sites: (locale: string = "es") => getRelativeLocaleUrl(locale, "sitios"),

  /**
   * Returns the localized URL for a specific site detail.
   */
  siteDetail: (slug: string, locale: string = "es") => getRelativeLocaleUrl(locale, `sitios/${slug}`),

  /**
   * Returns the localized URL for the about page.
   */
  about: (locale: string = "es") => getRelativeLocaleUrl(locale, "acerca"),

  /**
   * Returns the localized URL for legal pages.
   * This is ready for dynamic legal slugs from Strapi.
   */
  legal: (slug: string = "privacy-notice", locale: string = "es") => getRelativeLocaleUrl(locale, `legal/${slug}`),

  /**
   * Helper to handle anchor links that work both on home and from subpages.
   */
  homeAnchor: (anchor: string, locale: string = "es") => {
    const home = getRelativeLocaleUrl(locale, "");
    // Ensure we don't end up with // if home is /
    const base = home.endsWith("/") ? home.slice(0, -1) : home;
    return `${base}#${anchor.replace(/^#/, "")}`;
  }
};
