import { describe, it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import { transformCommunity, transformListing, transformCommunityMember, type CommunityAttributes, type ListingAttributes, type CommunityMemberAttributes, type StrapiItem } from "../strapiTransformer";
import { communities } from "../../data/communities";

const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

function communityItem(attributes: Partial<CommunityAttributes>): StrapiItem<CommunityAttributes> {
  return { id: 42, attributes: { slug: "puerto-agua-verde", ...attributes } as CommunityAttributes };
}

describe("transformCommunity: tagline and description", () => {
  it("passes the localized description and tagline through for each locale", () => {
    const item = communityItem({
      tagline: { "es-MX": "Pueblo pesquero", en: "Fishing village" },
      description: { "es-MX": "Primer párrafo.\n\nSegundo.", en: "First paragraph.\n\nSecond." },
    });
    expect(transformCommunity(item, "es-MX")).toMatchObject({ tagline: "Pueblo pesquero", description: "Primer párrafo.\n\nSegundo." });
    expect(transformCommunity(item, "en")).toMatchObject({ tagline: "Fishing village", description: "First paragraph.\n\nSecond." });
  });

  it("leaves an empty description undefined (nothing to render)", () => {
    expect(transformCommunity(communityItem({ description: "" })).description).toBeUndefined();
    expect(transformCommunity(communityItem({ description: { "es-MX": "", en: "" } }), "en").description).toBeUndefined();
    expect(transformCommunity(communityItem({})).description).toBeUndefined();
  });

  it("completes an empty tagline from the community fixture", () => {
    const fixture = communities.find((c) => c.slug === "puerto-agua-verde")!;
    expect(transformCommunity(communityItem({ tagline: "" }), "en").tagline).toBe(fixture.tagline.en);
  });
});

describe("transformCommunity", () => {
  it("maps a full CMS item: identity, media, location and sections", () => {
    const out = transformCommunity(
      communityItem({
        name: { "es-MX": "Puerto Agua Verde", en: "Puerto Agua Verde" },
        tagline: "CMS tagline",
        description: "CMS description",
        order: 7,
        color: "#0CA58C",
        textColor: "#08806D",
        badgeIcon: { data: { id: 1, attributes: { url: "/uploads/badge.png" } } },
        heroImage: { url: "/uploads/hero.jpg" },
        location: { geoPoint: { lat: 25.5, lng: -111.1 } },
        googleMapsUrl: "https://maps.example.com",
        historyHeader: { title: "Historia", subtitle: "Sub" },
        historyMilestones: [{ year: "1937", text: { "es-MX": "Ejido", en: "Ejido" } }],
        historyText: "History text",
        touristMapImage: { url: "/uploads/map.png" },
        touristMapCaption: "Caption",
        highlightsHeader: { title: "Destacados", subtitle: "Sub" },
        highlights: [{ title: "H1", description: "D1", image: { url: "/uploads/h1.jpg" }, link: "/sitios" }],
        quickFactsHeader: { title: "Datos", subtitle: "Sub" },
        quickFacts: [{ title: "T", value: "V", description: "D" }],
        gallery: { data: [{ id: 1, attributes: { url: "/uploads/g1.jpg" } }] },
        finalCta: { title: "CTA", description: "Desc", buttonLabel: "Go", buttonLink: "/go" },
      }),
      "es-MX",
    );

    expect(out.id).toBe("42");
    expect(out.slug).toBe("puerto-agua-verde");
    expect(out.name).toBe("Puerto Agua Verde");
    expect(out.tagline).toBe("CMS tagline");
    expect(out.description).toBe("CMS description");
    expect(out.order).toBe(7);
    expect(out.color).toBe("#0CA58C");
    expect(out.textColor).toBe("#08806D");
    expect(out.badgeIcon).toBe("http://localhost:1337/uploads/badge.png");
    expect(out.heroImage).toBe("http://localhost:1337/uploads/hero.jpg");
    expect(out.location).toEqual({ lat: 25.5, lng: -111.1 });
    expect(out.googleMapsUrl).toBe("https://maps.example.com");
    expect(out.historyHeader).toEqual({ title: "Historia", subtitle: "Sub" });
    expect(out.historyMilestones).toEqual([{ year: "1937", text: "Ejido" }]);
    expect(out.historyText).toBe("History text");
    expect(out.touristMapImage).toBe("http://localhost:1337/uploads/map.png");
    expect(out.touristMapCaption).toBe("Caption");
    expect(out.highlightsHeader).toEqual({ title: "Destacados", subtitle: "Sub" });
    expect(out.highlights).toEqual([
      { title: "H1", description: "D1", image: "http://localhost:1337/uploads/h1.jpg", alt: "", link: "/sitios" },
    ]);
    expect(out.quickFactsHeader).toEqual({ title: "Datos", subtitle: "Sub" });
    expect(out.quickFacts).toEqual([{ title: "T", value: "V", description: "D" }]);
    expect(out.gallery).toEqual(["http://localhost:1337/uploads/g1.jpg"]);
    expect(out.finalCta).toEqual({ title: "CTA", description: "Desc", buttonLabel: "Go", buttonLink: "/go" });
  });

  it("picks the localized name slot for the requested locale", () => {
    const out = transformCommunity(
      communityItem({
        name: { "es-MX": "Nombre ES", en: "Name EN" },
        tagline: { "es-MX": "Tagline ES", en: "Tagline EN" },
        color: "#0CA58C",
        textColor: "#08806D",
      }),
      "en",
    );
    expect(out.name).toBe("Name EN");
    expect(out.tagline).toBe("Tagline EN");
  });

  describe("per-field fixture fallback (CMS value wins when non-empty)", () => {
    it("fills color, textColor, name, order and location from the fixture by slug", () => {
      const out = transformCommunity(communityItem({}), "es-MX");
      const fixture = communities[0];
      expect(out.name).toBe(fixture.name["es-MX"]);
      expect(out.color).toBe(fixture.color);
      expect(out.textColor).toBe(fixture.textColor);
      expect(out.order).toBe(fixture.order);
      expect(out.location).toEqual(fixture.location);
      expect(out.tagline).toBe(fixture.tagline["es-MX"]);
    });

    it("keeps the CMS values when present", () => {
      const out = transformCommunity(
        communityItem({ color: "#111111", textColor: "#222222", order: 9, name: "CMS Name" }),
        "es-MX",
      );
      expect(out.color).toBe("#111111");
      expect(out.textColor).toBe("#222222");
      expect(out.order).toBe(9);
      expect(out.name).toBe("CMS Name");
    });

    it("falls back to the fixture iconPath when badgeIcon media is empty", () => {
      const out = transformCommunity(communityItem({}), "es-MX");
      expect(out.badgeIcon).toBe("/images/communities/fish.png");
    });

    it("falls back to a per-community landscape hero when heroImage is empty", () => {
      const pav = transformCommunity(
        { id: 1, attributes: { slug: "puerto-agua-verde" } as CommunityAttributes },
        "es-MX",
      );
      const rsc = transformCommunity(
        { id: 2, attributes: { slug: "rancho-san-cosme" } as CommunityAttributes },
        "es-MX",
      );
      expect(pav.heroImage).toBe("/images/PAV-Letrero-.webp");
      expect(rsc.heroImage).toBe("/images/pav-landscape-12.webp");
    });

    it("mock hero fallback files exist in public/", () => {
      expect(existsSync(path.join(PUBLIC_DIR, "/images/PAV-Letrero-.webp"))).toBe(true);
      expect(existsSync(path.join(PUBLIC_DIR, "/images/pav-landscape-12.webp"))).toBe(true);
    });
  });

  describe("section defaults", () => {
    it("defaults repeatable sections to [] and optional components to undefined", () => {
      const out = transformCommunity(communityItem({}), "es-MX");
      expect(out.historyMilestones).toEqual([]);
      expect(out.highlights).toEqual([]);
      expect(out.quickFacts).toEqual([]);
      expect(out.gallery).toEqual([]);
      expect(out.historyHeader).toBeUndefined();
      expect(out.historyText).toBeUndefined();
      expect(out.touristMapImage).toBeUndefined();
      expect(out.touristMapCaption).toBeUndefined();
      expect(out.highlightsHeader).toBeUndefined();
      expect(out.quickFactsHeader).toBeUndefined();
      expect(out.description).toBeUndefined();
      expect(out.googleMapsUrl).toBeUndefined();
      expect(out.finalCta).toBeUndefined();
    });

    it("keeps empty-string CMS values treated as empty (fixture completes them)", () => {
      const out = transformCommunity(
        communityItem({ color: "", textColor: "", name: "" }),
        "es-MX",
      );
      expect(out.color).toBe(communities[0].color);
      expect(out.textColor).toBe(communities[0].textColor);
      expect(out.name).toBe(communities[0].name["es-MX"]);
    });
  });

  describe("communities not present in the fixtures", () => {
    it("maps an unknown slug as-is without crashing", () => {
      const out = transformCommunity(
        {
          id: 9,
          attributes: {
            slug: "la-paz",
            name: "La Paz",
            color: "#123456",
            textColor: "#123456",
            order: 3,
          } as CommunityAttributes,
        },
        "es-MX",
      );
      expect(out.slug).toBe("la-paz");
      expect(out.name).toBe("La Paz");
      expect(out.color).toBe("#123456");
      expect(out.order).toBe(3);
      expect(out.badgeIcon).toBe("");
      expect(out.heroImage).toBeUndefined();
      expect(out.highlights).toEqual([]);
    });
  });
});

describe("transformListing — community and hideContact", () => {
  function listingItem(attributes: Partial<ListingAttributes>): StrapiItem<ListingAttributes> {
    return { id: 10, attributes: { title: "Tour", slug: "tour-a", ...attributes } as ListingAttributes };
  }

  it("maps a populated community relation", () => {
    const out = transformListing(
      listingItem({
        community: {
          data: {
            id: 1,
            attributes: {
              slug: "puerto-agua-verde",
              name: "Puerto Agua Verde",
              color: "#0CA58C",
              textColor: "#08806D",
              badgeIcon: { url: "/uploads/badge.png" },
            },
          },
        } as any,
      }),
      "es-MX",
    );
    expect(out.community).toEqual({
      slug: "puerto-agua-verde",
      name: "Puerto Agua Verde",
      color: "#0CA58C",
      textColor: "#08806D",
      badgeIcon: "http://localhost:1337/uploads/badge.png",
    });
  });

  it("completes empty relation fields from the fixture by slug (contract encoding)", () => {
    const out = transformListing(
      listingItem({
        community: { data: { id: 2, attributes: { slug: "rancho-san-cosme" } } } as any,
      }),
      "es-MX",
    );
    expect(out.community).toEqual({
      slug: "rancho-san-cosme",
      name: communities[1].name["es-MX"],
      color: communities[1].color,
      textColor: communities[1].textColor,
      badgeIcon: communities[1].iconPath,
    });
  });

  it("picks the localized fixture name for the en locale", () => {
    const out = transformListing(
      listingItem({
        community: { data: { id: 1, attributes: { slug: "puerto-agua-verde" } } } as any,
      }),
      "en",
    );
    expect(out.community?.name).toBe(communities[0].name.en);
  });

  it("leaves community undefined when the relation is absent (UI must not break)", () => {
    const out = transformListing(listingItem({}), "es-MX");
    expect(out.community).toBeUndefined();
  });

  it("leaves community undefined for an unknown community slug with no CMS identity", () => {
    const out = transformListing(
      listingItem({
        community: { data: { id: 9, attributes: { slug: "loreto" } } } as any,
      }),
      "es-MX",
    );
    // Mapped as-is: slug kept, no fixture completion available.
    expect(out.community?.slug).toBe("loreto");
    expect(out.community?.name).toBe("");
    expect(out.community?.color).toBe("");
  });

  it("sets hideContact true when the listing flag is true", () => {
    const out = transformListing(listingItem({ hideContact: true }), "es-MX");
    expect(out.hideContact).toBe(true);
  });

  it("derives hideContact only from the flag so editors can override the migration", () => {
    // The services default comes from the backend migration setting the
    // flag; an editor flipping the flag to false must show the contact
    // again, so the transformer must not re-derive it from the category.
    const servicesWithoutFlag = transformListing(
      listingItem({
        category: { data: { id: 3, attributes: { name: "Servicios", slug: "services" } } },
      }),
      "es-MX",
    );
    expect(servicesWithoutFlag.hideContact).toBe(false);

    const anyCategoryWithFlag = transformListing(
      listingItem({
        hideContact: true,
        category: { data: { id: 1, attributes: { name: "Experiencias", slug: "experiences" } } },
      }),
      "es-MX",
    );
    expect(anyCategoryWithFlag.hideContact).toBe(true);
  });

  it("defaults hideContact to false when the flag is absent", () => {
    const out = transformListing(
      listingItem({
        category: { data: { id: 1, attributes: { name: "Experiencias", slug: "experiences" } } },
      }),
      "es-MX",
    );
    expect(out.hideContact).toBe(false);
  });
});

describe("transformCommunityMember — community, shortDescription, phone, whatsapp", () => {
  function memberItem(attributes: Partial<CommunityMemberAttributes>): StrapiItem<CommunityMemberAttributes> {
    return { id: 5, attributes: { name: "Artisan", slug: "artisan", ...attributes } as CommunityMemberAttributes };
  }

  it("maps a populated community relation with fixture completion", () => {
    const out = transformCommunityMember(
      memberItem({
        community: {
          data: { id: 1, attributes: { slug: "puerto-agua-verde", color: "#0CA58C" } },
        } as any,
      }),
      "es-MX",
    );
    expect(out.community).toEqual({
      slug: "puerto-agua-verde",
      name: communities[0].name["es-MX"],
      color: "#0CA58C",
      textColor: communities[0].textColor,
      badgeIcon: communities[0].iconPath,
    });
  });

  it("leaves community undefined without a relation (the deprecated locality fallback is gone)", () => {
    const out = transformCommunityMember(memberItem({}), "es-MX");
    expect(out.community).toBeUndefined();
  });

  it("passes shortDescription through", () => {
    const out = transformCommunityMember(
      memberItem({ shortDescription: "Artesana de la comunidad" }),
      "es-MX",
    );
    expect(out.shortDescription).toBe("Artesana de la comunidad");
  });

  it("leaves shortDescription undefined when empty", () => {
    const out = transformCommunityMember(memberItem({}), "es-MX");
    expect(out.shortDescription).toBeUndefined();
  });

  it("takes phone and whatsapp from the contact component's countryCode + number fields", () => {
    const out = transformCommunityMember(
      memberItem({
        contact: {
          phoneCountryCode: "+52",
          phoneNumber: "6141234567",
          whatsappCountryCode: "+52",
          whatsappNumber: "6141234567",
        },
      }),
      "es-MX",
    );
    expect(out.phone).toBe("+526141234567");
    expect(out.whatsapp).toBe("+526141234567");
  });

  it("falls back to social links (platform phone/whatsapp) when contact is absent", () => {
    const out = transformCommunityMember(
      memberItem({
        social: [
          { platform: "whatsapp", handle: "526141234567", url: "https://wa.me/526141234567" },
          { platform: "phone", handle: "+52 614 123 4567", url: "tel:+526141234567" },
        ],
      }),
      "es-MX",
    );
    expect(out.whatsapp).toBe("+526141234567");
    expect(out.phone).toBe("+526141234567");
  });

  it("leaves phone/whatsapp undefined when neither source has them", () => {
    const out = transformCommunityMember(memberItem({}), "es-MX");
    expect(out.phone).toBeUndefined();
    expect(out.whatsapp).toBeUndefined();
  });
});
