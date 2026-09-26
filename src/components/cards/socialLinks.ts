import { SOCIAL_CONFIG } from "@/utils/socialConfig";
import { telHref, whatsappHref } from "@/utils/phone";
import type { Listing } from "@/types/listing.type";
import { listingContactChannels } from "@/utils/listingContact";

export interface CardSocialLink {
  key: string;
  href: string;
  icon: string;
  label: string;
}

/**
 * Resolve a card's contact values into icon links. Phone and WhatsApp go
 * through the shared E.164 helper (contract §5b) and are dropped when they
 * cannot be normalized; the other platforms keep the config URL prefix.
 */
export function cardSocialLinks(
  socialInfo: Record<string, string | undefined | null>,
): CardSocialLink[] {
  const links: CardSocialLink[] = [];
  for (const [key, raw] of Object.entries(socialInfo)) {
    const config = SOCIAL_CONFIG[key];
    const value = String(raw ?? "").trim();
    if (!config || !value) continue;

    let href: string | undefined;
    if (key === "whatsapp") href = whatsappHref(value);
    else if (key === "phone") href = telHref(value);
    else if (config.urlPrefix && !value.startsWith("http") && !value.startsWith(config.urlPrefix)) {
      href = `${config.urlPrefix}${value}`;
    } else href = value;

    if (href) links.push({ key, href, icon: config.icon, label: config.label });
  }
  return links;
}

/**
 * Card contact values: the `contact` component first (hidden entirely for
 * `hideContact` listings, see `listingContactChannels`), legacy top-level
 * mock fields second.
 */
export function cardContactInfo(listing: Listing): Record<string, string> {
  const { contact } = listingContactChannels(listing);
  const legacy = listing.hideContact ? {} : (listing as unknown as Record<string, string | undefined>);
  const info: Record<string, string> = {};
  for (const key of ["whatsapp", "instagram", "facebook", "phone", "email"] as const) {
    info[key] = contact[key] || legacy[key] || "";
  }
  return info;
}
