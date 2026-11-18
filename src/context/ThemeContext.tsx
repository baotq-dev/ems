import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ThemePreset,
  THEME_PRESETS,
  DEFAULT_THEME_KEY,
  THEME_STORAGE_KEY,
  getThemePreset,
  applyThemePreset,
} from '@/config/themePresets';

interface ThemeContextType {
  activeThemeKey: string;
  activePreset: ThemePreset;
  setTheme: (key: string) => void;
  presets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeKey, setActiveThemeKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && THEME_PRESETS.some((p) => p.key === stored)) {
        return stored;
      }
    }
    return DEFAULT_THEME_KEY;
  });

  const activePreset = getThemePreset(activeThemeKey);

  useEffect(() => {
    applyThemePreset(activePreset);
  }, [activePreset]);

  const setTheme = (key: string) => {
    const preset = getThemePreset(key);
    setActiveThemeKey(preset.key);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, preset.key);
    }
    applyThemePreset(preset);
  };

  return (
    <ThemeContext.Provider
      value={{
        activeThemeKey,
        activePreset,
        setTheme,
        presets: THEME_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
