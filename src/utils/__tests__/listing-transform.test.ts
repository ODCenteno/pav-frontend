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
    tags: [{ label_es: "r2", label_en: "r2" }, { label_es: "demo", label_en: "demo" }],
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
      text_es: "Lunes a Domingo 8:00 - 18:00",
      text_en: "Monday to Sunday 8:00 - 18:00",
    },
    amenities: [
      { label_es: "Wifi", label_en: "Wifi" },
      { label_es: "Estacionamiento", label_en: "Parking" },
    ],
    recommendations: {
      id: 92,
      bestTime_es: "La mejor hora",
      bestTime_en: "The best moment",
      bring_es: "Traer cariño",
      bring_en: "Bring meals",
      accessibilityNotes_es: "Notas de accesibilidad para visitantes",
      accessibilityNotes_en: "Accessibility Notes",
      connectivityNotes_es: "Tenemos wifi",
      connectivityNotes_en: "Wifi here",
    },
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
    social: [
      { platform: "facebook", handle: "ejemploiconico", url: null },
      { platform: "instagram", handle: "@pav_otro", url: null },
    ],
  };

  const out = transformListing(fixture as any, "es");

  it("renders every field the detail page depends on", () => {
    // Identity
    expect(out.slug).toBe("sitio-ejemplo-carga-assets");
    expect(out.name.es).toBe("Sitio Ejemplo Carga Assets 22");
    expect(out.shortDescription?.es).toContain("ejemplo");
    expect(out.description?.es).toContain("Lorem Ipsum");
    expect(out.pricing?.price).toBe("500");
    expect(out.isFeatured).toBe(false);

    // Media + location
    expect(out.image).toContain("PAV-Lanscape-01.webp");
    expect(out.media?.galleryUrls).toHaveLength(2);
    expect(out.location?.lat).toBeCloseTo(25.516, 2);
    expect(out.category?.slug).toBe("accommodation");

    // Contact → drives SiteSummary + StickyActionBar
    expect(out.contact?.whatsapp).toBe("521234567890");
    expect(out.contact?.phone).toBe("+52 614 123 4567");
    expect(out.contact?.email).toBe("info@example.com");

    // Schedule → drives SiteInfoPanel
    expect(out.schedule?.text?.es).toContain("Lunes");
    expect(out.schedule?.text?.en).toContain("Monday");

    // Amenities → drives SiteInfoPanel
    expect(out.amenities).toHaveLength(2);
    expect(out.amenities?.[0].es).toBe("Wifi");

    // Recommendations → drives SiteTips
    expect(out.recommendations?.bestTimeToVisit?.es).toBe("La mejor hora");
    expect(out.recommendations?.whatToBring).toHaveLength(1);
    expect(out.recommendations?.whatToBring?.[0].es).toBe("Traer cariño");
    expect(out.recommendations?.accessibilityNotes?.es).toContain("accesibilidad");
    expect(out.recommendations?.connectivityNotes?.es).toBe("Tenemos wifi");

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

    // Social: explicit (2) + contact-derived IG + FB = 4
    expect(out.social).toHaveLength(4);
    const platforms = out.social!.map((s) => s.platform).sort();
    expect(platforms).toEqual(["facebook", "facebook", "instagram", "instagram"]);
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
