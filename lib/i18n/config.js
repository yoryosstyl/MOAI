/**
 * i18n Configuration for MOAI
 * Supports English and Greek languages
 */

export const locales = ['en', 'el'];
export const defaultLocale = 'en';

export const languageNames = {
  en: 'English',
  el: 'Ελληνικά',
};

/**
 * Get translations for a specific locale
 * @param {string} locale - The locale code (en, el)
 * @returns {object} - The translations object
 */
export async function getTranslations(locale) {
  try {
    const translations = await import(`./locales/${locale}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to English
    const fallback = await import(`./locales/${defaultLocale}.json`);
    return fallback.default;
  }
}

/**
 * Simple hook for using translations (client-side)
 * Usage: const t = useTranslations(locale);
 */
export function useTranslations(locale, translations) {
  return function t(key) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key; // Return key if translation not found
    }

    return value;
  };
}
