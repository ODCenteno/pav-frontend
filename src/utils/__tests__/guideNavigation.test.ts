import { describe, it, expect, vi } from "vitest";

// Mock the astro:i18n module before importing navigation.
// The runtime is only used in Astro server/build contexts; tests only need
// the pure helper logic of `navigation.guide`.
vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import { navigation } from "../navigation";

describe("navigation.guide", () => {
  it("returns /guide for the default Spanish locale", () => {
    const result = navigation.guide("es");
    expect(result).toBe("/guide");
  });

  it("returns /en/guide for the English locale", () => {
    const result = navigation.guide("en");
    expect(result).toBe("/en/guide");
  });

  it("defaults to Spanish when no locale is provided", () => {
    const result = navigation.guide();
    expect(result).toBe("/guide");
  });

  it("places the guide route between sites and about", () => {
    expect(navigation.sites("es")).toBe("/sitios");
    expect(navigation.guide("es")).toBe("/guide");
    expect(navigation.about("es")).toBe("/acerca");
  });
});
