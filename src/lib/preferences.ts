/**
 * User preferences system with localStorage persistence
 */

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  density: 'cozy' | 'compact';
  language: string;
  tooltips: 'brief' | 'verbose' | 'off';
  hideAdultSources: boolean;
  defaultProviders: {
    email?: string[];
    username?: string[];
    domain?: string[];
    phone?: string[];
    ip?: string[];
  };
}

const STORAGE_KEY = 'footprintiq_preferences';

const defaultPreferences: UserPreferences = {
  theme: 'light',
  density: 'cozy',
  language: 'en',
  tooltips: 'brief',
  hideAdultSources: true,
  defaultProviders: {},
};

export function getPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[Preferences] Failed to load:', error);
  }
  return defaultPreferences;
}

export function setPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Apply theme immediately
    if (preferences.theme) {
      applyTheme(preferences.theme);
    }
    
    // Dispatch event for reactive updates
    window.dispatchEvent(new CustomEvent('preferences-changed', { 
      detail: updated 
    }));
  } catch (error) {
    console.error('[Preferences] Failed to save:', error);
  }
}

function applyTheme(theme: UserPreferences['theme']): void {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const prefs = getPreferences();
  applyTheme(prefs.theme);
}
