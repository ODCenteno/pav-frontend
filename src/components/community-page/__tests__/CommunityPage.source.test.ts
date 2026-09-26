import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(resolve(__dirname, "..", name), "utf8");

describe("CommunityPage", () => {
  const source = read("CommunityPage.astro");

  it("renders the ten sections in the order of the brief", () => {
    const markers = [
      "<CommunityHero",
      "<CommunityIntro",
      "<ListingCarousel",
      "<GuideHistory",
      "<CommunityDirections",
      "<CommunityTouristMap",
      "<Highlights",
      "<QuickFacts",
      "<CommunityGallery",
      "<CtaSection",
    ];
    const positions = markers.map((m) => source.indexOf(m));
    positions.forEach((p, i) => expect(p, markers[i]).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("applies the community theme to the whole page content", () => {
    expect(source).toMatch(/class="community-page"[^>]*style=\{communityStyle\(community\)\}/);
  });

  it("feeds B's ListingCarousel with only this community's listings", () => {
    expect(source).toMatch(/import ListingCarousel from ["']@\/components\/main\/categories\/ListingCarousel\.astro["']/);
    expect(source).toMatch(/<ListingCarousel[\s\S]*?listings=\{listings\}[\s\S]*?id="community-listings"/);
    expect(source).toMatch(/listingsForCommunity\(/);
  });

  it("reuses the guide history, home highlights, quick facts and CTA components", () => {
    expect(source).toMatch(/import GuideHistory from ["']@\/components\/guide\/GuideHistory\.astro["']/);
    expect(source).toMatch(/import Highlights from ["']@\/components\/main\/highlights\/Highlights\.astro["']/);
    expect(source).toMatch(/import QuickFacts from ["']@\/components\/main\/quickFacts\/QuickFacts\.astro["']/);
    expect(source).toMatch(/import CtaSection from ["']@\/components\/main\/CTA\/CtaSection\.astro["']/);
  });

  it("drops the \"Qué hacer\" slot from quick facts, like the home (PDF: remove that box)", () => {
    expect(source).toMatch(/import \{ homeQuickFacts \} from ["']@\/components\/main\/quickFacts\/homeQuickFacts["']/);
    expect(source).toMatch(/items=\{homeQuickFacts\(community\.quickFacts\)\}/);
  });

  it("hydrates the gallery island only when visible", () => {
    expect(source).toMatch(/<CommunityGallery[\s\S]*?client:visible/);
  });
});

describe("CommunityIntro", () => {
  const source = read("CommunityIntro.astro");

  it("renders the page h1 with the large community badge on its left", () => {
    const badge = source.indexOf("<CommunityBadge");
    const h1 = source.indexOf("<h1");
    expect(badge).toBeGreaterThan(-1);
    expect(h1).toBeGreaterThan(badge);
    expect(source).toMatch(/<CommunityBadge[^>]*size="lg"/);
  });

  it("renders the tagline and the description when present", () => {
    expect(source).toMatch(/community\.tagline\s*&&/);
    expect(source).toMatch(/community\.description\s*&&/);
  });
});

describe("CommunityHero", () => {
  const source = read("CommunityHero.astro");

  it("loads the hero image eagerly with high priority and an alt text", () => {
    expect(source).toMatch(/<img[\s\S]*fetchpriority="high"/);
    expect(source).not.toMatch(/loading="lazy"/);
    expect(source).toContain('t("communityDetail.heroAlt"');
  });
});
