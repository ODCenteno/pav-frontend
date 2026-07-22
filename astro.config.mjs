import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

/**
 * Workaround for Astro 7 + @astrojs/cloudflare 14 dev crash:
 * the CF adapter runs Astro's SSR environment in workerd (Miniflare), where
 * `process` is undefined. Astro's JSON logger calls `process.stdout` /
 * `process.stderr` on every log event, which throws ReferenceError and
 * crashes the dev server. The adapter only injects a `globalThis.process`
 * polyfill for the build output, not for the dev runtime.
 *
 * This Vite plugin prepends the same polyfill to every transformed JS
 * module served to the dev runner so Astro code can safely reference
 * `process` (writes become no-ops).
 */
const processPolyfillPlugin = {
  name: "pav-process-polyfill",
  enforce: "pre",
  transform(code, id) {
    if (!/\.(?:js|cjs|mjs|ts|tsx|jsx)$/.test(id)) return null;
    if (id.includes("node_modules/")) return null;
    if (code.includes("globalThis.process")) return null;
    const banner =
      "globalThis.process ??= { stdout: { write() {} }, stderr: { write() {} }, env: {}, versions: {}, platform: 'browser' };\n";
    return { code: banner + code, map: null };
  },
};

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: 'cloudflare',
    runtime: { mode: 'local' },
  }),
  site: "https://guiacomunidadesloretanas.com/",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [processPolyfillPlugin],
    optimizeDeps: {
      exclude: ["astro"],
    },
  },

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: false },
  },
});
