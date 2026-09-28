/**
 * Permanent redirects, consumed by `astro.config.mjs` (`redirects`).
 *
 * F10: the experiences page was removed in the redesign; its content lives in
 * the home carousel and the community pages.
 *
 * Contract phase (docs/contracts/redesign-data-contract.md §10/§11): the
 * guide, about and old community pages are removed along with the backend
 * content types that fed them (`guide-page`, `about-page`, `experiences-page`,
 * `team-member`, `organization`). `/sitios` stays — it is now the favorites
 * / listing index built in the FE-release phase, not the deprecated one.
 *
 * No separate trailing-slash entries: `astro.config.mjs` uses the default
 * `trailingSlash: "ignore"`, so a single entry matches a request with or
 * without the trailing slash. A duplicate `"/path/"` entry would collide
 * with `"/path"` as the same normalized static route (Astro logs this as a
 * router warning and errors in later versions).
 */
export const redirects = {
  "/experiencias": { status: 301, destination: "/" },
  "/en/experiencias": { status: 301, destination: "/en/" },
  "/guide": { status: 301, destination: "/buenas-practicas/" },
  "/en/guide": { status: 301, destination: "/en/buenas-practicas/" },
  "/acerca": { status: 301, destination: "/" },
  "/en/acerca": { status: 301, destination: "/en/" },
  "/comunidad": { status: 301, destination: "/" },
  "/en/comunidad": { status: 301, destination: "/en/" },
} as const;
