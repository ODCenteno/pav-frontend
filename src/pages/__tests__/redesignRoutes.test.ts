import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PAGES = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (route: string) => readFileSync(resolve(PAGES, route), "utf8");

describe("community routes", () => {
  for (const route of ["comunidades/[slug].astro", "en/comunidades/[slug].astro"]) {
    it(`${route} prerenders one page per community from getCommunities`, () => {
      expect(existsSync(resolve(PAGES, route))).toBe(true);
      const source = read(route);
      expect(source).toMatch(/export const prerender = true/);
      expect(source).toMatch(/export async function getStaticPaths/);
      expect(source).toMatch(/getCommunities\(/);
      expect(source).toMatch(/<CommunityPage /);
    });
  }
});

describe("favorites routes", () => {
  for (const route of ["favoritos.astro", "en/favoritos.astro"]) {
    it(`${route} renders the favorites section with every listing and both communities`, () => {
      expect(existsSync(resolve(PAGES, route))).toBe(true);
      const source = read(route);
      expect(source).toMatch(/export const prerender = true/);
      expect(source).toMatch(/getListingsWithFallback\(locale\)/);
      expect(source).toMatch(/getCommunities\(locale\)/);
      expect(source).toMatch(/<FavoritesSection listings=\{listings\} communities=\{communities\}/);
    });
  }
});

describe("sitios routes", () => {
  for (const route of ["sitios.astro", "en/sitios.astro"]) {
    it(`${route} drops the favorites section and uses the contract categories`, () => {
      const source = read(route);
      expect(source).not.toMatch(/FavoritesSection/);
      expect(source).toMatch(/carouselChips\(locale\)/);
      expect(source).toMatch(/carouselCategoryOf\(item\)/);
      expect(source).not.toContain("sitesPage.filters");
    });
  }
});
