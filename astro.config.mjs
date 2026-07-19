import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: 'cloudflare',
    runtime: { mode: 'off' },
  }),
  site: "https://guiacomunidadesloretanas.com/",
  integrations: [react(), sitemap()],

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: false },
  },
});
