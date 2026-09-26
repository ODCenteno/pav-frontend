import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) =>
    locale === "en" ? `/en/${path.replace(/^\/+/, "")}` : `/${path.replace(/^\/+/, "")}`,
}));

import {
  transformListing,
  transformCommunityMember,
  type StrapiItem,
  type ListingAttributes,
  type CommunityMemberAttributes,
} from "../strapiTransformer";

/**
 * Contract §5b: listings and members expose `phone` / `whatsapp` as E.164,
 * composed from `*CountryCode` + `*Number`, falling back to the legacy
 * free-text fields normalized with the shared rules. Values that cannot be
 * normalized are dropped.
 */

function listingItem(contact: Record<string, unknown>): StrapiItem<ListingAttributes> {
  return { id: 1, attributes: { title: "Test", slug: "test", contact } as unknown as ListingAttributes };
}

function memberItem(attributes: Partial<CommunityMemberAttributes>): StrapiItem<CommunityMemberAttributes> {
  return { id: 5, attributes: { name: "Artisan", slug: "artisan", ...attributes } as CommunityMemberAttributes };
}

describe("transformListing — phone numbers (§5b)", () => {
  it("composes E.164 from the new country code and national number fields", () => {
    const out = transformListing(
      listingItem({
        phoneCountryCode: "+52",
        phoneNumber: "6131234567",
        whatsappCountryCode: "+52",
        whatsappNumber: "6139876543",
      }),
    );
    expect(out.contact?.phone).toBe("+526131234567");
    expect(out.contact?.whatsapp).toBe("+526139876543");
  });

  it("defaults a missing country code to +52", () => {
    const out = transformListing(listingItem({ phoneNumber: "6131234567" }));
    expect(out.contact?.phone).toBe("+526131234567");
  });

  it("prefers the new fields over the legacy ones", () => {
    const out = transformListing(
      listingItem({ phoneNumber: "6131234567", phone: "612 000 0000" }),
    );
    expect(out.contact?.phone).toBe("+526131234567");
  });

  it("falls back to the legacy fields normalized with the §5b rules", () => {
    const out = transformListing(
      listingItem({ phone: "613-123-4567", whatsapp: "5216131234567" }),
    );
    expect(out.contact?.phone).toBe("+526131234567");
    expect(out.contact?.whatsapp).toBe("+526131234567");
  });

  it("drops legacy values that cannot be normalized", () => {
    const out = transformListing(listingItem({ phone: "12345", whatsapp: "n/a", email: "a@b.mx" }));
    expect(out.contact?.phone).toBeUndefined();
    expect(out.contact?.whatsapp).toBeUndefined();
    expect(out.contact?.email).toBe("a@b.mx");
    expect(out.social?.map((s) => s.platform)).toEqual(["email"]);
  });

  it("does not leak the raw contract fields into the view model", () => {
    const out = transformListing(listingItem({ phoneCountryCode: "+52", phoneNumber: "6131234567" }));
    expect(out.contact).not.toHaveProperty("phoneNumber");
    expect(out.contact).not.toHaveProperty("phoneCountryCode");
  });

  it("builds tel: and wa.me social links from the normalized numbers", () => {
    const out = transformListing(
      listingItem({ phoneNumber: "6131234567", whatsapp: "+52 1 613 987 6543" }),
    );
    const phone = out.social!.find((s) => s.platform === "phone");
    const wa = out.social!.find((s) => s.platform === "whatsapp");
    expect(phone).toEqual({ platform: "phone", handle: "+52 613 123 4567", url: "tel:+526131234567" });
    expect(wa).toEqual({ platform: "whatsapp", handle: "+52 613 987 6543", url: "https://wa.me/526139876543" });
  });
});

describe("transformCommunityMember — phone numbers (§5b)", () => {
  it("composes E.164 from the new contact fields", () => {
    const out = transformCommunityMember(
      memberItem({ contact: { whatsappCountryCode: "+52", whatsappNumber: "6131234567" } }),
    );
    expect(out.whatsapp).toBe("+526131234567");
  });

  it("normalizes legacy contact values", () => {
    const out = transformCommunityMember(
      memberItem({ contact: { phone: "+52 614 123 4567", whatsapp: "5216141234567" } }),
    );
    expect(out.phone).toBe("+526141234567");
    expect(out.whatsapp).toBe("+526141234567");
  });

  it("normalizes the social-link fallback", () => {
    const out = transformCommunityMember(
      memberItem({
        social: [
          { platform: "whatsapp", handle: "526141234567" },
          { platform: "phone", url: "tel:+526141234567" },
        ],
      }),
    );
    expect(out.whatsapp).toBe("+526141234567");
    expect(out.phone).toBe("+526141234567");
  });

  it("drops values that cannot be normalized", () => {
    const out = transformCommunityMember(memberItem({ contact: { phone: "12345", whatsapp: "52123" } }));
    expect(out.phone).toBeUndefined();
    expect(out.whatsapp).toBeUndefined();
    expect(out.social.filter((s) => s.platform === "phone" || s.platform === "whatsapp")).toEqual([]);
  });
});
