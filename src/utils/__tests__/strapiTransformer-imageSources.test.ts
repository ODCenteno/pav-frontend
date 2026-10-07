import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import {
  transformCommunity,
  transformCommunityMember,
  transformListing,
  type CommunityAttributes,
  type CommunityMemberAttributes,
  type ListingAttributes,
  type StrapiItem,
} from "../strapiTransformer";

const R2 = "https://pub-example.r2.dev";

/** Strapi v5 flat media with `small` and `medium` formats. */
function media(name: string) {
  return {
    id: 1,
    url: `${R2}/${name}.jpg`,
    width: 2000,
    height: 1000,
    formats: {
      small: { url: `${R2}/small_${name}.jpg`, width: 500, height: 250 },
      medium: { url: `${R2}/medium_${name}.jpg`, width: 750, height: 375 },
    },
  };
}

const srcsetOf = (name: string) =>
  `${R2}/small_${name}.jpg 500w, ${R2}/medium_${name}.jpg 750w, ${R2}/${name}.jpg 2000w`;

describe("transformListing: imageSources", () => {
  it("maps main, gallery and story images to their responsive sources, keyed by URL", () => {
    const item: StrapiItem<ListingAttributes> = {
      id: 1,
      attributes: {
        slug: "museo",
        title: "Museo",
        mainImage: media("main"),
        gallery: [media("g1"), media("g2")],
        stories: [{ title: "S", narrative: "N", image: media("story") }],
      } as unknown as ListingAttributes,
    };
    const out = transformListing(item);

    expect(out.media?.mainImageUrl).toBe(`${R2}/main.jpg`);
    expect(out.imageSources?.[`${R2}/main.jpg`]).toEqual({
      src: `${R2}/medium_main.jpg`,
      srcset: srcsetOf("main"),
      width: 2000,
      height: 1000,
    });
    expect(out.imageSources?.[`${R2}/g2.jpg`]?.srcset).toBe(srcsetOf("g2"));
    expect(out.imageSources?.[`${R2}/story.jpg`]?.srcset).toBe(srcsetOf("story"));
  });

  it("leaves imageSources undefined when no media has formats", () => {
    const out = transformListing({
      id: 1,
      attributes: { slug: "x", title: "X", mainImage: { url: "/uploads/x.jpg" } } as unknown as ListingAttributes,
    });
    expect(out.imageSources).toBeUndefined();
  });
});

describe("transformCommunityMember: imageSources", () => {
  it("maps the photo and gallery", () => {
    const out = transformCommunityMember({
      id: 3,
      attributes: { slug: "ana", name: "Ana", photo: media("ana"), gallery: [media("ana-g")] } as unknown as CommunityMemberAttributes,
    });
    expect(out.imageSources?.[`${R2}/ana.jpg`]?.src).toBe(`${R2}/medium_ana.jpg`);
    expect(out.imageSources?.[`${R2}/ana-g.jpg`]?.srcset).toBe(srcsetOf("ana-g"));
  });
});

describe("transformCommunity: imageSources", () => {
  it("maps a CMS hero, the gallery and highlight images", () => {
    const out = transformCommunity({
      id: 42,
      attributes: {
        slug: "puerto-agua-verde",
        heroImage: media("hero"),
        gallery: [media("c1")],
        highlights: [{ title: "T", description: "D", image: media("hl") }],
      } as unknown as CommunityAttributes,
    });
    expect(out.heroImage).toBe(`${R2}/hero.jpg`);
    expect(out.imageSources?.[`${R2}/hero.jpg`]?.srcset).toBe(srcsetOf("hero"));
    expect(out.imageSources?.[`${R2}/c1.jpg`]?.srcset).toBe(srcsetOf("c1"));
    expect(out.imageSources?.[`${R2}/hl.jpg`]?.srcset).toBe(srcsetOf("hl"));
  });

  it("has no sources for the bundled hero fallback", () => {
    const out = transformCommunity({ id: 42, attributes: { slug: "puerto-agua-verde" } as CommunityAttributes });
    expect(out.heroImage).toBe("/images/PAV-Letrero-.webp");
    expect(out.imageSources).toBeUndefined();
  });
});
