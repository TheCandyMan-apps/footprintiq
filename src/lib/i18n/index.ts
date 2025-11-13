/**
 * Lightweight i18n system
 */

import { en } from './en';

const translations: Record<string, any> = {
  en,
};

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale;
    localStorage.setItem('footprintiq_language', locale);
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: locale }));
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function t(key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return typeof value === 'string' ? value : (fallback || key);
}

// Initialize from preferences - default to English
if (typeof window !== 'undefined') {
  try {
    // Check for stored language preference
    const storedLang = localStorage.getItem('footprintiq_language');
    if (storedLang && translations[storedLang]) {
      currentLocale = storedLang;
    } else {
      // Also check old preferences format
      const prefs = localStorage.getItem('footprintiq_preferences');
      if (prefs) {
        const { language } = JSON.parse(prefs);
        if (language && translations[language]) {
          currentLocale = language;
          localStorage.setItem('footprintiq_language', language);
        }
      }
    }
    // Ensure English is set if no preference
    if (!localStorage.getItem('footprintiq_language')) {
      localStorage.setItem('footprintiq_language', 'en');
    }
  } catch (e) {
    // Use default English
    currentLocale = 'en';
  }
}
