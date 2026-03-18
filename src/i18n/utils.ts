import es from './es.json';
import en from './en.json';

const TRANSLATIONS = {
  'es-MX': es,
  'en-US': en,
};

/**
 * Returns a `t` function for the current locale that looks up translations in the dictionary.
 * @param {string} currentLocale The current locale from Astro.
 */
export function useTranslations(currentLocale: string | undefined) {
  const lang = currentLocale?.startsWith('en') ? 'en-US' : 'es-MX';
  const dictionary = TRANSLATIONS[lang];

  return function t(key: string, params: Record<string, string> = {}): any {
    // Navigate the object using dot notation (e.g., "nav.destinations")
    const translation = key.split('.').reduce((obj: any, k) => obj?.[k], dictionary);

    if (!translation) {
      return key; // Return the key if the translation is not found
    }

    if (typeof translation !== 'string') {
      return translation; // Return the object/array as is
    }

    let text = translation;
    for (const param in params) {
      text = text.replace(`{{${param}}}`, params[param]);
    }
    return text;
  };
}
