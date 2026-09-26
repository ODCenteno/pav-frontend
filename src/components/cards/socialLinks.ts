import { SOCIAL_CONFIG } from "@/utils/socialConfig";
import { telHref, whatsappHref } from "@/utils/phone";
import type { Listing } from "@/types/listing.type";

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

/** Channels hidden when a listing sets `hideContact` (contract §5). */
const HIDDEN_CONTACT_KEYS = new Set(["whatsapp", "phone", "email"]);

/**
 * Card contact values: the `contact` component first, legacy top-level
 * fields second. With `hideContact`, direct-contact channels are blanked
 * while social profiles stay visible.
 */
export function cardContactInfo(item: Listing): Record<string, string> {
  const contact = item.contact ?? {};
  const legacy = item as unknown as Record<string, string | undefined>;
  const info: Record<string, string> = {};
  for (const key of ["whatsapp", "instagram", "facebook", "phone", "email"] as const) {
    const value = contact[key] || legacy[key] || "";
    info[key] = item.hideContact && HIDDEN_CONTACT_KEYS.has(key) ? "" : value;
  }
  return info;
}
