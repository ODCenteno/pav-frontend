import { describe, expect, it } from 'vitest';
import { manifest } from '../manifest';

describe('PWA web manifest builder', () => {
  it('returns a Spanish manifest with "/" as the start_url', () => {
    const result = manifest('es-MX');
    expect(result.lang).toBe('es-MX');
    expect(result.start_url).toBe('/');
    expect(result.scope).toBe('/');
    expect(result.display).toBe('standalone');
    expect(result.icons).toHaveLength(4);
    expect(result.shortcuts).toHaveLength(2);
  });

  it('returns an English manifest with "/en/" as the start_url', () => {
    const result = manifest('en');
    expect(result.lang).toBe('en');
    expect(result.start_url).toBe('/en/');
    expect(result.name).toBe('Puerto Agua Verde');
  });

  it('uses the same icon set across locales', () => {
    const es = manifest('es-MX');
    const en = manifest('en');
    expect(en.icons).toEqual(es.icons);
  });

  it('markables are declared', () => {
    const result = manifest('es-MX');
    const maskable = result.icons.filter((icon) => icon.purpose === 'maskable');
    expect(maskable.length).toBeGreaterThan(0);
  });
});
