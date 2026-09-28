import { describe, it, expect, vi } from "vitest";

// The transformer transitively imports `navigation`, which uses `astro:i18n`.
// Vitest can't resolve that virtual module — mock it before importing.
vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import {
  transformCommunityMember,
  transformCommunityMemberSummary,
  transformStory,
  transformProduct,
  transformListing,
  transformHomepage,
  transformCategory,
  transformSiteContent,
} from "../strapiTransformer";

// ─────────────────────────────────────────────────────────────────────
// transformCommunityMember — previously untested (largest coverage gap)
// ─────────────────────────────────────────────────────────────────────
describe("transformCommunityMember", () => {
  it("transforms a full member with listings, relatedMembers, and social", () => {
    const item = {
      id: 1,
      documentId: "doc-member",
      attributes: {
        name: "Paquita",
        slug: "paquita",
        role: { "es-MX": "Guía", en: "Guide" },
        bio: { "es-MX": "Bio ES", en: "Bio EN" },
        pullQuote: { "es-MX": "Cita ES", en: "Quote EN" },
        legacyNote: { "es-MX": "Legado ES", en: "Legacy EN" },
        photo: { id: 1, url: "/uploads/paquita.jpg" },
        gallery: [{ id: 2, url: "/uploads/g1.jpg" }],
        contact: { instagram: "@paquita" },
        isFeatured: true,
        order: 3,
        listings: {
          data: [
            { id: 10, attributes: { slug: "tour-a", title: "Tour A" } },
            // no id, no slug → falls back to documentId
            { documentId: "doc-b", title: "No slug" },
          ],
        },
        relatedMembers: {
          data: [
            {
              id: 20,
              documentId: "doc-rel",
              attributes: {
                name: "Ana",
                slug: "ana",
                legacyNote: { "es-MX": "Nota", en: "Note" },
              },
            },
          ],
        },
      },
    };

    const out = transformCommunityMember(item as any, "es-MX");
    expect(out.id).toBe("1");
    expect(out.slug).toBe("paquita");
    expect(out.name).toBe("Paquita");
    expect(out.role).toBe("Guía");
    expect(out.bio).toBe("Bio ES");
    expect(out.pullQuote).toBe("Cita ES");
    expect(out.legacyNote).toBe("Legado ES");
    expect(out.photo).toContain("/uploads/paquita.jpg");
    expect(out.galleryUrls).toHaveLength(1);
    expect(out.isFeatured).toBe(true);
    expect(out.order).toBe(3);
    // listings: first resolves slug, second falls back to documentId
    expect(out.listingSlugs).toEqual(["tour-a", "doc-b"]);
    // relatedMembers
    expect(out.relatedMembers).toHaveLength(1);
    expect(out.relatedMembers[0].id).toBe("20");
    expect(out.relatedMembers[0].name).toBe("Ana");
    expect(out.relatedMembers[0].slug).toBe("ana");
    expect(out.relatedMembers[0].legacyNote).toBe("Nota");
    // social derived from contact
    expect(out.social.length).toBeGreaterThan(0);
  });

  it("selects EN role/bio when locale is en", () => {
    const item = {
      id: 2,
      attributes: {
        name: "Paquita",
        slug: "paquita",
        role: { "es-MX": "Guía", en: "Guide" },
        bio: { "es-MX": "Bio ES", en: "Bio EN" },
      },
    };
    const out = transformCommunityMember(item as any, "en");
    // role goes through pickLocalized (locale-aware)…
    expect(out.role).toBe("Guide");
    // …but bio goes through asString, which always extracts the es-MX slot of
    // a LocalizedString object. This asymmetry is the current behavior.
    expect(out.bio).toBe("Bio ES");
  });

  it("falls back to esItem values when the localized item is empty", () => {
    const item = {
      id: 3,
      attributes: { name: "X", slug: "x", role: "", bio: "" },
    };
    const esItem = {
      id: 3,
      attributes: { name: "X", slug: "x", role: "Rol ES", bio: "Bio ES" },
    };
    const out = transformCommunityMember(item as any, "en", esItem as any);
    expect(out.role).toBe("Rol ES");
    expect(out.bio).toBe("Bio ES");
  });

  it("handles a member with no listings/relatedMembers/gallery", () => {
    const item = {
      id: 4,
      attributes: { name: "Solo", slug: "solo" },
    };
    const out = transformCommunityMember(item as any, "es-MX");
    expect(out.listingSlugs).toEqual([]);
    expect(out.relatedMembers).toEqual([]);
    expect(out.galleryUrls).toEqual([]);
    expect(out.photo).toBeUndefined();
    expect(out.social).toEqual([]);
  });
});

