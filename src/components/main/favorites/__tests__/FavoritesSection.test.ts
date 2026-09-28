import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, "../FavoritesSection.astro"), "utf8");

describe("FavoritesSection", () => {
  it("uses the 4 contract categories plus 'all' as chips", () => {
    expect(source).toMatch(/carouselChips\(locale\)/);
    expect(source).toContain('t("categories.all")');
    expect(source).not.toContain("sitesPage.filters");
  });

  it("files each card under its current contract category", () => {
    expect(source).toMatch(/data-category=\{carouselCategoryOf\(item\)\}/);
  });

  it("exposes the chip state to assistive technology", () => {
    expect(source).toMatch(/aria-pressed=/);
    expect(source).toMatch(/role="group"/);
  });

  it("renders cards with B's CardMain in the home carousel layout", () => {
    expect(source).toMatch(/import CardMain from ["']@\/components\/cards\/CardMain\.astro["']/);
    expect(source).toMatch(/class="carousel-container/);
    expect(source).toMatch(/class="carousel-slide/);
  });

  it("leaves the community actions to the page's CTA section", () => {
    expect(source).not.toContain("<CtaActions");
    expect(source).not.toContain("favorites-communities");
    expect(source).not.toContain("favorites-empty__link");
  });

  for (const page of ["favoritos.astro", "en/favoritos.astro"]) {
    it(`${page} closes with the CTA section and both community actions`, () => {
      const pageSource = readFileSync(resolve(__dirname, "../../../../pages", page), "utf8");
      const favorites = pageSource.indexOf("<FavoritesSection");
      const cta = pageSource.indexOf("<CtaSection");
      expect(cta).toBeGreaterThan(favorites);
      expect(pageSource).toMatch(/title=\{t\("favoritesPage\.cta\.title"\)\}/);
      expect(pageSource).toMatch(/description=\{t\("favoritesPage\.cta\.description"\)\}/);
      expect(pageSource).toMatch(/communityActions\(communities, \(slug\) => navigation\.community\(slug, locale\)\)/);
    });
  }

  it("only treats carousel slides as cards (CardMain's .fav-btn also has data-fav-id)", () => {
    expect(source).toContain('querySelectorAll<HTMLElement>(".carousel-slide[data-fav-id]")');
    expect(source).not.toContain('querySelectorAll<HTMLElement>("[data-fav-id]")');
  });

  it("decides visibility through the tested favoritesView helper and localStorage util", () => {
    expect(source).toMatch(/favoritesViewState\(/);
    expect(source).toMatch(/import \{ getFavorites \} from ["']@\/utils\/favorites["']/);
  });
});
