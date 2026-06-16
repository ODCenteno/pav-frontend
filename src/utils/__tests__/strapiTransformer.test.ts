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
  transformTeamMember,
  transformOrganization,
  transformSiteContent,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type TeamMemberAttributes,
  type OrganizationAttributes,
  type SiteContentAttributes,
} from "../strapiTransformer";

describe("strapiTransformer", () => {
  describe("transformCategory", () => {
    it("transforms a v5 attributes-wrapped item", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 1,
        attributes: {
          name: "Experiencias",
          slug: "experiences",
          icon: "adventure",
          color: "#E87A5D",
          order: 1,
          isActive: true,
        },
      };
      const out = transformCategory(item);
      expect(out.id).toBe("1");
      expect(out.slug).toBe("experiences");
      expect(out.name.es).toBe("Experiencias");
      expect(out.name.en).toBe("Experiencias");
      expect(out.icon).toBe("adventure");
      expect(out.color).toBe("#E87A5D");
      expect(out.order).toBe(1);
      expect(out.isActive).toBe(true);
    });

    it("transforms a flattened item (Strapi v4-style fallback)", () => {
      const item = {
        id: 2,
        slug: "restaurants",
        name: "Restaurantes",
      } as any;
      const out = transformCategory(item);
      expect(out.slug).toBe("restaurants");
      expect(out.name.es).toBe("Restaurantes");
    });

    it("returns empty slots when name is undefined", () => {
      const item: StrapiItem<CategoryAttributes> = {
        id: 3,
        attributes: { slug: "x" } as any,
      };
      const out = transformCategory(item);
      expect(out.name.es).toBe("");
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
            data: {
              id: 1,
              attributes: { url: "/uploads/isla.jpg" },
            },
          },
          gallery: {
            data: [
              { id: 2, attributes: { url: "/uploads/a.jpg" } },
              { id: 3, attributes: { url: "/uploads/b.jpg" } },
            ],
          },
          price: "$60 USD",
          isFeatured: true,
          order: 1,
          category: {
            data: {
              id: 1,
              attributes: { name: "Experiencias", slug: "experiences" },
            },
          },
          categoryId: "experiences",
          tags: ["Aventura", "Mar"],
          location: {
            lat: 25.5,
            lng: -111.0,
            name: "Muelle de Agua Verde",
          },
        },
      };
      const out = transformListing(item, "es");
      expect(out.id).toBe("10");
      expect(out.slug).toBe("tour-isla-catalana");
      expect(out.name.es).toBe("Tour Isla Catalana");
      expect(out.name.en).toBe("Tour Isla Catalana");
      expect(out.shortDescription?.es).toBe("Half-day tour with snorkeling.");
      expect(out.categoryId).toBe("experiences");
      expect(out.category?.slug).toBe("experiences");
      expect(out.tags).toHaveLength(2);
      expect(out.tags?.[0].es).toBe("Aventura");
      expect(out.location?.lat).toBe(25.5);
      expect(out.location?.lng).toBe(-111.0);
      expect(out.image).toContain("/uploads/isla.jpg");
      expect(out.media?.mainImageUrl).toContain("/uploads/isla.jpg");
      expect(out.media?.galleryUrls).toHaveLength(2);
      expect(out.pricing?.price).toBe("$60 USD");
      expect(out.isFeatured).toBe(true);
      expect(out.href).toEqual({ es: expect.stringContaining("/sitios/"), en: expect.stringContaining("/en/sitios/") });
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
      expect(out.galleryUrls).toBeUndefined();
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
      expect(out.description?.es).toContain("Hello");
      expect(out.description?.es).toContain("World");
    });
  });

  describe("transformTeamMember", () => {
    it("transforms a team member with photo URL", () => {
      const item: StrapiItem<TeamMemberAttributes> = {
        id: 1,
        attributes: {
          name: "Juan Pérez",
          role: { es: "Coordinador", en: "Coordinator" },
          shortBio: { es: "Bio ES", en: "Bio EN" },
          photo: { data: { id: 1, attributes: { url: "/uploads/juan.jpg" } } },
          links: { email: "juan@example.com" },
          order: 1,
          isFeatured: true,
        },
      };
      const out = transformTeamMember(item);
      expect(out.id).toBe("1");
      expect(out.name).toBe("Juan Pérez");
      expect(out.role?.es).toBe("Coordinador");
      expect(out.photo).toContain("/uploads/juan.jpg");
      expect(out.links?.email).toBe("juan@example.com");
    });

    it("returns empty photo when none provided", () => {
      const item: StrapiItem<TeamMemberAttributes> = {
        id: 2,
        attributes: { name: "Ana" },
      };
      const out = transformTeamMember(item);
      expect(out.photo).toBeUndefined();
    });
  });

  describe("transformOrganization", () => {
    it("transforms an organization with logo", () => {
      const item: StrapiItem<OrganizationAttributes> = {
        id: 1,
        attributes: {
          name: "Cooperativa Agua Verde",
          type: "community",
          shortDescription: { es: "Cooperativa local", en: "Local cooperative" },
          logo: { data: { id: 1, attributes: { url: "/uploads/coop.png" } } },
          order: 1,
          isFeatured: true,
        },
      };
      const out = transformOrganization(item);
      expect(out.name).toBe("Cooperativa Agua Verde");
      expect(out.type).toBe("community");
      expect(out.logo).toContain("/uploads/coop.png");
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
          extraData: { mission: { es: "M-ES", en: "M-EN" } },
        },
      };
      const out = transformSiteContent(item, "es");
      expect(out.id).toBe("1");
      expect(out.documentId).toBe("abc");
      expect(out.key).toBe("about-values");
      expect(out.title.es).toBe("Nuestros valores");
      expect((out.extraData as any).mission.es).toBe("M-ES");
    });
  });
});
