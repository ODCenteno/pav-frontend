/**
 * Build-time data guard.
 *
 * Logs a prominent warning if a CMS data fetch returns an empty array,
 * alerting developers to potential Strapi connectivity or configuration
 * issues. Previously threw in PROD mode, but the Astro Cloudflare adapter
 * catches prerender exceptions and silently writes 0-byte HTML files —
 * the exact outcome the guard was meant to prevent. A warning is both
 * safer (no empty pages) and more visible in CI logs.
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
    `[build-guard] ⚠️  ${pageName} (${locale}): CMS returned 0 items. ` +
    `The page will render with fallback/empty data. ` +
    `Check STRAPI_URL, STRAPI_TOKEN, locale configuration, and that ` +
    `listings are published in Strapi.`;

  console.warn(msg);
}
