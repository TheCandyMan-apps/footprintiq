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

// Initialize from preferences
if (typeof window !== 'undefined') {
  try {
    const prefs = localStorage.getItem('footprintiq_preferences');
    if (prefs) {
      const { language } = JSON.parse(prefs);
      if (language) setLocale(language);
    }
  } catch (e) {
    // Use default
  }
}
