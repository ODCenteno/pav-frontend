import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));
import {
  transformCategory,
  transformListing,
  transformSiteContent,
  transformHomepage,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type SiteContentAttributes,
  type HomepageAttributes,
} from "../strapiTransformer";

describe("strapiTransformer", () => {
  describe("transformCategory", () => {
    it("transforms a v5 attributes-wrapped item", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 1,
        attributes: {
          name: "Experiencias",
          slug: "experiences",
          color: "#E87A5D",
        },
      };
      const out = transformCategory(item);
      expect(out.id).toBe("1");
      expect(out.slug).toBe("experiences");
expect(out.name['es-MX']).toBe("Experiencias");
expect(out.name.en).toBe("Experiencias");
      expect(out.color).toBe("#E87A5D");
    });

    it("transforms a flattened item (Strapi v4-style fallback)", () => {
      const item = {
        id: 2,
        slug: "restaurants",
        name: "Restaurantes",
      } as any;
      const out = transformCategory(item);
      expect(out.slug).toBe("restaurants");
      expect(out.name['es-MX']).toBe("Restaurantes");
    });

    it("returns empty slots when name is undefined", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 3,
        attributes: { slug: "x" } as any,
      };
      const out = transformCategory(item);
      expect(out.name['es-MX']).toBe("");
      expect(out.name.en).toBe("");
    });
  });

  describe("transformListing", () => {
    it("transforms a listing with media and category relation", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 10,
        attributes: {
          title: "Tour Isla Catalana",
          slug: "tour-isla-catalana",
          shortDescription: "Half-day tour with snorkeling.",
          description: "Long description...",
          mainImage: {
            id: 1,
            url: "/uploads/isla.jpg",
          },
          gallery: [
            { id: 2, url: "/uploads/a.jpg" },
            { id: 3, url: "/uploads/b.jpg" },
          ],
          price: "$60 USD",
          isFeatured: true,
          category: {
            data: {
              id: 1,
              attributes: { name: "Experiencias", slug: "experiences" },
            },
          },
          tags: [{ label: "Aventura" }, { label: "Mar" }],
          location: {
            geoPoint: { lat: 25.5, lng: -111.0 },
          },
        },
      };
      const out = transformListing(item, "es");
      expect(out.id).toBe("10");
      expect(out.slug).toBe("tour-isla-catalana");
      expect(out.name['es-MX']).toBe("Tour Isla Catalana");
      expect(out.name.en).toBe("Tour Isla Catalana");
      expect(out.shortDescription?.['es-MX']).toBe("Half-day tour with snorkeling.");
      expect(out.categoryId).toBe("experiences");
      expect(out.category?.slug).toBe("experiences");
      expect(out.tags).toHaveLength(2);
      expect(out.tags?.[0]).toBe("Aventura");
      expect(out.location?.lat).toBe(25.5);
      expect(out.location?.lng).toBe(-111.0);
      expect(out.image).toContain("/uploads/isla.jpg");
      expect(out.media?.mainImageUrl).toContain("/uploads/isla.jpg");
      expect(out.media?.galleryUrls).toHaveLength(2);
      expect(out.pricing?.price).toBe("$60 USD");
      expect(out.isFeatured).toBe(true);
      expect(out.href).toEqual({ 'es-MX': expect.stringContaining("/sitios/"), en: expect.stringContaining("/en/sitios/") });
    });

    it("returns a listing with empty arrays when tags/gallery are missing", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 20,
        attributes: {
          title: "Test",
          slug: "test",
        },
      };
      const out = transformListing(item, "es");
      expect(out.tags).toEqual([]);
      expect(out.amenities).toEqual([]);
      // No media at all when both mainImage and gallery are absent
      expect(out.media).toBeUndefined();
      expect(out.media?.galleryUrls).toBeUndefined();
    });

    it("converts a richtext blocks array to plain text", () => {
      const blocks = [
        { type: "paragraph", children: [{ type: "text", text: "Hello " }] },
        { type: "paragraph", children: [{ type: "text", text: "World" }] },
      ];
      const item: StrapiItem<ListingAttributes> = {
        id: 30,
        attributes: { title: "X", slug: "x", description: blocks as any },
      };
      const out = transformListing(item, "es");
      expect(out.description?.['es-MX']).toContain("Hello");
      expect(out.description?.['es-MX']).toContain("World");
    });

    it("extracts a single-media logo (Strapi v5 { data: { url } } shape) into logoUrls", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 40,
        attributes: {
          title: "Proyecto Biznaga",
          slug: "proyecto-biznaga",
          mainImage: { id: 1, url: "/uploads/main.webp" },
          logo: {
            data: { id: 2, url: "/uploads/biznaga-logo.png" },
          } as any,
        },
      };
      const out = transformListing(item, "es");
      expect(out.media?.logoUrls).toHaveLength(1);
      expect(out.media?.logoUrls?.[0]).toContain("/uploads/biznaga-logo.png");
    });

    it("extracts a single-media logo with v4 nested attributes wrapper", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 41,
        attributes: {
          title: "X",
          slug: "x",
          logo: {
            data: { id: 5, attributes: { url: "/uploads/legacy.png" } },
          } as any,
        },
      };
      const out = transformListing(item, "es");
      expect(out.media?.logoUrls).toHaveLength(1);
      expect(out.media?.logoUrls?.[0]).toContain("/uploads/legacy.png");
    });

    it("extracts a multiple-media logo (Strapi collection { data: [...] }) into logoUrls", () => {
      const item: StrapiItem<ListingAttributes> = {
        id: 42,
        attributes: {
          title: "X",
          slug: "x",
          logo: {
            data: [
              { id: 7, url: "/uploads/logo-a.png" },
              { id: 8, url: "/uploads/logo-b.png" },
            ],
          } as any,
        },
      };
      const out = transformListing(item, "es");
      expect(out.media?.logoUrls).toHaveLength(2);
      expect(out.media?.logoUrls?.[0]).toContain("/uploads/logo-a.png");
      expect(out.media?.logoUrls?.[1]).toContain("/uploads/logo-b.png");
    });
  });

  describe("transformSiteContent", () => {
    it("transforms a site-content entry with extraData JSON", () => {
      const item: StrapiItem<SiteContentAttributes> = {
        id: 1,
        documentId: "abc",
        attributes: {
          key: "about-values",
          title: "Nuestros valores",
          text: "",
          order: 1,
          extraData: { mission: { 'es-MX': "M-ES", en: "M-EN" } },
        },
      };
      const out = transformSiteContent(item, "es");
      expect(out.id).toBe("1");
      expect(out.documentId).toBe("abc");
      expect(out.key).toBe("about-values");
      expect(out.title['es-MX']).toBe("Nuestros valores");
      expect((out.extraData as any).mission['es-MX']).toBe("M-ES");
    });
  });

  describe("transformHomepage", () => {
    it("transforms a full homepage with all sections", () => {
      const item: StrapiItem<HomepageAttributes> = {
        id: 1,
        attributes: {
          hero: {
            title: "Puerto Agua Verde &",
            titleHighlight: "Rancho San Cosme",
            description: "Un destino natural donde la tranquilidad...",
            ctaLabel: "Explorar el destino",
            ctaLink: "/sitios",
            images: [
              { id: 1, url: "/uploads/hero1.jpg", alternativeText: "Coast" },
              { id: 2, url: "/uploads/hero2.jpg", alternativeText: "Nature" },
            ],
          },
          highlightsHeader: {
            title: "Lo más destacado",
            subtitle: "Descubre las mejores opciones",
          },
          highlights: [
            {
              title: "Experiencias",
              description: "Actividades únicas...",
              image: { id: 5, url: "/uploads/exp.jpg", alternativeText: "Experiences" },
              link: "/experiencias",
            },
          ],
          quickFactsHeader: {
            title: "Lo esencial",
            subtitle: "Datos rápidos",
          },
          quickFacts: [
            { title: "A 2h de Loreto", value: "98 km", description: "Trayecto aproximado de 2 horas." },
            { title: "Mejor época", value: "Mayo–junio", description: "Ventana para actividades." },
          ],
          quickFactsImage1: { id: 6, url: "/uploads/qf1.jpg", alternativeText: "QF1" },
          quickFactsImage2: { id: 7, url: "/uploads/qf2.jpg", alternativeText: "QF2" },
          mapSection: {
            title: "Mapa del Destino",
            description: "Explora los puntos clave...",
            buttonLabel: "Ver Mapa",
            buttonUrl: "https://osm.org/map",
            image: { id: 8, url: "/uploads/map.jpg", alternativeText: "Mapa" },
          },
          finalCta: {
            title: "Tu viaje comienza aquí",
            description: "Planea tu estancia...",
            buttonLabel: "Comenzar",
            buttonLink: "/sitios",
          },
        },
      };

      const out = transformHomepage(item, "es");

      // Hero
      expect(out.hero.title).toBe("Puerto Agua Verde &");
      expect(out.hero.titleHighlight).toBe("Rancho San Cosme");
      expect(out.hero.description).toContain("tranquilidad");
      expect(out.hero.ctaLabel).toBe("Explorar el destino");
      expect(out.hero.images).toHaveLength(2);
      expect(out.hero.images[0].url).toContain("/uploads/hero1.jpg");
      expect(out.hero.images[0].alt).toBe("Coast");

      // Highlights
      expect(out.highlights.header.title).toBe("Lo más destacado");
      expect(out.highlights.items[0].link).toBe("/experiencias");

      // QuickFacts
      expect(out.quickFacts.header.title).toBe("Lo esencial");
      expect(out.quickFacts.items).toHaveLength(2);
      expect(out.quickFacts.images).toHaveLength(2);
      expect(out.quickFacts.images[0]).toContain("/uploads/qf1.jpg");

      // Map
      expect(out.mapSection.title).toBe("Mapa del Destino");
      expect(out.mapSection.buttonUrl).toBe("https://osm.org/map");
      expect(out.mapSection.image).toContain("/uploads/map.jpg");

      // CTA
      expect(out.finalCta.title).toBe("Tu viaje comienza aquí");
      expect(out.finalCta.buttonLink).toBe("/sitios");
    });

    it("handles missing optional fields gracefully", () => {
      const item: StrapiItem<HomepageAttributes> = {
        id: 1,
        attributes: {},
      };

      const out = transformHomepage(item, "es");

      expect(out.hero.title).toBe("");
      expect(out.hero.images).toHaveLength(0);
      expect(out.highlights.items).toHaveLength(0);
      expect(out.quickFacts.items).toHaveLength(0);
      expect(out.quickFacts.images).toHaveLength(2);
      expect(out.mapSection.title).toBe("");
      expect(out.finalCta.title).toBe("");
    });

    it("handles flat (non-wrapped) item format from Strapi v5", () => {
      const item = {
        id: 1,
        hero: {
          title: "Test",
          titleHighlight: "Highlight",
          description: "Desc",
          ctaLabel: "CTA",
          ctaLink: "/link",
        },
        highlightsHeader: { title: "H", subtitle: "S" },
        highlights: [],
        quickFactsHeader: { title: "Q", subtitle: "S" },
        quickFacts: [],
        mapSection: { title: "Map", description: "D", buttonLabel: "Btn", buttonUrl: "#" },
        finalCta: { title: "CTA", description: "D", buttonLabel: "B", buttonLink: "#" },
      } as any;

      const out = transformHomepage(item, "es");

      expect(out.hero.title).toBe("Test");
      expect(out.hero.titleHighlight).toBe("Highlight");
    });
  });

  // ───────────────────────────────────────────────────────────────────
  // Regression tests for fixes introduced after the listing-detail audit
  // (see git history). These guard against the specific v5 shape changes
  // (bare relation arrays, null values) that broke `/sitios/[slug]`.
  // ───────────────────────────────────────────────────────────────────

  describe("transformListing — contact.instagram/facebook → social merge", () => {
    it("adds an instagram social link derived from contact.instagram (bare handle)", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, instagram: "@pav_ejemplo" },
        },
      };
      const out = transformListing(item as any, "es");
      const ig = out.social?.find((s) => s.platform === "instagram");
      expect(ig).toBeTruthy();
      expect(ig?.handle).toBe("pav_ejemplo");
      expect(ig?.url).toBe("https://instagram.com/pav_ejemplo");
    });

    it("adds a facebook social link derived from contact.facebook (bare handle)", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, facebook: "pav.ejemplo" },
        },
      };
      const out = transformListing(item as any, "es");
      const fb = out.social?.find((s) => s.platform === "facebook");
      expect(fb).toBeTruthy();
      expect(fb?.handle).toBe("pav.ejemplo");
      expect(fb?.url).toBe("https://facebook.com/pav.ejemplo");
    });

    it("uses the explicit URL when contact.instagram is a full URL", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, instagram: "https://instagram.com/pav" },
        },
      };
      const out = transformListing(item as any, "es");
      const ig = out.social?.find((s) => s.platform === "instagram");
      expect(ig?.url).toBe("https://instagram.com/pav");
    });

    it("ignores empty contact fields without producing ghost social entries", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, instagram: "", facebook: "   " },
        },
      };
      const out = transformListing(item as any, "es");
      expect(out.social).toBeUndefined();
    });

    it("synthesizes a whatsapp SocialLink from contact.whatsappCountryCode/Number", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, whatsappCountryCode: "+52", whatsappNumber: "6131226237" },
        },
      };
      const out = transformListing(item as any, "es");
      const wa = out.social!.find((s) => s.platform === "whatsapp");
      expect(wa).toBeTruthy();
      expect(wa?.handle).toBe("+52 613 122 6237");
      expect(wa?.url).toBe("https://wa.me/526131226237");
    });

    it("synthesizes phone and email SocialLinks from contact fields", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: {
            id: 9,
            phoneNumber: "6131226237",
            email: "info@example.com",
          },
        },
      };
      const out = transformListing(item as any, "es");
      const platforms = out.social!.map((s) => s.platform).sort();
      expect(platforms).toEqual(["email", "phone"]);
      expect(out.social!.find((s) => s.platform === "phone")?.url).toBe("tel:+526131226237");
      expect(out.social!.find((s) => s.platform === "email")?.url).toBe("mailto:info@example.com");
    });

    it("synthesizes a tiktok SocialLink from contact.tiktok", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, tiktok: "@pav_bcs" },
        },
      };
      const out = transformListing(item as any, "es");
      const tt = out.social!.find((s) => s.platform === "tiktok");
      expect(tt).toBeTruthy();
      expect(tt?.handle).toBe("pav_bcs");
      expect(tt?.url).toBe("https://tiktok.com/@pav_bcs");
    });

    it("synthesizes a web SocialLink from contact.website (raw URL)", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, website: "https://minegocio.com" },
        },
      };
      const out = transformListing(item as any, "es");
      const web = out.social!.find((s) => s.platform === "web");
      expect(web).toBeTruthy();
      expect(web?.url).toBe("https://minegocio.com");
    });

    it("prepends https:// to a bare website URL", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, website: "minegocio.com" },
        },
      };
      const out = transformListing(item as any, "es");
      const web = out.social!.find((s) => s.platform === "web");
      expect(web?.url).toBe("https://minegocio.com");
    });
  });

  describe("transformListing — Strapi v5 bare-array relation shape", () => {
    it("reads members from a bare array (v5) not `{ data: [...] }` (v4)", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          members: [
            { id: 10, name: "Ana", slug: "ana", role: "Guía" },
          ],
        },
      };
      const out = transformListing(item as any, "es");
      expect(out.members).toHaveLength(1);
      expect(out.members?.[0].name).toBe("Ana");
      expect(out.members?.[0].role).toBe("Guía");
    });

    it("reads relatedListings from a bare array (v5)", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          relatedListings: [
            { id: 100, slug: "other-1", title: "Other 1" },
            { id: 101, slug: "other-2", title: "Other 2" },
          ],
        },
      };
      const out = transformListing(item as any, "es");
      expect(out.relatedSites).toEqual(["100", "101"]);
    });

    it("still supports the Strapi v4 `{ data: [...] }` shape", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          members: {
            data: [
              { id: 10, name: "Ana", slug: "ana", role: "Guía" },
            ],
          },
          relatedListings: {
            data: [
              { id: 100, slug: "other-1", title: "Other 1" },
            ],
          },
        },
      };
      const out = transformListing(item as any, "es");
      expect(out.members).toHaveLength(1);
      expect(out.members?.[0].name).toBe("Ana");
      expect(out.relatedSites).toEqual(["100"]);
    });
  });

  describe("transformListing — null guards (v5 sometimes returns explicit null)", () => {
    it("does not crash when contact.facebook is null", () => {
      const item = {
        id: 1,
        attributes: {
          title: "Test",
          slug: "test",
          contact: { id: 9, instagram: null, facebook: null },
        },
      };
      expect(() => transformListing(item as any, "es")).not.toThrow();
      const out = transformListing(item as any, "es");
      expect(out.social).toBeUndefined();
    });

    it("does not crash when community-member role/bio is null (per `transformCommunityMemberSummary`)", () => {
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
              role: null,
              bio: null,
              pullQuote: null,
              legacyNote: null,
              phone: null,
              whatsapp: null,
            },
          ],
        },
      };
      const out = transformListing(item as any, "es");
      expect(out.members?.[0].name).toBe("Ana");
      expect(out.members?.[0].role).toBeUndefined();
    });
  });
});