describe("transformCommunityMemberSummary", () => {
  it("maps a flat (attributes-less) member and falls back id to slug", () => {
    const item = {
      name: "Ana",
      slug: "ana",
      role: "Guía",
      bio: "Bio",
      pullQuote: "Cita",
      legacyNote: "Legado",
      photo: { url: "/uploads/ana.jpg" },
    };
    const out = transformCommunityMemberSummary(item as any, "es-MX");
    expect(out.id).toBe("ana"); // no id/documentId → slug
    expect(out.name).toBe("Ana");
    expect(out.role).toBe("Guía");
    expect(out.bio).toBe("Bio");
    expect(out.pullQuote).toBe("Cita");
    expect(out.legacyNote).toBe("Legado");
    expect(out.photo).toContain("/uploads/ana.jpg");
  });
});

// ─────────────────────────────────────────────────────────────────────
// transformStory / transformProduct — esRaw fallback + localized objects
// ─────────────────────────────────────────────────────────────────────
describe("transformStory", () => {
  it("picks localized object fields by locale and falls back to esRaw", () => {
    const raw = {
      title: { "es-MX": "Título ES", en: "Title EN" },
      narrative: "Narrativa ES",
      highlightQuote: { "es-MX": "Cita", en: "Quote" },
      era: "2020",
      theme: "craft",
      storyteller: "Paquita",
      image: { url: "/uploads/story.jpg" },
      gallery: [{ url: "/uploads/s1.jpg" }],
    };
    const en = transformStory(raw as any, "en");
    expect(en.title).toBe("Title EN");
    expect(en.highlightQuote).toBe("Quote");
    expect(en.narrative).toBe("Narrativa ES");
    expect(en.era).toBe("2020");
    expect(en.theme).toBe("craft");
    expect(en.imageUrl).toContain("/uploads/story.jpg");
    expect(en.galleryUrls).toHaveLength(1);
  });

  it("falls back to esRaw narrative/title when current is empty", () => {
    const raw = { title: "", narrative: "" };
    const esRaw = { title: "Título fallback", narrative: "Narrativa fallback" };
    const out = transformStory(raw as any, "en", esRaw as any);
    expect(out.title).toBe("Título fallback");
    expect(out.narrative).toBe("Narrativa fallback");
    expect(out.highlightQuote).toBeUndefined();
    expect(out.era).toBeUndefined();
  });

  it("converts a richtext blocks narrative to plain text", () => {
    const raw = {
      title: "T",
      narrative: [
        { type: "paragraph", children: [{ type: "text", text: "Line one" }] },
        { type: "paragraph", children: [{ type: "text", text: "Line two" }] },
      ],
    };
    const out = transformStory(raw as any, "es-MX");
    expect(out.narrative).toContain("Line one");
    expect(out.narrative).toContain("Line two");
  });
});

