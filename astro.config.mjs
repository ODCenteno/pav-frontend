import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import markdoc from "@astrojs/markdoc";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [react(), partytown(), sitemap(), markdoc()],

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: false },
  },

  adapter: cloudflare(),
});