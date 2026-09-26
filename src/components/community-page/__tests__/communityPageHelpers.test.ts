import { describe, expect, it } from "vitest";
import type { Community } from "@/types/community.type";
import type { Listing } from "@/types/listing.type";
import {
  finalCtaFor,
  historyProps,
  listingsForCommunity,
  otherCommunity,
  quickFactsImages,
  sectionHeader,
} from "../communityPage";

// Unit tests for communityPage.ts. The CommunityPage.astro source test lives in
// CommunityPage.source.test.ts: names differing only by case collide on
// case-insensitive disks (macOS), so keep the two files distinct.

function community(overrides: Partial<Community> = {}): Community {
  return {
    id: "1",
    slug: "puerto-agua-verde",
    name: "Puerto Agua Verde",
    color: "#0CA58C",
    textColor: "#08806D",
    order: 1,
    historyMilestones: [],
    highlights: [],
    quickFacts: [],
    gallery: [],
    ...overrides,
  };
}

const listing = (id: string, slug?: string) =>
  ({ id, community: slug ? { slug, name: slug, color: "", textColor: "" } : undefined }) as unknown as Listing;

describe("listingsForCommunity", () => {
  it("keeps only listings linked to the community, in order", () => {
    const all = [listing("1", "puerto-agua-verde"), listing("2", "rancho-san-cosme"), listing("3"), listing("4", "puerto-agua-verde")];
    expect(listingsForCommunity(all, "puerto-agua-verde").map((l) => l.id)).toEqual(["1", "4"]);
  });
});

describe("otherCommunity", () => {
  it("returns the first other community by order", () => {
    const list = [
      community({ slug: "rancho-san-cosme", order: 2 }),
      community({ slug: "puerto-agua-verde", order: 1 }),
    ];
    expect(otherCommunity(list, "puerto-agua-verde")?.slug).toBe("rancho-san-cosme");
    expect(otherCommunity(list, "rancho-san-cosme")?.slug).toBe("puerto-agua-verde");
  });

  it("returns undefined when there is no other community", () => {
    expect(otherCommunity([community()], "puerto-agua-verde")).toBeUndefined();
  });
});

describe("sectionHeader", () => {
  it("prefers the CMS header", () => {
    expect(sectionHeader({ title: "CMS", subtitle: "Sub" }, "Fallback")).toEqual({ title: "CMS", subtitle: "Sub" });
  });

  it("falls back to the given title when the header or its title is empty", () => {
    expect(sectionHeader(undefined, "Fallback")).toEqual({ title: "Fallback", subtitle: "" });
    expect(sectionHeader({ title: " ", subtitle: "Sub" }, "Fallback")).toEqual({ title: "Fallback", subtitle: "Sub" });
  });
});

describe("historyProps", () => {
  it("maps milestones to the GuideHistory locale-pair shape", () => {
    const props = historyProps(
      community({
        historyHeader: { title: "Our story", subtitle: "" },
        historyText: "Founded by fishermen.",
        historyMilestones: [{ year: "1950", text: "First families" }],
      }),
      "History"
    );
    expect(props).toEqual({
      title: { "es-MX": "Our story", en: "Our story" },
      text: { "es-MX": "Founded by fishermen.", en: "Founded by fishermen." },
      milestones: [{ year: "1950", "es-MX": "First families", en: "First families" }],
    });
  });

  it("uses the header subtitle as text and the fallback title when missing", () => {
    const props = historyProps(
      community({ historyHeader: { title: "", subtitle: "Lead" }, historyMilestones: [{ year: "1", text: "x" }] }),
      "History"
    );
    expect(props?.title.en).toBe("History");
    expect(props?.text.en).toBe("Lead");
  });

  it("returns null when there are no milestones and no text", () => {
    expect(historyProps(community(), "History")).toBeNull();
  });
});

describe("finalCtaFor", () => {
  const fallback = { title: "Visit RSC", description: "Ranch", buttonLabel: "Go", buttonLink: "/comunidades/rancho-san-cosme" };

  it("prefers the CMS finalCta", () => {
    const cms = { title: "CMS", description: "", buttonLabel: "B", buttonLink: "/x" };
    expect(finalCtaFor(community({ finalCta: cms }), fallback)).toEqual(cms);
  });

  it("falls back to the link to the other community", () => {
    expect(finalCtaFor(community(), fallback)).toEqual(fallback);
    expect(finalCtaFor(community({ finalCta: { ...fallback, title: " " } }), fallback)).toEqual(fallback);
  });

  it("returns null when there is nothing to link to", () => {
    expect(finalCtaFor(community(), null)).toBeNull();
  });
});

describe("quickFactsImages", () => {
  it("takes the first two gallery photos", () => {
    expect(quickFactsImages(community({ gallery: ["/a", "/b", "/c"], heroImage: "/h" }))).toEqual(["/a", "/b"]);
  });

  it("fills in with the hero image", () => {
    expect(quickFactsImages(community({ gallery: ["/a"], heroImage: "/h" }))).toEqual(["/a", "/h"]);
    expect(quickFactsImages(community())).toEqual([]);
  });
});
