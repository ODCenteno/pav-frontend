/**
 * Build-time data guard.
 *
 * Fails the production build if a CMS data fetch returns an empty array,
 * preventing silent deploys of empty pages. In dev mode, logs a warning
 * instead of throwing (Strapi may not be running locally).
 *
 * Usage in page frontmatter:
 *   assertBuildData(allSites, '/sitios', locale);
 */
export function assertBuildData<T>(
  data: T[],
  pageName: string,
  locale: string,
): void {
  if (data.length > 0) return;

  const msg =
    `[build-guard] ${pageName} (${locale}): CMS returned 0 items. ` +
    `Check STRAPI_URL, STRAPI_TOKEN, locale configuration, and that ` +
    `listings are published in Strapi.`;

  if (import.meta.env.PROD) {
    throw new Error(msg);
  }
  console.warn(msg);
}
