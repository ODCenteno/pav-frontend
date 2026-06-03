import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFavorites, toggleFavorite, isFavorite } from '../favorites';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window
const dispatchEventMock = vi.fn();
Object.defineProperty(global, 'window', {
  value: {
    dispatchEvent: dispatchEventMock,
    localStorage,
  },
  writable: true,
});

describe('favorites', () => {
  beforeEach(() => {
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    dispatchEventMock.mockClear();
  });

  describe('getFavorites', () => {
    it('should return empty array when no data in localStorage', () => {
      const result = getFavorites();
      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('pav_favorites');
    });

    it('should return parsed array when data exists', () => {
      localStorageMock.store['pav_favorites'] = JSON.stringify(['id-1', 'id-2']);
      const result = getFavorites();
      expect(result).toEqual(['id-1', 'id-2']);
    });

    it('should return empty array when localStorage returns null', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      const result = getFavorites();
      expect(result).toEqual([]);
    });
  });

  describe('toggleFavorite', () => {
    it('should add new favorite and return true', () => {
      const result = toggleFavorite('new-id');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pav_favorites',
        JSON.stringify(['new-id'])
      );
    });

    it('should remove existing favorite and return false', () => {
      localStorageMock.store['pav_favorites'] = JSON.stringify(['existing-id']);
      const result = toggleFavorite('existing-id');
      expect(result).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pav_favorites',
        JSON.stringify([])
      );
    });

    it('should not duplicate favorites', () => {
      localStorageMock.store['pav_favorites'] = JSON.stringify(['id-1', 'id-2']);
      toggleFavorite('id-1');
      toggleFavorite('id-1'); // toggle again
      const stored = JSON.parse(localStorageMock.store['pav_favorites']);
      expect(stored.filter((id: string) => id === 'id-1').length).toBe(1);
    });

    it('should dispatch custom event after toggle', () => {
      toggleFavorite('test-id');
      expect(dispatchEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'favorites-updated',
          detail: expect.objectContaining({ favorites: ['test-id'] }),
        })
      );
    });

    it('should handle multiple favorites', () => {
      toggleFavorite('id-1');
      toggleFavorite('id-2');
      toggleFavorite('id-3');
      const stored = JSON.parse(localStorageMock.store['pav_favorites']);
      expect(stored).toEqual(['id-1', 'id-2', 'id-3']);
    });
  });

  describe('isFavorite', () => {
    it('should return true when id exists in favorites', () => {
      localStorageMock.store['pav_favorites'] = JSON.stringify(['id-1', 'id-2']);
      expect(isFavorite('id-1')).toBe(true);
      expect(isFavorite('id-2')).toBe(true);
    });

    it('should return false when id does not exist', () => {
      localStorageMock.store['pav_favorites'] = JSON.stringify(['id-1']);
      expect(isFavorite('id-999')).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      const result = isFavorite('any-id');
      expect(result).toBe(false);
    });
  });
});