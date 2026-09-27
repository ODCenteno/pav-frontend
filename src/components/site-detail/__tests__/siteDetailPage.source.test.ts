import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");

describe("site hero logos", () => {
  const hero = read("components/site-detail/SiteHero.astro");
  const css = read("components/site-detail/siteHero.css");

  it("reserves a 120x120 box for each logo (no layout shift)", () => {
    expect(hero).toMatch(/class="site-hero__logo-img"[^>]*width="120"[^>]*height="120"/);
  });

  it("renders the logo 120x120 on mobile with object-fit contain", () => {
    const base = css.slice(css.indexOf(".site-hero__logo-img {"), css.indexOf("}", css.indexOf(".site-hero__logo-img {")));
    expect(base).toMatch(/width:\s*120px/);
    expect(base).toMatch(/height:\s*120px/);
    expect(base).toMatch(/object-fit:\s*contain/);
  });
});

describe.each(["pages/sitios/[slug].astro", "pages/en/sitios/[slug].astro"])("%s CTA", (page) => {
  const source = read(page);

  it("closes with the CTA panel linking the listing's community (or both)", () => {
    expect(source).not.toMatch(/<ExpCTA/);
    expect(source).toMatch(/listingCtaActions\(\s*item\.community,\s*communities,/);
    expect(source).toMatch(/<CtaSection[\s\S]*?actions=\{ctaActions\}/);
    expect(source).toMatch(/getCommunities\(/);
  });
});

describe.each(["pages/sitios.astro", "pages/en/sitios.astro"])("%s CTA", (page) => {
  const source = read(page);

  it("closes with the CTA panel and one action per community", () => {
    expect(source).not.toMatch(/<ExpCTA/);
    expect(source).toMatch(/communityActions\(communities,/);
    expect(source).toMatch(/<CtaSection[\s\S]*?actions=\{/);
  });
});
