/**
 * Build a public URL for a social handle, given the platform.
 *
 * Used by both `SiteSummary.astro` (the Contact card) and
 * `SocialLinks.astro` (the "Follow us" block) so the same handle always
 * resolves to the same URL regardless of where it's rendered.
 */

import { telHref, whatsappHref } from "./phone";

export interface SocialHandle {
  platform: string;
  handle?: string;
  url?: string;
}

/**
 * Resolve a social entry to a usable URL.
 *
 * Rules:
 *  - If the entry already has a URL, return it.
 *  - Otherwise derive a platform-specific URL from the handle:
 *      - instagram: strip leading `@`, append to instagram.com
 *      - facebook:   pass through to facebook.com (handle is a page slug or full URL)
 *      - whatsapp:   E.164 wa.me link via `whatsappHref` (contract §5b)
 *      - phone:      E.164 tel: link via `telHref` (contract §5b)
 *      - a whatsapp/phone handle that cannot be normalized resolves to `#`
 *      - everything else: fall back to the raw handle or `#`
 */
export function socialUrl(link: SocialHandle): string {
  if (link.url) return link.url;

  const handle = (link.handle ?? "").trim();
  if (!handle) return "#";

  if (link.platform === "instagram") {
    const h = handle.replace(/^@/, "");
    return handle.startsWith("http") ? handle : `https://instagram.com/${h}`;
  }
  if (link.platform === "facebook") {
    return handle.startsWith("http") ? handle : `https://facebook.com/${handle}`;
  }
  if (link.platform === "whatsapp") return whatsappHref(handle) ?? "#";
  if (link.platform === "phone") return telHref(handle) ?? "#";
  if (link.platform === "tiktok") {
    const h = handle.replace(/^@/, "");
    return handle.startsWith("http") ? handle : `https://tiktok.com/@${h}`;
  }
  return `#${handle}`;
}
