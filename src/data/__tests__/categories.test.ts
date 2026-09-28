import { describe, it, expect } from 'vitest';
import {
  categories,
  CURRENT_CATEGORY_SLUGS,
  HIDE_CONTACT_CATEGORY_SLUGS,
  toCurrentCategorySlug,
} from '../categories';

describe('current categories', () => {
  it('has exactly 4 categories with orders 1 to 4', () => {
    expect(categories).toHaveLength(4);
    expect(categories.map((c) => c.order)).toEqual([1, 2, 3, 4]);
  });

  it('has unique slugs matching the contract order', () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(4);
    expect(slugs).toEqual(['experiences', 'gastronomy', 'services', 'crafts']);
    expect([...CURRENT_CATEGORY_SLUGS]).toEqual(slugs);
  });

  it('has non-empty es-MX and en labels', () => {
    for (const c of categories) {
      expect(c.name['es-MX'].length).toBeGreaterThan(0);
      expect(c.name.en.length).toBeGreaterThan(0);
    }
    expect(categories[0].name).toMatchObject({
      'es-MX': 'Experiencias turísticas comunitarias',
      en: 'Community tourism experiences',
    });
  });

  it('only services hides contact', () => {
    expect([...HIDE_CONTACT_CATEGORY_SLUGS]).toEqual(['services']);
  });
});

describe('toCurrentCategorySlug (contract phase — no legacy slugs)', () => {
  it('accepts any current slug', () => {
    expect(toCurrentCategorySlug('experiences')).toBe('experiences');
    expect(toCurrentCategorySlug('gastronomy')).toBe('gastronomy');
    expect(toCurrentCategorySlug('services')).toBe('services');
    expect(toCurrentCategorySlug('crafts')).toBe('crafts');
  });

  it('rejects the retired legacy slugs and any other unknown slug', () => {
    for (const legacy of ['sites', 'accommodation', 'restaurants', 'unknown']) {
      expect(toCurrentCategorySlug(legacy)).toBeUndefined();
    }
  });
});
