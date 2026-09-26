/**
 * Pure helpers for the filterable listing carousel (`ListingCarousel.astro`).
 *
 * Chips always show the 4 contract categories (contract §1) in order, and
 * each listing is filed under its current slug, so the carousel works before
 * and after the backend category migration.
 */
import type { Listing } from '@/types/listing.type';
import { categories, toCurrentCategorySlug } from '@/data/categories';

export interface CarouselChip {
  id: string;
  label: string;
}

/** The contract categories as filter chips, in contract order. */
export function carouselChips(locale: string): CarouselChip[] {
  const key = locale.toLowerCase().startsWith('en') ? 'en' : 'es-MX';
  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ id: c.slug, label: c.name[key] }));
}

/**
 * Current category slug for a listing: the populated category wins over
 * `categoryId`, legacy slugs map through the contract table, and unknown
 * slugs yield '' (the listing then shows only under "all").
 */
export function carouselCategoryOf(listing: Listing): string {
  const slug = listing.category?.slug || listing.categoryId || '';
  return toCurrentCategorySlug(slug) ?? '';
}

/** Featured listings from every community, in their original order. */
export function featuredListings(listings: Listing[]): Listing[] {
  return listings.filter((l) => l.isFeatured === true);
}
