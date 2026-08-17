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
  transformGuidePage,
  transformAboutPage,
  transformHomepage,
  transformExperiencesPage,
  transformCategory,
  transformTeamMember,
  transformOrganization,
  transformSiteContent,
  type GuidePageAttributes,
  type AboutPageAttributes,
  type HomepageAttributes,
  type ExperiencesPageAttributes,
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
        locality: "agua-verde",
        bio: { "es-MX": "Bio ES", en: "Bio EN" },
        pullQuote: { "es-MX": "Cita ES", en: "Quote EN" },
        legacyNote: { "es-MX": "Legado ES", en: "Legacy EN" },
        photo: { id: 1, url: "/uploads/paquita.jpg" },
        gallery: [{ id: 2, url: "/uploads/g1.jpg" }],
        contact: { instagram: "@paquita", whatsapp: "52123" },
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
    expect(out.locality).toBe("agua-verde");
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
// transformGuidePage — object-shaped localized text branches
// ─────────────────────────────────────────────────────────────────────
describe("transformGuidePage — localized object text fields", () => {
  const item: any = {
    id: 1,
    attributes: {
      hero: { title: "Guide", ctaLabel: "Go", ctaLink: "/", images: [] },
      historyHeader: { title: "Historia" },
      historyText: "Hist",
      historyMilestones: [
        { year: "1950", text: { "es-MX": "Hit ES", en: "Milestone EN" } },
        { year: "1960" }, // no text → empty strings
      ],
      fishingHeader: { title: "Pesca" },
      fishingText: "Rules",
      fishingRules: [{ text: { "es-MX": "Regla ES", en: "Rule EN" } }],
      recommendationsHeader: { title: "Recomendaciones" },
      recommendations: [{ text: { "es-MX": "Rec ES", en: "Rec EN" } }],
      directionsHeader: { title: "Cómo llegar" },
      directions: [
        {
          label: { "es-MX": "Desde Loreto", en: "From Loreto" },
          description: { "es-MX": "98 km", en: "60 mi" },
          distance: "98 km",
          time: "2h",
          image: { url: "/uploads/loreto.jpg" },
        },
        {
          label: { "es-MX": "Desde La Paz", en: "From La Paz" },
          description: { "es-MX": "360 km", en: "220 mi" },
        },
      ],
      drivingTipsHeader: "Consejos",
      drivingTips: [{ text: { "es-MX": "Tip ES", en: "Tip EN" } }],
      amenitiesHeader: { title: "Servicios" },
      amenities: [
        { icon: "wifi", title: { "es-MX": "WiFi", en: "WiFi" }, text: { "es-MX": "Hay wifi", en: "Wifi available" } },
        { icon: "parking" }, // no title/text → empty strings, icon kept
      ],
      touristMapHeader: { title: "Mapa" },
      touristMapCaption: "Caption",
    },
  };

  it("resolves ES object-shaped text fields", () => {
    const out = transformGuidePage(item as any, "es");
    expect(out.history?.milestones[0]["es-MX"]).toBe("Hit ES");
    expect(out.history?.milestones[0].en).toBe("Milestone EN");
    expect(out.history?.milestones[1]["es-MX"]).toBe("");
    expect(out.fishing?.rules[0]).toBe("Regla ES");
    expect(out.recommendations?.items[0]).toBe("Rec ES");
    expect(out.directions?.loreto.label).toBe("Desde Loreto");
    expect(out.directions?.loreto.desc).toBe("98 km");
    expect(out.directions?.loreto.image).toContain("/uploads/loreto.jpg");
    expect(out.directions?.laPaz.label).toBe("Desde La Paz");
    expect(out.directions?.drivingTips[0]).toBe("Tip ES");
    expect(out.amenities?.items[0].title).toBe("WiFi");
    expect(out.amenities?.items[0].text).toBe("Hay wifi");
    expect(out.amenities?.items[1].icon).toBe("parking");
    expect(out.amenities?.items[1].title).toBe("");
  });

  it("resolves EN object-shaped text fields", () => {
    const out = transformGuidePage(item as any, "en");
    expect(out.history?.milestones[0].en).toBe("Milestone EN");
    expect(out.fishing?.rules[0]).toBe("Rule EN");
    expect(out.recommendations?.items[0]).toBe("Rec EN");
    expect(out.directions?.loreto.label).toBe("From Loreto");
    expect(out.directions?.laPaz.desc).toBe("220 mi");
    expect(out.directions?.drivingTips[0]).toBe("Tip EN");
    expect(out.amenities?.items[0].text).toBe("Wifi available");
  });

  it("returns empty direction placeholders when fewer than two directions", () => {
    const single: any = {
      id: 2,
      attributes: {
        hero: { title: "G", ctaLabel: "Go", ctaLink: "/", images: [] },
        directionsHeader: { title: "D" },
        directions: [{ label: "Only one", description: "desc" }],
      },
    };
    const out = transformGuidePage(single as any, "es");
    expect(out.directions?.loreto.label).toBe("Only one");
    expect(out.directions?.laPaz.label).toBe("");
    expect(out.directions?.laPaz.image).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────
// transformAboutPage — valuesItems objects + collaboration/finalCta links
// ─────────────────────────────────────────────────────────────────────
describe("transformAboutPage — object valuesItems + links", () => {
  it("maps object-shaped valuesItems and collaboration/finalCta links", () => {
    const item: any = {
      id: 1,
      attributes: {
        hero: { title: "About", ctaLabel: "Go", ctaLink: "/", images: [] },
        values: {
          valuesTitle: "Valores",
          valuesItems: [
            { "es-MX": "Respeto", en: "Respect" },
            "Plain value",
          ],
        },
        collaboration: {
          title: "Colab",
          description: "Desc",
          primaryButtonLabel: "Primary",
          secondaryButtonLabel: "Secondary",
          // no links → default '#'
        },
        finalCta: {
          title: "CTA",
          description: "D",
          buttonLabel: "Go",
          // no buttonLink → default '#'
        },
      },
    };
    const es = transformAboutPage(item as any, "es");
    expect(es.values?.values?.items).toEqual(["Respeto", "Plain value"]);
    expect(es.collaboration?.links.primary).toBe("#");
    expect(es.collaboration?.links.secondary).toBe("#");
    expect(es.finalCta?.buttonLink).toBe("#");

    const en = transformAboutPage(item as any, "en");
    expect(en.values?.values?.items[0]).toBe("Respect");
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
// transformExperiencesPage — section layout default + image/link fields
// ─────────────────────────────────────────────────────────────────────
describe("transformExperiencesPage — section fields", () => {
  it("defaults layout and maps image/link/linkLabel", () => {
    const item: any = {
      id: 1,
      attributes: {
        hero: { title: "E", ctaLabel: "Go", ctaLink: "/", images: [] },
        sections: [
          {
            title: "Sec",
            text: "Text",
            image: { url: "/uploads/sec.jpg", alternativeText: "Sec alt" },
            link: "/sitios",
            linkLabel: { "es-MX": "Ver", en: "See" },
            // no layout → default 'image-left'
          },
        ],
      },
    };
    const es = transformExperiencesPage(item as any, "es");
    expect(es.sections[0].layout).toBe("image-left");
    expect(es.sections[0].imageUrl).toContain("/uploads/sec.jpg");
    expect(es.sections[0].imageAlt).toBe("Sec alt");
    expect(es.sections[0].link).toBe("/sitios");
    expect(es.sections[0].linkLabel).toBe("Ver");

    const en = transformExperiencesPage(item as any, "en");
    expect(en.sections[0].linkLabel).toBe("See");
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

  it("team member falls back to name when no id/documentId", () => {
    const out = transformTeamMember({ attributes: { name: "Juan" } } as any);
    expect(out.id).toBe("Juan");
  });

  it("organization falls back to name when no id/documentId", () => {
    const out = transformOrganization({ attributes: { name: "Coop" } } as any);
    expect(out.id).toBe("Coop");
  });

  it("site content falls back to key when no id/documentId", () => {
    const out = transformSiteContent({ attributes: { key: "my-key", title: "T", text: "X" } } as any);
    expect(out.id).toBe("my-key");
  });
});

// ─────────────────────────────────────────────────────────────────────
// Null safety (edge-case 2). Strapi returns null for empty optional fields;
// `typeof null === 'object'` used to crash the `typeof x === 'object' ? x[l]`
// ternaries. These tests lock in the locText fix: null → '' without throwing.
// ─────────────────────────────────────────────────────────────────────
describe("null safety — guide page fields", () => {
  const base: any = {
    id: 1,
    attributes: {
      hero: { title: "G", ctaLabel: "Go", ctaLink: "/", images: [] },
      historyHeader: { title: "H" },
      historyText: "text",
    },
  };

  it("does not throw when historyMilestones[].text is null", () => {
    const item = {
      ...base,
      attributes: {
        ...base.attributes,
        historyMilestones: [{ year: "1950", text: null }, { year: "1960" }],
      },
    };
    expect(() => transformGuidePage(item as any, "es")).not.toThrow();
    const out = transformGuidePage(item as any, "es");
    expect(out.history?.milestones[0]["es-MX"]).toBe("");
    expect(out.history?.milestones[0].en).toBe("");
  });

  it("does not throw when fishingRules/recommendations/drivingTips text is null", () => {
    const item = {
      ...base,
      attributes: {
        ...base.attributes,
        fishingHeader: { title: "F" },
        fishingRules: [{ text: null }],
        recommendationsHeader: { title: "R" },
        recommendations: [{ text: null }],
        drivingTipsHeader: "Tips",
        drivingTips: [{ text: null }],
      },
    };
    expect(() => transformGuidePage(item as any, "es")).not.toThrow();
    const out = transformGuidePage(item as any, "es");
    expect(out.fishing?.rules[0]).toBe("");
    expect(out.recommendations?.items[0]).toBe("");
    expect(out.directions?.drivingTips[0]).toBe("");
  });

  it("does not throw when directions label/description are null", () => {
    const item = {
      ...base,
      attributes: {
        ...base.attributes,
        directionsHeader: { title: "D" },
        directions: [
          { label: null, description: null, distance: "98 km", time: "2h" },
          { label: null, description: null },
        ],
      },
    };
    expect(() => transformGuidePage(item as any, "es")).not.toThrow();
    const out = transformGuidePage(item as any, "es");
    expect(out.directions?.loreto.label).toBe("");
    expect(out.directions?.loreto.desc).toBe("");
    expect(out.directions?.laPaz.label).toBe("");
  });

  it("does not throw when amenities title/text are null", () => {
    const item = {
      ...base,
      attributes: {
        ...base.attributes,
        amenitiesHeader: { title: "A" },
        amenities: [{ icon: "wifi", title: null, text: null }],
      },
    };
    expect(() => transformGuidePage(item as any, "es")).not.toThrow();
    const out = transformGuidePage(item as any, "es");
    expect(out.amenities?.items[0].title).toBe("");
    expect(out.amenities?.items[0].text).toBe("");
    expect(out.amenities?.items[0].icon).toBe("wifi");
  });
});

describe("null safety — about page valuesItems", () => {
  it("does not throw when valuesItems contains null entries", () => {
    const item: any = {
      id: 1,
      attributes: {
        hero: { title: "About", ctaLabel: "Go", ctaLink: "/", images: [] },
        values: {
          valuesTitle: "Valores",
          valuesItems: [null, { "es-MX": "Respeto", en: "Respect" }, "Plain", null],
        },
      },
    };
    expect(() => transformAboutPage(item as any, "es")).not.toThrow();
    const es = transformAboutPage(item as any, "es");
    expect(es.values?.values?.items).toEqual(["", "Respeto", "Plain", ""]);
    const en = transformAboutPage(item as any, "en");
    expect(en.values?.values?.items[1]).toBe("Respect");
  });
});
