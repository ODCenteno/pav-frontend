/** i18n key of the explore button for each community in the home hero. */
const HERO_CTA_KEYS: Record<string, string> = {
  "puerto-agua-verde": "hero.explorePort",
  "rancho-san-cosme": "hero.exploreRanch",
};

export function heroCtaKey(slug: string): string {
  return HERO_CTA_KEYS[slug] ?? "hero.cta";
}
