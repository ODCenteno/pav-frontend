import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  communityStyle,
  communityBadgeIcon,
  SITE_PRIMARY_COLOR,
  SITE_PRIMARY_TEXT_COLOR,
} from "../communityTheme";
import { communities } from "../../data/communities";
import { contrastRatio } from "../contrast";
import type { CommunityRef } from "../../types/community.type";

const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

function refOf(slug: string, overrides: Partial<CommunityRef> = {}): CommunityRef {
  const fixture = communities.find((c) => c.slug === slug)!;
  return {
    slug: fixture.slug,
    name: fixture.name["es-MX"],
    color: fixture.color,
    textColor: fixture.textColor,
    ...overrides,
  };
}

describe("communityStyle", () => {
  it("returns the community color custom properties", () => {
    expect(communityStyle(refOf("puerto-agua-verde"))).toEqual({
      "--community-color": "#0CA58C",
      "--community-color-text": "#08806D",
    });
    expect(communityStyle(refOf("rancho-san-cosme"))).toEqual({
      "--community-color": "#EC6E0B",
      "--community-color-text": "#B85206",
    });
  });

  it("falls back to the site primary colors without a community", () => {
    expect(communityStyle(null)).toEqual({
      "--community-color": SITE_PRIMARY_COLOR,
      "--community-color-text": SITE_PRIMARY_TEXT_COLOR,
    });
    expect(communityStyle(undefined)).toEqual(communityStyle(null));
  });

  it("falls back to the site primary colors when the ref carries empty colors", () => {
    const empty = refOf("puerto-agua-verde", { color: "", textColor: "" });
    expect(communityStyle(empty)).toEqual({
      "--community-color": SITE_PRIMARY_COLOR,
      "--community-color-text": SITE_PRIMARY_TEXT_COLOR,
    });
  });

  it("meets WCAG thresholds on white for both communities (contract §2)", () => {
    for (const c of communities) {
      const style = communityStyle(refOf(c.slug));
      expect(contrastRatio(style["--community-color"], "#FFFFFF")).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(style["--community-color-text"], "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("meets WCAG thresholds on white for the no-community defaults", () => {
    // #5A8A80 is the site primary (--color-primary in globals.css): ~3.9:1,
    // valid for large surfaces but NOT for small text, so the default text
    // color must be the darker emerald that clears 4.5:1.
    expect(contrastRatio(SITE_PRIMARY_COLOR, "#FFFFFF")).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(SITE_PRIMARY_TEXT_COLOR, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(SITE_PRIMARY_TEXT_COLOR).not.toBe(SITE_PRIMARY_COLOR);
  });
});

describe("communityBadgeIcon", () => {
  it("prefers the CMS badge icon", () => {
    const ref = refOf("puerto-agua-verde", { badgeIcon: "http://localhost:1337/uploads/badge.png" });
    expect(communityBadgeIcon(ref)).toBe("http://localhost:1337/uploads/badge.png");
  });

  it("falls back to the bundled icon per slug", () => {
    expect(communityBadgeIcon(refOf("puerto-agua-verde"))).toBe("/images/communities/fish.webp");
    expect(communityBadgeIcon(refOf("rancho-san-cosme"))).toBe("/images/communities/donkey.webp");
  });

  it("bundled fallback icons exist on disk", () => {
    for (const c of communities) {
      expect(existsSync(`${PUBLIC_DIR}${c.iconPath}`)).toBe(true);
    }
  });

  it("returns an empty string without a community or for an unknown slug", () => {
    expect(communityBadgeIcon(null)).toBe("");
    expect(communityBadgeIcon(undefined)).toBe("");
    expect(communityBadgeIcon(refOf("puerto-agua-verde", { slug: "loreto" as CommunityRef["slug"] }))).toBe("");
  });
});
