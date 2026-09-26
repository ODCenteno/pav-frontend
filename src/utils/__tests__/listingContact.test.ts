import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listingContactChannels } from "../listingContact";
import type { Listing } from "../../types/listing.type";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const listing: Listing = {
  id: "1",
  slug: "x",
  name: { "es-MX": "X", en: "X" },
  categoryId: "services",
  location: { lat: 25.5, lng: -111.07 },
  contact: {
    whatsapp: "+526131234567",
    phone: "+526131234567",
    email: "a@b.mx",
    instagram: "pav",
    facebook: "pav",
    tiktok: "pav",
    website: "https://pav.mx",
  },
  social: [
    { platform: "phone", handle: "+52 613 123 4567", url: "tel:+526131234567" },
    { platform: "instagram", handle: "pav", url: "https://instagram.com/pav" },
  ],
};

describe("listingContactChannels", () => {
  it("passes contact and social through when contact is visible", () => {
    const out = listingContactChannels(listing);
    expect(out.contact).toEqual(listing.contact);
    expect(out.social).toEqual(listing.social);
  });

  it("hides every channel, social profiles included, with hideContact", () => {
    const out = listingContactChannels({ ...listing, hideContact: true });
    expect(out.contact).toEqual({});
    expect(out.social).toEqual([]);
  });

  it("returns empty channels when the listing has none", () => {
    const out = listingContactChannels({ ...listing, contact: undefined, social: undefined });
    expect(out).toEqual({ contact: {}, social: [] });
  });
});

describe("hideContact surfaces read contact only through listingContactChannels", () => {
  const surfaces = [
    "pages/sitios/[slug].astro",
    "pages/en/sitios/[slug].astro",
    "components/cards/socialLinks.ts",
  ];

  it.each(surfaces)("%s", (rel) => {
    const source = readFileSync(resolve(SRC, rel), "utf8");
    expect(source).toContain("listingContactChannels(");
    expect(source).not.toMatch(/item\.(contact|social)\b/);
  });

  it("components/cards/CardMain.astro goes through cardContactInfo", () => {
    const source = readFileSync(resolve(SRC, "components/cards/CardMain.astro"), "utf8");
    expect(source).toContain("cardContactInfo(item)");
    expect(source).not.toMatch(/item\.(contact|social)\b/);
  });
});
