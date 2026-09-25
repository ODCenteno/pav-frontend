import { describe, it, expect, vi } from "vitest";

// Mock the astro:i18n module before importing navigation (same stub as
// guideNavigation.test.ts): tests only exercise the pure helper logic.
vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import {
  navigation,
  communityPath,
  goodPracticesPath,
  favoritesPath,
} from "../navigation";

describe("navigation.community", () => {
  it("returns /comunidades/{slug} for the default Spanish locale", () => {
    expect(navigation.community("puerto-agua-verde", "es")).toBe("/comunidades/puerto-agua-verde");
  });

  it("returns /en/comunidades/{slug} for the English locale", () => {
    expect(navigation.community("rancho-san-cosme", "en")).toBe("/en/comunidades/rancho-san-cosme");
  });

  it("accepts the Strapi-style es-MX locale and defaults without args", () => {
    expect(navigation.community("puerto-agua-verde", "es-MX")).toBe("/comunidades/puerto-agua-verde");
    expect(navigation.community("rancho-san-cosme")).toBe("/comunidades/rancho-san-cosme");
  });
});

describe("navigation.goodPractices", () => {
  it("returns /buenas-practicas for Spanish", () => {
    expect(navigation.goodPractices("es")).toBe("/buenas-practicas");
  });

  it("returns /en/buenas-practicas for English", () => {
    expect(navigation.goodPractices("en")).toBe("/en/buenas-practicas");
  });

  it("defaults to Spanish when no locale is provided", () => {
    expect(navigation.goodPractices()).toBe("/buenas-practicas");
  });
});

describe("navigation.favorites", () => {
  it("returns /favoritos for Spanish", () => {
    expect(navigation.favorites("es")).toBe("/favoritos");
  });

  it("returns /en/favoritos for English", () => {
    expect(navigation.favorites("en")).toBe("/en/favoritos");
  });

  it("defaults to Spanish when no locale is provided", () => {
    expect(navigation.favorites()).toBe("/favoritos");
  });
});

describe("standalone route wrappers", () => {
  it("communityPath mirrors navigation.community", () => {
    expect(communityPath("puerto-agua-verde", "es")).toBe(navigation.community("puerto-agua-verde", "es"));
    expect(communityPath("rancho-san-cosme", "en")).toBe(navigation.community("rancho-san-cosme", "en"));
  });

  it("goodPracticesPath mirrors navigation.goodPractices", () => {
    expect(goodPracticesPath("es")).toBe(navigation.goodPractices("es"));
    expect(goodPracticesPath("en")).toBe(navigation.goodPractices("en"));
  });

  it("favoritesPath mirrors navigation.favorites", () => {
    expect(favoritesPath("es")).toBe(navigation.favorites("es"));
    expect(favoritesPath("en")).toBe(navigation.favorites("en"));
  });
});
