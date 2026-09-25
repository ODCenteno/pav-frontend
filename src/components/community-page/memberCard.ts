/**
 * Build-time helpers for the member (artisan) cards rendered by
 * `site-detail/MemberStrip.astro`. Pure functions: no Astro, no DOM.
 */
import type { SocialLink } from "@/types/common.type";
import { SOCIAL_CONFIG } from "@/utils/socialConfig";
import type { CommunityMember } from "@/types/community.type";

/** Bio fallback budget, kept under the 200-char CMS `shortDescription` cap. */
export const SUMMARY_MAX_LENGTH = 160;

/** Contact platforms shown first on the card, in this order. */
const PRIMARY_CONTACTS = ["whatsapp", "phone"] as const;

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/^\s{0,3}(#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/gm, "") // block markers
    .replace(/[*_`~]/g, "") // inline emphasis and code
    .replace(/\s+/g, " ")
    .trim();
}

function truncateOnWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);
  const lastSpace = window.lastIndexOf(" ");
  const kept = (lastSpace > 0 ? window.slice(0, lastSpace) : text.slice(0, max)).trimEnd();
  return `${kept}…`;
}

/**
 * Card text: the editor's `shortDescription`, or the bio flattened to plain
 * text and truncated on a word boundary.
 */
export function memberSummary(member: Pick<CommunityMember, "shortDescription" | "bio">): string | undefined {
  const short = member.shortDescription?.trim();
  if (short) return short;
  const bio = member.bio ? markdownToPlainText(member.bio) : "";
  return bio ? truncateOnWord(bio, SUMMARY_MAX_LENGTH) : undefined;
}

/**
 * Contact links for the card and the modal: WhatsApp and phone first, then
 * the remaining social links. `phone` / `whatsapp` member fields fill in
 * when the contact component did not already produce those links.
 */
export function memberContactLinks(
  member: Pick<CommunityMember, "social" | "phone" | "whatsapp">
): SocialLink[] {
  const social = member.social ?? [];
  const has = (platform: SocialLink["platform"]) => social.some((l) => l.platform === platform);
  const extra: SocialLink[] = [];

  const whatsapp = member.whatsapp?.replace(/\D/g, "");
  if (whatsapp && !has("whatsapp")) {
    extra.push({ platform: "whatsapp", handle: whatsapp, url: `https://wa.me/${whatsapp}` });
  }
  const phone = member.phone?.trim();
  if (phone && !has("phone")) {
    extra.push({ platform: "phone", handle: phone, url: `tel:${phone.replace(/\s+/g, "")}` });
  }

  const all = [...social, ...extra];
  const rank = (l: SocialLink) => {
    const i = (PRIMARY_CONTACTS as readonly string[]).indexOf(l.platform);
    return i === -1 ? PRIMARY_CONTACTS.length : i;
  };
  // Array.prototype.sort is stable, so non-primary links keep their order.
  return all.sort((a, b) => rank(a) - rank(b));
}

/** Accessible name of a contact button (same wording as the member modal). */
export function contactLinkLabel(
  link: Pick<SocialLink, "platform">,
  labels: { call: string; email: string }
): string {
  if (link.platform === "phone") return labels.call;
  if (link.platform === "email") return labels.email;
  return SOCIAL_CONFIG[link.platform]?.label ?? link.platform;
}

/** `tel:` / `mailto:` hand off to the OS; web links open in a new tab. */
export function contactLinkTarget(link: Pick<SocialLink, "platform">): "_self" | "_blank" {
  return link.platform === "phone" || link.platform === "email" ? "_self" : "_blank";
}
