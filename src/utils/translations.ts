import type { LocalizedString } from '../types/i18n.type';

/**
 * Extracts the correct translation from a LocalizedString object.
 * @param field The object with translations { es: '...', en: '...' }.
 * @param locale The current locale ('es-MX' or 'en-US').
 * @returns The string in the correct language or a fallback.
 */
export function getTranslated(field: LocalizedString | undefined, locale: string | undefined): string {
  if (!field) {
    return '';
  }
  const langKey = locale?.startsWith('en') ? 'en' : 'es';
  return field[langKey] ?? field.es; // Fallback to Spanish if the translation doesn't exist
}
