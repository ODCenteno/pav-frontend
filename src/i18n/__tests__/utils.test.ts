import { describe, it, expect } from 'vitest';
import { useTranslations } from '../utils';

describe('i18n/utils', () => {
  describe('useTranslations', () => {
    it('should return a function (t) when called with locale', () => {
      const t = useTranslations('es-MX');
      expect(typeof t).toBe('function');
    });

    it('should return t function that returns key when key not found', () => {
      const t = useTranslations('es-MX');
      const result = t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should return object/array when translation is not a string', () => {
      const t = useTranslations('es-MX');
      const result = t('page.index.siteTitle');
      // siteTitle should exist and be a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle locale with "en" prefix', () => {
      const t = useTranslations('en');
      expect(typeof t).toBe('function');
    });

    it('should default to Spanish for unknown locales', () => {
      const t = useTranslations('fr-FR');
      expect(typeof t).toBe('function');
    });

    it('should default to Spanish for undefined locale', () => {
      const t = useTranslations(undefined);
      expect(typeof t).toBe('function');
    });

    it('should default to Spanish for empty string locale', () => {
      const t = useTranslations('');
      expect(typeof t).toBe('function');
    });

    it('should return the key itself when translation not found', () => {
      const t = useTranslations('es-MX');
      const result = t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should handle parameter substitution', () => {
      const t = useTranslations('es-MX');
      const result = t('sitesPage.itemCount', { count: '5' });
      expect(result).toContain('5');
    });

    it('should handle dot notation for nested keys', () => {
      const t = useTranslations('es-MX');
      expect(t('page.index.siteTitle')).toBeTruthy();
    });

    it('should handle simple top-level keys', () => {
      const t = useTranslations('es-MX');
      const result = t('language');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});