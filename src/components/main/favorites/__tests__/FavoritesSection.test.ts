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

  it("links the empty state to both community pages", () => {
    expect(source).toMatch(/communities\.map\(/);
    expect(source).toMatch(/navigation\.community\(/);
  });

  it("only treats carousel slides as cards (CardMain's .fav-btn also has data-fav-id)", () => {
    expect(source).toContain('querySelectorAll<HTMLElement>(".carousel-slide[data-fav-id]")');
    expect(source).not.toContain('querySelectorAll<HTMLElement>("[data-fav-id]")');
  });

  it("decides visibility through the tested favoritesView helper and localStorage util", () => {
    expect(source).toMatch(/favoritesViewState\(/);
    expect(source).toMatch(/import \{ getFavorites \} from ["']@\/utils\/favorites["']/);
  });
});
