import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { carouselChips, carouselCategoryOf, featuredListings } from "../carousel";
import CategoryFilter from "../CategoryFilter";
import type { Listing } from "@/types/listing.type";
import type { CommunityRef } from "@/types/community.type";

const __dirname = dirname(fileURLToPath(import.meta.url));

function listing(overrides: Partial<Listing>): Listing {
  return { id: "1", slug: "x", name: { "es-MX": "X", en: "X" }, categoryId: "", ...overrides };
}

describe("carouselChips", () => {
  it("returns the 4 contract categories in order", () => {
    expect(carouselChips("es-MX").map((c) => c.id)).toEqual([
      "experiences",
      "gastronomy",
      "services",
      "crafts",
    ]);
  });

  it("labels the chips per locale", () => {
    expect(carouselChips("es-MX")[1].label).toBe("Gastronomía regional");
    expect(carouselChips("en")[1].label).toBe("Regional gastronomy");
    expect(carouselChips("es")[0].label).toBe("Experiencias turísticas comunitarias");
  });
});

describe("carouselCategoryOf", () => {
  it("maps legacy slugs with the contract mapping", () => {
    expect(carouselCategoryOf(listing({ categoryId: "sites" }))).toBe("experiences");
    expect(carouselCategoryOf(listing({ categoryId: "accommodation" }))).toBe("experiences");
    expect(carouselCategoryOf(listing({ categoryId: "restaurants" }))).toBe("gastronomy");
  });

  it("keeps current slugs, preferring the populated category", () => {
    expect(
      carouselCategoryOf(
        listing({ categoryId: "sites", category: { id: "1", slug: "crafts", name: { "es-MX": "", en: "" } } as any }),
      ),
    ).toBe("crafts");
    expect(carouselCategoryOf(listing({ categoryId: "services" }))).toBe("services");
  });

  it("returns '' for unknown or missing categories (shown only under all)", () => {
    expect(carouselCategoryOf(listing({ categoryId: "connectivity" }))).toBe("");
    expect(carouselCategoryOf(listing({}))).toBe("");
  });
});

describe("featuredListings", () => {
  it("keeps featured listings from every community, in order", () => {
    const pav: CommunityRef = { slug: "puerto-agua-verde", name: "PAV", color: "", textColor: "" };
    const rsc: CommunityRef = { slug: "rancho-san-cosme", name: "RSC", color: "", textColor: "" };
    const out = featuredListings([
      listing({ id: "a", isFeatured: true, community: pav }),
      listing({ id: "b", isFeatured: false, community: pav }),
      listing({ id: "c", isFeatured: true, community: rsc }),
      listing({ id: "d", isFeatured: true }),
    ]);
    expect(out.map((l) => l.id)).toEqual(["a", "c", "d"]);
  });
});

describe("CategoryFilter chips", () => {
  const html = renderToStaticMarkup(
    <CategoryFilter
      locale="en"
      categories={carouselChips("en")}
      translations={{ all: "All", noResults: "None" }}
      containerSelector="#c"
      categoryAttribute="data-carousel-category"
    />,
  );

  it("renders 'all' first, then the contract chips in order", () => {
    const labels = [...html.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map((m) => m[1]);
    expect(labels).toEqual([
      "All",
      "Community tourism experiences",
      "Regional gastronomy",
      "Services",
      "Crafts and local products",
    ]);
  });

  it("exposes the chips as a labelled group of toggle buttons", () => {
    expect(html).toContain('role="group"');
    expect(html).not.toContain('role="tablist"');
    expect(html).toContain('aria-pressed="true"');
  });
});

describe("ListingCarousel.astro (reusable)", () => {
  let source: string;
  beforeAll(() => {
    source = readFileSync(resolve(__dirname, "../ListingCarousel.astro"), "utf8");
  });

  it("takes listings, title and locale props", () => {
    expect(source).toMatch(/interface\s+Props/);
    expect(source).toMatch(/listings:\s*Listing\[\]/);
    expect(source).toMatch(/title:\s*string/);
    expect(source).toMatch(/locale:\s*string/);
  });

  it("scopes the container id per instance", () => {
    expect(source).toMatch(/containerSelector=\{`#\$\{containerId\}`\}/);
  });

  it("filters on the mapped category attribute, not the raw card slug", () => {
    expect(source).toMatch(/data-carousel-category=\{carouselCategoryOf\(item\)\}/);
    expect(source).toMatch(/categoryAttribute="data-carousel-category"/);
    expect(source).toMatch(/categories=\{carouselChips\(locale\)\}/);
  });
});

describe("home carousel (categories.astro)", () => {
  it("renders the featured listings through ListingCarousel", () => {
    const source = readFileSync(resolve(__dirname, "../categories.astro"), "utf8");
    expect(source).toMatch(/featuredListings\(/);
    expect(source).toMatch(/<ListingCarousel[\s\S]*listings=\{listings\}/);
  });
});

import SitesExplorer from "../SitesExplorer";

describe("SitesExplorer chips", () => {
  const html = renderToStaticMarkup(
    <SitesExplorer
      locale="es-MX"
      categories={carouselChips("es-MX")}
      translations={{ all: "Todo", noResults: "Nada", searchPlaceholder: "Buscar" }}
    />,
  );

  it("exposes the chips as a labelled group, not a tablist", () => {
    expect(html).toMatch(/<div class="filter-chips" role="group" aria-label="[^"]+"/);
    expect(html).not.toContain('role="tablist"');
  });

  it("marks exactly the active chip with aria-pressed", () => {
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(4);
  });
});
