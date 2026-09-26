import { describe, it, expect, vi } from "vitest";

// The transformer transitively imports `navigation`, which uses `astro:i18n`.
// Vitest can't resolve that virtual module — mock it out before importing
// the transformer (same trick used by strapiTransformer.test.ts).
vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import { transformListing } from "../strapiTransformer";

/**
 * Integration test: feeds `transformListing` a fixture that mirrors the real
 * Strapi v5 response for `sitio-ejemplo-carga-assets`. Asserts that every
 * field the detail page depends on is present in the view model.
 */
describe("transformListing (sitio-ejemplo-carga-assets fixture)", () => {
  const fixture = {
    id: 283,
    documentId: "gdrmphdzk0tm9mxpqs3suadh",
    title: "Sitio Ejemplo Carga Assets 22",
    slug: "sitio-ejemplo-carga-assets",
    shortDescription: "Este es un ejemplo de la conexión entre strapi y cloudflare R2",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    price: "500",
    isFeatured: false,
    order: 1,
    mainImage: {
      url: "https://pub-6774f1bb5b50447c89f09d4600081fc6.r2.dev/PAV-Lanscape-01.webp",
      width: 2048,
      height: 1152,
    },
    gallery: [
      { url: "https://example.com/g1.jpg" },
      { url: "https://example.com/g2.jpg" },
    ],
    category: {
      id: 6,
      slug: "accommodation",
      name: "Hospedaje",
      color: "#4A90E2",
    },
    tags: [{ id: 1, label: "r2" }, { id: 2, label: "demo" }],
    contact: {
      id: 50,
      whatsapp: "521234567890",
      phone: "+52 614 123 4567",
      email: "info@example.com",
      instagram: "@pav_ejemplo",
      facebook: "pav.ejemplo",
    },
    location: {
      id: 100,
      geoPoint: { lat: 25.516, lng: -111.073 },
    },
    schedule: {
      id: 80,
      text: "Lunes a Domingo 8:00 - 18:00",
    },
    amenities: [
      { id: 1, label: "Wifi", content: "" },
      { id: 2, label: "Estacionamiento", content: "Junto a la entrada" },
    ],
    recommendations: [
      { id: 1, label: "Mejor época para visitar", description: "La mejor hora" },
      { id: 2, label: "Qué llevar", description: "Traer cariño" },
      { id: 3, label: "Accesibilidad", description: "Notas de accesibilidad para visitantes" },
      { id: 4, label: "Conectividad", description: "Tenemos wifi" },
    ],
    // Strapi v5 returns relations as bare arrays (not `{ data: [...] }`)
    relatedListings: [
      {
        id: 245,
        documentId: "ri41ngo5l41mutweaxpw19vh",
        title: "Aguas Termales",
        slug: "aguas-termales",
      },
      {
        id: 211,
        documentId: "f50fmq7z5gi5tr9v8k3g0git",
        title: "Cabañas del Sol",
        slug: "cabanas-del-sol",
      },
    ],
    members: [
      {
        id: 2,
        documentId: "h04tmrx2rwbvw8rqw4uiiu4y",
        name: "Persona de prueba",
        slug: "persona-de-prueba",
        role: "Gerente",
        locality: "agua-verde",
        bio: "Alma comunitaria con corazón para la conexión.",
        pullQuote: null,
        phone: null,
        whatsapp: null,
        legacyNote: null,
        isFeatured: false,
        order: 0,
        photo: { url: "https://example.com/photo.jpg" },
      },
    ],
    stories: [
      {
        id: 13,
        title: "Mi paso por R2",
        narrative: "Lorem ipsum narrative text.",
        highlightQuote: '"Lorem ipsum dolor sit amet.."',
        era: null,
        theme: "craft",
        storyteller: "Paquita",
        image: { url: "https://example.com/story.jpg" },
        gallery: [],
      },
    ],
    products: [
      { id: 3, name: "Elotes curtidos", description: "Del desierto, bien limpio" },
      { id: 4, name: "Caracoles marinos", description: "Con su concha y su limón" },
    ],
  };

  const out = transformListing(fixture as any, "es");

  it("renders every field the detail page depends on", () => {
    // Identity
    expect(out.slug).toBe("sitio-ejemplo-carga-assets");
    expect(out.name['es-MX']).toBe("Sitio Ejemplo Carga Assets 22");
    expect(out.shortDescription?.['es-MX']).toContain("ejemplo");
    expect(out.description?.['es-MX']).toContain("Lorem Ipsum");
    expect(out.pricing?.price).toBe("500");
    expect(out.isFeatured).toBe(false);

    // Media + location
    expect(out.image).toContain("PAV-Lanscape-01.webp");
    expect(out.media?.galleryUrls).toHaveLength(2);
    expect(out.location?.lat).toBeCloseTo(25.516, 2);
    expect(out.category?.slug).toBe("accommodation");

    // Contact → drives SiteSummary + StickyActionBar
    expect(out.contact?.whatsapp).toBe("+521234567890");
    expect(out.contact?.phone).toBe("+526141234567");
    expect(out.contact?.email).toBe("info@example.com");

    // Tags → plain localized strings
    expect(out.tags).toEqual(["r2", "demo"]);

    // Schedule → drives SiteInfoPanel
    expect(out.schedule?.text).toContain("Lunes");

    // Amenities → drives SiteInfoPanel (label + optional content)
    expect(out.amenities).toHaveLength(2);
    expect(out.amenities?.[0]).toEqual({ label: "Wifi", content: undefined });
    expect(out.amenities?.[1]).toEqual({ label: "Estacionamiento", content: "Junto a la entrada" });

    // Recommendations → drives SiteTips (dynamic CMS-labeled items)
    expect(out.recommendations).toHaveLength(4);
    expect(out.recommendations?.[0]).toEqual({ label: "Mejor época para visitar", description: "La mejor hora" });
    expect(out.recommendations?.[1]).toEqual({ label: "Qué llevar", description: "Traer cariño" });
    expect(out.recommendations?.[2]?.description).toContain("accesibilidad");
    expect(out.recommendations?.[3]).toEqual({ label: "Conectividad", description: "Tenemos wifi" });

    // Relations (Strapi v5: bare arrays, not { data: [...] })
    expect(out.relatedSites).toEqual(["245", "211"]);
    expect(out.members).toHaveLength(1);
    expect(out.members?.[0].name).toBe("Persona de prueba");
    expect(out.members?.[0].role).toBe("Gerente");
    expect(out.members?.[0].photo).toContain("photo.jpg");

    // Stories
    expect(out.stories).toHaveLength(1);
    expect(out.stories?.[0].title).toBe("Mi paso por R2");
    expect(out.stories?.[0].theme).toBe("craft");
    expect(out.stories?.[0].storyteller).toBe("Paquita");
    expect(out.stories?.[0].imageUrl).toContain("story.jpg");

    // Products
    expect(out.products).toHaveLength(2);
    expect(out.products?.[0].name).toBe("Elotes curtidos");

    // Social: derived from contact (WA + phone + email + IG + FB) = 5
    expect(out.social).toHaveLength(5);
    const platforms = out.social!.map((s) => s.platform).sort();
    expect(platforms).toEqual(["email", "facebook", "instagram", "phone", "whatsapp"]);
  });

  it("derives instagram URL from a bare handle (no @, no http)", () => {
    const ig = out.social!.find((s) => s.handle === "pav_ejemplo");
    expect(ig?.url).toBe("https://instagram.com/pav_ejemplo");
  });

  it("derives facebook URL from a bare handle", () => {
    const fb = out.social!.find((s) => s.handle === "pav.ejemplo");
    expect(fb?.url).toBe("https://facebook.com/pav.ejemplo");
  });
});

