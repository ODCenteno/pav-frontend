/**
 * Contact channels a listing may show (contract §5 `hideContact`).
 *
 * RED's rule for listings with `hideContact` (the Servicios category):
 * "foto y descripción breve, sin contacto". Every channel is hidden —
 * phone, WhatsApp, email, website and social profiles. Location, map and
 * directions are not contact and stay visible.
 *
 * Cards and the site detail page read contact data only through this helper.
 */
import type { ContactInfo, SocialLink } from '../types/common.type';
import type { Listing } from '../types/listing.type';

export interface ListingContactChannels {
  contact: ContactInfo;
  social: SocialLink[];
}

export function listingContactChannels(
  listing: Pick<Listing, 'contact' | 'social' | 'hideContact'>,
): ListingContactChannels {
  if (listing.hideContact) return { contact: {}, social: [] };
  return { contact: listing.contact ?? {}, social: listing.social ?? [] };
}
