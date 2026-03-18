const STORAGE_KEY = "pav_favorites";

export interface FavoriteItem {
  id: string;
  slug: string;
  name: string;
  image: string;
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(id: string): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  let isAdded = false;

  if (index === -1) {
    favorites.push(id);
    isAdded = true;
  } else {
    favorites.splice(index, 1);
    isAdded = false;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  
  // Dispatch a custom event for other components to listen
  window.dispatchEvent(new CustomEvent("favorites-updated", { detail: { favorites } }));
  
  return isAdded;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