/**
 * EN fallback policy for localized listing components: EN entries may have
 * empty component arrays (or empty fields inside them). The transformer must
 * fall back to the ES entry's values, exactly like stories/products.
 */
describe("transformListing — ES fallback for tags/schedule/amenities/recommendations", () => {
  const esItem = {
    id: 1,
    documentId: "doc-es",
    title: "Sitio ES",
    slug: "sitio-es",
    tags: [{ id: 1, label: "Aventura" }, { id: 2, label: "Mar" }],
    schedule: { id: 1, text: "Lunes a Domingo" },
    amenities: [
      { id: 1, label: "Wifi", content: "En todo el predio" },
      { id: 2, label: "Estacionamiento", content: "" },
    ],
    recommendations: [
      { id: 1, label: "Mejor época para visitar", description: "Invierno" },
      { id: 2, label: "Qué llevar", description: "Agua\nGorra\nBloqueador" },
    ],
  };

  it("uses the ES entry values when the EN component arrays are empty", () => {
    const enItem = {
      id: 2,
      documentId: "doc-es",
      title: "Site EN",
      slug: "sitio-es",
      tags: [],
      schedule: null,
      amenities: [],
      recommendations: [],
    };
    const out = transformListing(enItem as any, "en", esItem as any);

    expect(out.tags).toEqual(["Aventura", "Mar"]);
    expect(out.schedule?.text).toBe("Lunes a Domingo");
    expect(out.amenities).toEqual([
      { label: "Wifi", content: "En todo el predio" },
      { label: "Estacionamiento", content: undefined },
    ]);
    expect(out.recommendations).toEqual([
      { label: "Mejor época para visitar", description: "Invierno" },
      { label: "Qué llevar", description: "Agua\nGorra\nBloqueador" },
    ]);
  });

  it("uses the ES entry values when the EN components are missing entirely", () => {
    const enItem = { id: 3, documentId: "doc-es", title: "Site EN", slug: "sitio-es" };
    const out = transformListing(enItem as any, "en", esItem as any);

    expect(out.tags).toEqual(["Aventura", "Mar"]);
    expect(out.schedule?.text).toBe("Lunes a Domingo");
    expect(out.amenities).toHaveLength(2);
    expect(out.recommendations).toHaveLength(2);
  });

  it("falls back per item when EN entries exist but their fields are empty", () => {
    const enItem = {
      id: 4,
      documentId: "doc-es",
      title: "Site EN",
      slug: "sitio-es",
      tags: [{ id: 10, label: "Adventure" }, { id: 11, label: "" }],
      schedule: { id: 10, text: "" },
      amenities: [{ id: 10, label: "", content: "" }],
      recommendations: [
        { id: 10, label: "Best time to visit", description: "" },
        { id: 11, label: "", description: "Water\nHat" },
      ],
    };
    const out = transformListing(enItem as any, "en", esItem as any);

    expect(out.tags).toEqual(["Adventure", "Mar"]);
    expect(out.schedule?.text).toBe("Lunes a Domingo");
    expect(out.amenities?.[0]).toEqual({ label: "Wifi", content: "En todo el predio" });
    expect(out.recommendations?.[0]).toEqual({
      label: "Best time to visit",
      description: "Invierno",
    });
    expect(out.recommendations?.[1]).toEqual({ label: "Qué llevar", description: "Water\nHat" });
  });

  it("keeps EN values when present (no fallback needed)", () => {
    const enItem = {
      id: 5,
      documentId: "doc-es",
      title: "Site EN",
      slug: "sitio-es",
      tags: [{ id: 10, label: "Adventure" }],
      schedule: { id: 10, text: "Monday to Sunday" },
      amenities: [{ id: 10, label: "Wifi", content: "Across the property" }],
      recommendations: [{ id: 10, label: "Best time to visit", description: "Winter" }],
    };
    const out = transformListing(enItem as any, "en", esItem as any);

    expect(out.tags).toEqual(["Adventure"]);
    expect(out.schedule?.text).toBe("Monday to Sunday");
    expect(out.amenities?.[0]).toEqual({ label: "Wifi", content: "Across the property" });
    expect(out.recommendations?.[0]).toEqual({ label: "Best time to visit", description: "Winter" });
  });

  it("preserves newline-separated lists inside recommendation descriptions", () => {
    const out = transformListing(esItem as any, "es-MX");
    const bring = out.recommendations?.find((r) => r.label === "Qué llevar");
    expect(bring?.description).toBe("Agua\nGorra\nBloqueador");
    expect(bring?.description?.split("\n")).toHaveLength(3);
  });
});

