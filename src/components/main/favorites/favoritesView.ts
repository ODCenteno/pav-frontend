/**
 * Visibility rules for the favorites carousel (brief C3 · F8). Pure, so the
 * inline client script and the unit tests share one implementation.
 */

export interface FavoriteCard {
  id: string;
  /** Current contract category slug (`carouselCategoryOf`). */
  category: string;
}

export type FavoritesEmptyState = "none" | "no-favorites" | "no-matches";

export interface FavoritesViewState {
  visibleIds: string[];
  empty: FavoritesEmptyState;
}

/**
 * A card shows when it is a favorite and matches the active chip. Saved ids
 * that no longer match a card on the page (unpublished listings) do not
 * count as favorites, so the visitor sees the "no favorites" state.
 */
export function favoritesViewState(cards: FavoriteCard[], favorites: string[], filter: string): FavoritesViewState {
  const saved = new Set(favorites);
  const favoriteCards = cards.filter((c) => saved.has(c.id));
  const visibleIds = favoriteCards
    .filter((c) => filter === "all" || c.category === filter)
    .map((c) => c.id);

  let empty: FavoritesEmptyState = "none";
  if (favoriteCards.length === 0) empty = "no-favorites";
  else if (visibleIds.length === 0) empty = "no-matches";

  return { visibleIds, empty };
}
