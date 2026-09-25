import { describe, it, expect } from 'vitest';
import {
  categories,
  CURRENT_CATEGORY_SLUGS,
  LEGACY_CATEGORY_SLUGS,
  LEGACY_CATEGORY_MAP,
  LOCALITY_TO_COMMUNITY,
  HIDE_CONTACT_CATEGORY_SLUGS,
  toCurrentCategorySlug,
} from '../categories';
import { COMMUNITY_SLUGS } from '../communities';

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

describe('legacy category mapping', () => {
  it('maps every legacy slug to a current slug', () => {
    for (const legacy of LEGACY_CATEGORY_SLUGS) {
      expect(CURRENT_CATEGORY_SLUGS).toContain(LEGACY_CATEGORY_MAP[legacy]);
    }
    expect(LEGACY_CATEGORY_MAP).toEqual({
      sites: 'experiences',
      accommodation: 'experiences',
      restaurants: 'gastronomy',
    });
  });

  it('does not overlap current and legacy slugs', () => {
    for (const legacy of LEGACY_CATEGORY_SLUGS) {
      expect(CURRENT_CATEGORY_SLUGS).not.toContain(legacy);
    }
  });

  it('normalizes any known slug and rejects unknown ones', () => {
    expect(toCurrentCategorySlug('restaurants')).toBe('gastronomy');
    expect(toCurrentCategorySlug('crafts')).toBe('crafts');
    expect(toCurrentCategorySlug('unknown')).toBeUndefined();
  });
});

describe('locality to community mapping', () => {
  it('maps both legacy localities to a community', () => {
    expect(LOCALITY_TO_COMMUNITY).toEqual({
      'agua-verde': 'puerto-agua-verde',
      'rancho-san-cosme': 'rancho-san-cosme',
    });
    for (const target of Object.values(LOCALITY_TO_COMMUNITY)) {
      expect(COMMUNITY_SLUGS).toContain(target);
    }
  });
});
