import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

describe("F2 hero", () => {
  let hero: string;
  let css: string;
  beforeAll(() => {
    hero = read("components/main/hero/Hero.astro");
    css = read("components/main/hero/hero.css");
  });

  it("takes the communities as a prop", () => {
    expect(hero).toMatch(/communities:\s*Community\[\]/);
  });

  it("keeps the current title as the page h1 and the description", () => {
    expect(hero).toMatch(/<h1[^>]*class="hero-title"/);
    expect(hero).toContain("{data.description}");
  });

  it("splits desktop into one half per community with name, tagline, color and CTA", () => {
    expect(hero).toMatch(/class="hero-split"/);
    expect(hero).toMatch(/communities\.map/);
    expect(hero).toMatch(/style=\{communityStyle\(community\)\}/);
    expect(hero).toContain("{community.tagline}");
    expect(hero).toMatch(/href=\{communityPath\(community\.slug, locale\)\}/);
    expect(hero).toContain("t(heroCtaKey(community.slug))");
  });

  it("labels every community button with its own explore copy", () => {
    expect(hero).toMatch(/import \{ heroCtaKey \} from "\.\/heroLabels"/);
    expect(hero.match(/t\(heroCtaKey\(community\.slug\)\)/g)).toHaveLength(2);
    expect(hero).not.toContain('t("hero.cta")');
  });

  it("names the community in each CTA for screen readers", () => {
    expect(hero).toMatch(/<span class="sr-only">\s*\{community\.name\}\s*<\/span>/);
  });

  it("adds one button per community with its color and icon on mobile", () => {
    expect(hero).toMatch(/class="hero-community-buttons"/);
    expect(hero).toMatch(/<CommunityBadge\s+community=\{community\}[^/]*decorative/);
  });

  it("shows the split only on desktop and the buttons only on mobile", () => {
    expect(css).toMatch(/\.hero-split\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/@media \(min-width: 968px\)[\s\S]*\.hero-split\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/@media \(min-width: 968px\)[\s\S]*\.hero-community-buttons\s*\{[^}]*display:\s*none/);
  });

  it("keeps the h1 only for assistive tech on desktop, with no visible title block", () => {
    const desktop = css.slice(css.indexOf("@media (min-width: 968px)"));
    expect(desktop).toMatch(/\.hero-title\s*\{[^}]*clip:\s*rect\(0, 0, 0, 0\)/);
    expect(desktop).not.toMatch(/\.hero-content\s*\{[^}]*background/);
  });

  it("centers the label inside each mobile card", () => {
    expect(css).toMatch(/\.hero-community-card\s*\{[^}]*align-items:\s*center/);
  });

  it("turns each mobile option into a photo card with one visible label", () => {
    expect(hero).toMatch(/class="hero-community-card"/);
    expect(hero).toMatch(/class="hero-community-card__label">\{t\(heroCtaKey\(community\.slug\)\)\}/);
    expect(hero).toMatch(/<span class="sr-only">\s*\{community\.name\}\s*<\/span>/);
    expect(hero).not.toContain("hero-community-button__name");
    expect(css).toMatch(/\.hero-community-card\s*\{[^}]*aspect-ratio/);
  });

  it("uses textColor behind white text", () => {
    expect(css).toMatch(/\.hero-community-card__label\s*\{[^}]*background(-color)?:\s*var\(--community-color-text\)/);
  });
});

