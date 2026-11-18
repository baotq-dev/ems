export interface ThemePreset {
  key: string;
  label: string;
  group: 'Standard' | 'Dark Accent';
  primary: string;
  primaryHover: string;
  primarySoftBg: string;
  headerGradient: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'crimson-red',
    label: 'Crimson Red (Default)',
    group: 'Standard',
    primary: '#D32F2F',
    primaryHover: '#B71C1C',
    primarySoftBg: '#FFEBEE',
    headerGradient: 'linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 60%, #FCE4EC 100%)',
  },
  {
    key: 'emerald-green',
    label: 'Emerald Green',
    group: 'Standard',
    primary: '#2E7D32',
    primaryHover: '#1B5E20',
    primarySoftBg: '#E8F5E9',
    headerGradient: 'linear-gradient(90deg, #F1F8E9 0%, #FFFFFF 60%, #E8F5E9 100%)',
  },
  {
    key: 'dark-blue',
    label: 'dark-blue',
    group: 'Dark Accent',
    primary: '#1D4ED8',
    primaryHover: '#1E3A8A',
    primarySoftBg: '#EFF6FF',
    headerGradient: 'linear-gradient(90deg, #EFF6FF 0%, #FFFFFF 60%, #DBEAFE 100%)',
  },
  {
    key: 'dark-indigo',
    label: 'dark-indigo',
    group: 'Dark Accent',
    primary: '#4338CA',
    primaryHover: '#312E81',
    primarySoftBg: '#EEF2FF',
    headerGradient: 'linear-gradient(90deg, #EEF2FF 0%, #FFFFFF 60%, #E0E7FF 100%)',
  },
  {
    key: 'dark-purple',
    label: 'dark-purple',
    group: 'Dark Accent',
    primary: '#6D28D9',
    primaryHover: '#4C1D95',
    primarySoftBg: '#F5F3FF',
    headerGradient: 'linear-gradient(90deg, #F5F3FF 0%, #FFFFFF 60%, #EDE9FE 100%)',
  },
];

export const DEFAULT_THEME_KEY = 'crimson-red';
export const THEME_STORAGE_KEY = 'fe_active_theme_key';

export function getThemePreset(key: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.key === key) || THEME_PRESETS[0];
}

export function applyThemePreset(preset: ThemePreset): void {
  if (typeof document === 'undefined') return;

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--color-primary', preset.primary);
  rootStyle.setProperty('--color-primary-hover', preset.primaryHover);
  rootStyle.setProperty('--color-primary-soft-bg', preset.primarySoftBg);
  rootStyle.setProperty('--bg-header-gradient', preset.headerGradient);
}
