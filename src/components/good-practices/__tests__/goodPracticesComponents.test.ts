import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, "..");
const PAGES = resolve(__dirname, "../../../pages");
const read = (path: string) => readFileSync(path, "utf8");

describe("CampaignBlock", () => {
  const source = read(resolve(DIR, "CampaignBlock.astro"));

  it("imports its co-located CSS", () => {
    expect(existsSync(resolve(DIR, "campaignBlock.css"))).toBe(true);
    expect(source).toMatch(/import\s+["']\.\/campaignBlock\.css["']/);
  });

  it("takes the contract CampaignBlock type", () => {
    expect(source).toMatch(/import type \{ CampaignBlock[^}]*\} from ["']@\/types\/good-practices\.type["']/);
  });

  it("renders the logo lazily with an alt text, the title and the description", () => {
    expect(source).toMatch(/<img[\s\S]*class="campaign-block__logo"[\s\S]*loading="lazy"/);
    expect(source).toContain('t("goodPractices.campaignLogoAlt"');
    expect(source).toMatch(/<h2[^>]*class="campaign-block__title"/);
    expect(source).toMatch(/class="campaign-block__description"/);
  });

  it("renders an external link button only when a url is set", () => {
    expect(source).toMatch(/\{campaign\.url\s*&&/);
    expect(source).toMatch(/class="[^"]*campaign-block__cta"[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/);
    expect(source).toContain('t("goodPractices.newTab")');
  });
});

describe("MapFigure", () => {
  const source = read(resolve(DIR, "MapFigure.astro"));

  it("reuses the guide's fullscreen ExpandableImage viewer", () => {
    expect(source).toMatch(/import\s+ExpandableImage\s+from\s+["'][^"']*guide\/ExpandableImage["']/);
    expect(source).toMatch(/<ExpandableImage[\s\S]*client:visible/);
  });

  it("renders an optional external link button that opens in a new tab", () => {
    expect(source).toMatch(/\{linkHref\s*&&/);
    expect(source).toMatch(/class="[^"]*map-figure__cta"[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/);
  });
});

describe("VisitorTips", () => {
  const source = read(resolve(DIR, "VisitorTips.astro"));

  it("renders a titled list of tips", () => {
    expect(source).toMatch(/<h2[^>]*class="visitor-tips__title"/);
    expect(source).toMatch(/<ul[^>]*class="visitor-tips__list"/);
    expect(source).toMatch(/\{tips\.map\(/);
  });
});

describe("GoodPracticesPage", () => {
  const source = read(resolve(DIR, "GoodPracticesPage.astro"));

  it("renders the sections in the order of the brief", () => {
    const markers = [
      "<HeroPage",
      "<SectionIntro",
      "<GuideProtectedArea",
      "<GuideInfluenceArea",
      'id="anp-map"',
      "<GuideFishingRefuge",
      'id="refuge-map"',
      "<GuideRecommendations",
      "<VisitorTips",
      "<CampaignBlock",
      "<CtaSection",
    ];
    const positions = markers.map((m) => source.indexOf(m));
    positions.forEach((p, i) => expect(p, markers[i]).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("ends with a CTA panel with one themed action per community", () => {
    expect(source).toMatch(/communities:\s*Community\[\]/);
    expect(source).toMatch(/communityActions\(communities,/);
    expect(source).toMatch(/<CtaSection[\s\S]*?actions=\{ctaActions\}/);
  });

  it("reuses the guide components instead of copying them", () => {
    for (const name of ["GuideProtectedArea", "GuideInfluenceArea", "GuideFishingRefuge", "GuideRecommendations"]) {
      expect(source).toMatch(new RegExp(`import ${name} from ["']@/components/guide/${name}\\.astro["']`));
    }
  });

  it("builds guide props through the tested view helpers", () => {
    for (const fn of [
      "toProtectedAreaProps",
      "toInfluenceProps",
      "toFishingProps",
      "toRecommendationsProps",
      "resolveConanpButtonHref",
    ]) {
      expect(source).toMatch(new RegExp(`${fn}\\(page[,)]`));
    }
  });

  it("takes SEO copy from the goodPractices namespace", () => {
    expect(source).toContain('t("goodPractices.seo.siteTitle")');
    expect(source).toContain('t("goodPractices.seo.siteDescription")');
  });
});

describe("buenas-practicas routes", () => {
  for (const route of ["buenas-practicas.astro", "en/buenas-practicas.astro"]) {
    it(`${route} prerenders the page from getGoodPracticesPage`, () => {
      const path = resolve(PAGES, route);
      expect(existsSync(path)).toBe(true);
      const source = read(path);
      expect(source).toMatch(/export const prerender = true/);
      expect(source).toMatch(/getGoodPracticesPage\(locale\)/);
      expect(source).toMatch(/<GoodPracticesPage page=\{page\} locale=\{locale\}/);
      expect(source).toMatch(/getCommunities\(locale\)/);
      expect(source).toMatch(/communities=\{communities\}/);
    });
  }
});