describe("F2 QuickFacts", () => {
  let qf: string;
  let css: string;
  beforeAll(() => {
    qf = read("components/main/quickFacts/QuickFacts.astro");
    css = read("components/main/quickFacts/quickFacts.css");
  });

  it("drops the images and hardcoded alt texts", () => {
    expect(qf).not.toContain("<img");
    expect(qf).not.toMatch(/alt="/);
    expect(qf).not.toMatch(/images/);
  });

  it("renders every item it receives", () => {
    expect(qf).toMatch(/items\.map/);
  });

  it("accepts an optional community theme", () => {
    expect(qf).toMatch(/theme\?:\s*CommunityRef\s*\|\s*null/);
    expect(qf).toMatch(/theme \? communityStyle\(theme\) : undefined/);
    expect(css).toMatch(/var\(--community-color-text,/);
  });
});

describe("F2 map section", () => {
  let section: string;
  let css: string;
  beforeAll(() => {
    section = read("components/main/mapSection/MapSection.astro");
    css = read("components/main/mapSection/mapSection.css");
  });

  it("shows the region map image on the left with a CMS or i18n alt", () => {
    expect(section).toMatch(/class="map-section__region"/);
    expect(section).toMatch(/alt=\{regionMapImageAlt \|\| t\("map\.regionMapAlt"\)\}/);
  });

  it("feeds the Leaflet map only the community pins", () => {
    expect(section).toMatch(/communityMapMarkers\(communities, locale\)/);
    expect(section).toMatch(/markers=\{pins\}/);
    expect(section).not.toMatch(/listings/);
  });

  it("localizes the eyebrow and the map label", () => {
    expect(section).toContain('t("map.eyebrow")');
    expect(section).not.toContain("Mapa del destino");
    expect(section).toMatch(/locale=\{locale\}/);
  });

  it("adds a legend with each community badge, color and name", () => {
    expect(section).toMatch(/class="map-section__legend"/);
    expect(section).toMatch(/<CommunityBadge\s+community=\{link\.community\}/);
    expect(section).toContain("{link.name}");
    expect(section).toMatch(/style=\{communityStyle\(link\.community\)\}/);
  });

  it("replaces the single map button with one Google Maps button per community", () => {
    expect(section).toMatch(/communityMapLinks\(communities\)/);
    expect(section).not.toContain('data-key="map_btn"');
    expect(section).toMatch(/class="map-section__community-btn"[^>]*href=\{link\.href\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
    expect(section).toMatch(/<span class="sr-only">\s*\{t\("map\.newTab"\)\}\s*<\/span>/);
    expect(css).toMatch(/\.map-section__community-btn\s*\{[^}]*background(-color)?:\s*var\(--community-color-text\)/);
  });

  it("centers the legend in one row with the two buttons in one row below it on desktop", () => {
    const desktop = css.slice(css.indexOf("@media (min-width: 1024px)"));
    expect(desktop).toMatch(/\.map-section__footer\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*center/);
    expect(desktop).toMatch(/\.map-section__legend,\s*\.map-section__actions\s*\{[^}]*flex-direction:\s*row[^}]*flex-wrap:\s*nowrap[^}]*justify-content:\s*center/);
  });

  it("splits into two columns on desktop and drops the invalid :global()", () => {
    expect(css).toMatch(/\.map-section__split\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/grid-template-columns:\s*1fr 1fr/);
    expect(css).not.toContain(":global(");
  });
});

describe("CTA panel", () => {
  let cta: string;
  let css: string;
  beforeAll(() => {
    cta = read("components/main/CTA/CtaSection.astro");
    css = read("components/main/CTA/ctaSection.css");
  });

  it("lays out one, two or three actions with a count modifier", () => {
    expect(cta).toMatch(/cta-panel--count-\$\{items\.length\}/);
    const actions = read("components/main/CTA/CtaActions.astro");
    expect(actions).toMatch(/"cta-panel__action--neutral": !action\.community/);
    expect(css).toMatch(/\.cta-panel__action--neutral\s*\{[^}]*background(-color)?:\s*var\(--white\)/);
  });

  it("takes a title, a description and one or two actions", () => {
    expect(cta).toMatch(/actions:\s*CtaAction\[\]/);
    expect(cta).toMatch(/ctaActionsOf\(actions\)/);
    expect(cta).toContain('data-key="final_cta_title"');
  });

  it("themes community actions with their color and badge", () => {
    const actions = read("components/main/CTA/CtaActions.astro");
    expect(cta).toMatch(/<CtaActions actions=\{items\}/);
    expect(actions).toMatch(/style=\{communityStyle\(action\.community\)\}/);
    expect(actions).toMatch(/<CommunityBadge\s+community=\{action\.community\}/);
    expect(css).toMatch(/\.cta-panel__action\s*\{[^}]*background(-color)?:\s*var\(--community-color-text\)/);
  });
});

describe.each(["pages/index.astro", "pages/en/index.astro"])("F2 %s", (page) => {
  let source: string;
  beforeAll(() => {
    source = read(page);
  });

  it("removes Destinations and Highlights from the home", () => {
    expect(source).not.toMatch(/<Destinations/);
    expect(source).not.toMatch(/<Highlights/);
  });

  it("keeps the featured carousel", () => {
    expect(source).toMatch(/<PopupManager slot="categories" \/>/);
  });

  it("feeds communities to the hero and the map section", () => {
    expect(source).toMatch(/getCommunities\(locale\)/);
    expect(source).toMatch(/<Hero slot="Hero" data=\{homepage\.hero\} communities=\{communities\}/);
    expect(source).toMatch(/<MapSection[^>]*communities=\{communities\}/);
    expect(source).toMatch(/regionMapImage=\{homepage\.regionMapImage\}/);
  });

  it("ends with visit actions for both communities plus favorites, set in code", () => {
    expect(source).toMatch(/<CtaSection[\s\S]*?title=\{homepage\.finalCta\.title\}/);
    expect(source).toMatch(/communityActions\(\s*communities,/);
    expect(source).toMatch(/communityVisitKey\(c\.slug\)/);
    expect(source).toMatch(/favoritesAction\(t\("finalCta\.favoritesBtn"\), navigation\.favorites\(locale\)\)/);
    expect(source).not.toMatch(/finalCta\.buttonLabel|finalCta\.buttonLink/);
  });

  it("drops the QuickFacts images", () => {
    expect(source).toMatch(/<QuickFacts header=\{homepage\.quickFacts\.header\} items=\{homepageFacts\} \/>/);
  });
});

describe("map section region image", () => {
  const css = readFileSync(resolve(SRC, "components/main/mapSection/mapSection.css"), "utf8");

  it("reserves its box on stacked layouts so the lazy image never collapses to 0px", () => {
    expect(css).toMatch(/\.map-section__region\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/);
  });

  it("lets the image stretch to the map height in the two-column layout", () => {
    expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*\.map-section__region\s*\{[^}]*aspect-ratio:\s*auto/);
  });
});
