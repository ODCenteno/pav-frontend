/**
 * Index of the snapped photo in a one-photo-per-page feed, from the scroll
 * offset along the feed axis and the size of one page. Clamped to the photos.
 */
export function feedIndex(offset: number, pageSize: number, total: number): number {
  if (total <= 0 || pageSize <= 0) return 0;
  return Math.min(total - 1, Math.max(0, Math.round(offset / pageSize)));
}