describe("transformProduct", () => {
  it("picks localized name/description and falls back to esRaw", () => {
    const raw = {
      name: { "es-MX": "Nombre", en: "Name" },
      description: "",
    };
    const esRaw = { description: "Descripción ES" };
    const en = transformProduct(raw as any, "en", esRaw as any);
    expect(en.name).toBe("Name");
    expect(en.description).toBe("Descripción ES");
  });

  it("returns undefined description when both are empty", () => {
    const out = transformProduct({ name: "N" } as any, "es-MX");
    expect(out.name).toBe("N");
    expect(out.description).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Media helpers (via transformListing) — Strapi `data` shapes
// ─────────────────────────────────────────────────────────────────────
describe("transformListing — media data shapes", () => {
  it("reads mainImage from { data: [{ attributes: { url } }] }", () => {
    const item = {
      id: 1,
      attributes: {
        title: "T",
        slug: "t",
        mainImage: { data: [{ id: 1, attributes: { url: "/uploads/a.jpg", alternativeText: "Alt" } }] },
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.image).toContain("/uploads/a.jpg");
  });

  it("reads mainImage from { data: { attributes: { url } } }", () => {
    const item = {
      id: 2,
      attributes: {
        title: "T",
        slug: "t",
        mainImage: { data: { id: 1, attributes: { url: "/uploads/b.jpg" } } },
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.image).toContain("/uploads/b.jpg");
  });

  it("treats a single flat gallery object as a one-element list", () => {
    const item = {
      id: 3,
      attributes: {
        title: "T",
        slug: "t",
        gallery: { id: 1, url: "/uploads/single.jpg" },
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.media?.galleryUrls).toHaveLength(1);
    expect(out.media?.galleryUrls?.[0]).toContain("/uploads/single.jpg");
  });

  it("returns undefined media and empty relations for a non-array relation object", () => {
    const item = {
      id: 4,
      attributes: {
        title: "T",
        slug: "t",
        members: { notData: true }, // object without `data` → relationArray undefined
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.members).toBeUndefined();
    expect(out.media).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// normalizeLocation — attributes wrapper, flat coords, NaN guard
// ─────────────────────────────────────────────────────────────────────
describe("transformListing — location normalization", () => {
  it("unwraps a location nested in attributes", () => {
    const item = {
      id: 1,
      attributes: {
        title: "T",
        slug: "t",
        location: { attributes: { geoPoint: { lat: 25.5, lng: -111.0 } } },
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.location?.lat).toBe(25.5);
    expect(out.location?.lng).toBe(-111.0);
  });

  it("reads flat lat/lng when no geoPoint is present", () => {
    const item = {
      id: 2,
      attributes: { title: "T", slug: "t", location: { lat: 1.5, lng: 2.5 } },
    };
    const out = transformListing(item as any, "es");
    expect(out.location?.lat).toBe(1.5);
    expect(out.location?.lng).toBe(2.5);
  });

  it("returns undefined location when coords are not numeric", () => {
    const item = {
      id: 3,
      attributes: { title: "T", slug: "t", location: { geoPoint: { lat: "abc", lng: "xyz" } } },
    };
    const out = transformListing(item as any, "es");
    expect(out.location).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// asString — LocalizedString object + mixed array
// ─────────────────────────────────────────────────────────────────────
describe("transformListing — description as LocalizedString object", () => {
  it("extracts the es-MX value from a LocalizedString object", () => {
    const item = {
      id: 1,
      attributes: {
        title: "T",
        slug: "t",
        description: { "es-MX": "Hola mundo", en: "Hello world" },
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.description?.["es-MX"]).toBe("Hola mundo");
  });

  it("handles a mixed array of strings and richtext blocks", () => {
    const item = {
      id: 2,
      attributes: {
        title: "T",
        slug: "t",
        description: [
          "Plain string line",
          { type: "paragraph", children: [{ type: "text", text: "Block text" }] },
        ],
      },
    };
    const out = transformListing(item as any, "es");
    expect(out.description?.["es-MX"]).toContain("Plain string line");
    expect(out.description?.["es-MX"]).toContain("Block text");
  });
});

// ─────────────────────────────────────────────────────────────────────
// transformHomepage — centerPoint + non-array hero images + id fallbacks
// ─────────────────────────────────────────────────────────────────────
describe("transformHomepage — centerPoint + hero images data shape", () => {
  it("extracts mapSection.centerPoint geoPoint and hero images from { data: [...] }", () => {
    const item: any = {
      id: 1,
      attributes: {
        hero: {
          title: "H",
          ctaLabel: "Go",
          ctaLink: "/",
          images: { data: [{ id: 1, url: "/uploads/hero.jpg", alternativeText: "Hero" }] },
        },
        mapSection: {
          title: "Map",
          centerPoint: { geoPoint: { lat: 25.7, lng: -111.2 } },
          zoom: 12,
        },
      },
    };
    const out = transformHomepage(item as any, "es");
    expect(out.hero.images).toHaveLength(1);
    expect(out.hero.images[0].url).toContain("/uploads/hero.jpg");
    expect(out.mapSection.centerPoint).toEqual({ lat: 25.7, lng: -111.2 });
    expect(out.mapSection.zoom).toBe(12);
  });

  it("returns undefined centerPoint when geoPoint coords are missing", () => {
    const item: any = {
      id: 2,
      attributes: { mapSection: { title: "Map", centerPoint: {} } },
    };
    const out = transformHomepage(item as any, "es");
    expect(out.mapSection.centerPoint).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// id fallbacks — documentId / slug / name when numeric id is absent
// ─────────────────────────────────────────────────────────────────────
describe("id fallback chains", () => {
  it("category falls back to documentId then slug", () => {
    const byDocId = transformCategory({ documentId: "doc-cat", attributes: { name: "C", slug: "c" } } as any);
    expect(byDocId.id).toBe("doc-cat");
    const bySlug = transformCategory({ attributes: { name: "C", slug: "c-slug" } } as any);
    expect(bySlug.id).toBe("c-slug");
  });

  it("site content falls back to key when no id/documentId", () => {
    const out = transformSiteContent({ attributes: { key: "my-key", title: "T", text: "X" } } as any);
    expect(out.id).toBe("my-key");
  });
});

// ─────────────────────────────────────────────────────────────────────
// transformListing — full member view-model (gallery, social)
// ─────────────────────────────────────────────────────────────────────
describe("transformListing — full member mapping", () => {
  it("maps members with gallery and contact-derived social", () => {
    const item = {
      id: 1,
      attributes: {
        title: "Test",
        slug: "test",
        members: [
          {
            id: 10,
            name: "Ana",
            slug: "ana",
            role: "Guía",
            bio: "Bio de Ana",
            pullQuote: "Cita",
            legacyNote: "Legado",
            photo: { url: "/uploads/ana.jpg" },
            gallery: [{ url: "/uploads/g1.jpg" }, { url: "/uploads/g2.jpg" }],
            contact: { instagram: "@ana", whatsappCountryCode: "+52", whatsappNumber: "1234567890" },
            isFeatured: true,
            order: 2,
          },
        ],
      },
    };
    const out = transformListing(item as any, "es");
    const member = out.members?.[0];
    expect(member?.name).toBe("Ana");
    expect(member?.galleryUrls).toHaveLength(2);
    expect(member?.galleryUrls[0]).toContain("/uploads/g1.jpg");
    // contact { instagram, whatsapp } → 2 social links
    expect(member?.social.length).toBe(2);
    const platforms = member?.social.map((s) => s.platform).sort();
    expect(platforms).toEqual(["instagram", "whatsapp"]);
    expect(member?.isFeatured).toBe(true);
    expect(member?.order).toBe(2);
    expect(member?.photo).toContain("/uploads/ana.jpg");
  });

  it("maps a member without gallery/contact to empty arrays, not undefined", () => {
    const item = {
      id: 2,
      attributes: {
        title: "T",
        slug: "t",
        members: [{ id: 11, name: "Beto", slug: "beto" }],
      },
    };
    const out = transformListing(item as any, "es");
    const member = out.members?.[0];
    expect(member?.galleryUrls).toEqual([]);
    expect(member?.social).toEqual([]);
    expect(member?.listingSlugs).toEqual([]);
    expect(member?.relatedMembers).toEqual([]);
  });

  it("falls back to the ES member fields per index (same policy as stories)", () => {
    const item = {
      id: 3,
      attributes: {
        title: "T",
        slug: "t",
        members: [{ id: 10, name: "Ana", slug: "ana", role: "" }],
      },
    };
    const esItem = {
      id: 3,
      attributes: {
        title: "T",
        slug: "t",
        members: [{ id: 10, name: "Ana", slug: "ana", role: "Rol ES" }],
      },
    };
    const out = transformListing(item as any, "en", esItem as any);
    expect(out.members?.[0].role).toBe("Rol ES");
  });
});
