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
 * Contract §5b / §10: listings and members expose `phone` / `whatsapp` as
 * E.164, composed from `*CountryCode` + `*Number` only. The legacy free-text
 * `phone` / `whatsapp` fields are gone from the backend, so there is no
 * fallback left; values that cannot be composed are dropped.
 */

function listingItem(contact: Record<string, unknown>): StrapiItem<ListingAttributes> {
  return { id: 1, attributes: { title: "Test", slug: "test", contact } as unknown as ListingAttributes };
}

function memberItem(attributes: Partial<CommunityMemberAttributes>): StrapiItem<CommunityMemberAttributes> {
  return { id: 5, attributes: { name: "Artisan", slug: "artisan", ...attributes } as CommunityMemberAttributes };
}

describe("transformListing — phone numbers (§5b)", () => {
  it("composes E.164 from the country code and national number fields", () => {
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

  it("drops a national number that is not exactly 10 digits", () => {
    const out = transformListing(listingItem({ phoneNumber: "12345", email: "a@b.mx" }));
    expect(out.contact?.phone).toBeUndefined();
    expect(out.contact?.email).toBe("a@b.mx");
    expect(out.social?.map((s) => s.platform)).toEqual(["email"]);
  });

  it("does not leak the raw contract fields into the view model", () => {
    const out = transformListing(listingItem({ phoneCountryCode: "+52", phoneNumber: "6131234567" }));
    expect(out.contact).not.toHaveProperty("phoneNumber");
    expect(out.contact).not.toHaveProperty("phoneCountryCode");
  });

  it("builds tel: and wa.me social links from the composed numbers", () => {
    const out = transformListing(
      listingItem({
        phoneNumber: "6131234567",
        whatsappCountryCode: "+52",
        whatsappNumber: "6139876543",
      }),
    );
    const phone = out.social!.find((s) => s.platform === "phone");
    const wa = out.social!.find((s) => s.platform === "whatsapp");
    expect(phone).toEqual({ platform: "phone", handle: "+52 613 123 4567", url: "tel:+526131234567" });
    expect(wa).toEqual({ platform: "whatsapp", handle: "+52 613 987 6543", url: "https://wa.me/526139876543" });
  });
});

describe("transformCommunityMember — phone numbers (§5b)", () => {
  it("composes E.164 from the contact fields", () => {
    const out = transformCommunityMember(
      memberItem({ contact: { whatsappCountryCode: "+52", whatsappNumber: "6131234567" } }),
    );
    expect(out.whatsapp).toBe("+526131234567");
  });

  it("normalizes the social-link fallback when contact has no numbers", () => {
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

  it("drops values that cannot be composed or normalized", () => {
    const out = transformCommunityMember(memberItem({ contact: { phoneNumber: "12345" } }));
    expect(out.phone).toBeUndefined();
    expect(out.whatsapp).toBeUndefined();
    expect(out.social.filter((s) => s.platform === "phone" || s.platform === "whatsapp")).toEqual([]);
  });
});