/**
 * Expand/contract bridge: until the backend contract deploy is stable in
 * production, the API may still return the legacy dual-field shapes (either
 * deploy order must be safe). The transformer resolves the entry's own-locale
 * values from the `_es` columns and converts the legacy visit-info object
 * into labeled recommendation items.
 */
describe("transformListing — legacy dual-field bridge (expand/contract window)", () => {
  it("resolves tags/schedule/amenities from legacy label_es/text_es fields", () => {
    const legacy = {
      id: 1,
      documentId: "doc-legacy",
      title: "Sitio Legacy",
      slug: "sitio-legacy",
      tags: [{ id: 1, label_es: "Aventura" }, { id: 2, label_es: "Mar" }],
      schedule: { id: 1, text_es: "Lunes a Domingo" },
      amenities: [{ id: 1, label_es: "Wifi" }],
    };
    const out = transformListing(legacy as any, "es-MX");

    expect(out.tags).toEqual(["Aventura", "Mar"]);
    expect(out.schedule?.text).toBe("Lunes a Domingo");
    expect(out.amenities?.[0]).toEqual({ label: "Wifi", content: undefined });
  });

  it("converts a legacy visit-info recommendations object into labeled items (ES)", () => {
    const legacy = {
      id: 2,
      documentId: "doc-legacy",
      title: "Sitio Legacy",
      slug: "sitio-legacy",
      recommendations: {
        id: 1,
        bestTime_es: "Invierno",
        bring_es: "Agua\nGorra",
        accessibilityNotes_es: "",
        connectivityNotes_es: "Sin señal",
      },
    };
    const out = transformListing(legacy as any, "es-MX");

    expect(out.recommendations).toEqual([
      { label: "Mejor época para visitar", description: "Invierno" },
      { label: "Qué llevar", description: "Agua\nGorra" },
      { label: "Conectividad", description: "Sin señal" },
    ]);
  });

  it("uses English labels for legacy recommendations on EN entries", () => {
    const legacy = {
      id: 3,
      documentId: "doc-legacy",
      title: "Legacy EN",
      slug: "sitio-legacy",
      recommendations: {
        id: 1,
        bestTime_es: "Winter",
        bring_es: "Water",
      },
    };
    const out = transformListing(legacy as any, "en");

    expect(out.recommendations).toEqual([
      { label: "Best time to visit", description: "Winter" },
      { label: "What to bring", description: "Water" },
    ]);
  });

  it("falls back to the ES entry's legacy recommendations when the EN entry has none", () => {
    const esLegacy = {
      id: 4,
      documentId: "doc-legacy",
      title: "Sitio Legacy",
      slug: "sitio-legacy",
      recommendations: { id: 1, bestTime_es: "Invierno" },
    };
    const enItem = {
      id: 5,
      documentId: "doc-legacy",
      title: "Legacy EN",
      slug: "sitio-legacy",
      recommendations: [],
    };
    const out = transformListing(enItem as any, "en", esLegacy as any);

    expect(out.recommendations).toEqual([
      { label: "Mejor época para visitar", description: "Invierno" },
    ]);
  });
});
