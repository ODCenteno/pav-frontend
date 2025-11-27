import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import markdoc from "@astrojs/markdoc";

export default defineConfig({
  integrations: [react(), partytown(), sitemap(), markdoc()],
  i18n: {
    locales: ["es-MX", "en-US"],
    defaultLocale: "es-MX",
  },
});
