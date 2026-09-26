/**
 * Permanent redirects, consumed by `astro.config.mjs` (`redirects`).
 *
 * F10: the experiences page was removed in the redesign; its content lives in
 * the home carousel and the community pages.
 */
export const redirects = {
  "/experiencias": { status: 301, destination: "/" },
  "/en/experiencias": { status: 301, destination: "/en/" },
} as const;
