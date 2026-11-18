import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  SupportedLocale,
  TRANSLATIONS,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
} from '@/i18n/translations';

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, defaultText?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'vi' || stored === 'en') {
        return stored;
      }
    }
    return DEFAULT_LOCALE;
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const dict = TRANSLATIONS[locale];
      if (dict && dict[key] !== undefined) {
        return dict[key];
      }
      // Fallback to English dictionary
      const enDict = TRANSLATIONS['en'];
      if (enDict && enDict[key] !== undefined) {
        return enDict[key];
      }
      return defaultText !== undefined ? defaultText : key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
