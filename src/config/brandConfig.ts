// White-Label Branding & Theme Configuration (SPEC-04)

export interface ThemePalette {
  primary: string;          // Main brand color (buttons, active menus, section headers, table headers)
  primaryHover: string;     // Hover state for primary buttons/links
  primarySoftBg: string;    // Subtle tinted background for active dropdown items / highlights
  headerGradient: string;   // Top navigation bar background gradient
  secondaryAccent: string;  // Secondary utility button color (e.g., info/tag actions)
  successAccent: string;    // Reset / refresh / restore button color
  canvasBg: string;         // Main page background
  surfaceBg: string;        // Card & table background
  borderColor: string;      // Standard card, input & table border color
  textPrimary: string;      // Main body text color
  textSecondary: string;    // Muted labels & breadcrumb text color
}

export interface BrandConfig {
  tenantKey: string;        // Unique identifier for the enterprise (e.g., "food-empire")
  appName: string;          // Displayed in Top Header & Login Page title
  subtitle: string;         // Displayed on Login Page below appName
  logoUrl?: string;         // Path/URL to enterprise logo image (falls back to styled badge/icon if omitted or broken)
  faviconUrl?: string;      // Optional browser favicon path
  theme: ThemePalette;
}

export const BRAND_PRESETS: Record<string, BrandConfig> = {
  'food-empire': {
    tenantKey: 'food-empire',
    appName: 'Food Empire',
    subtitle: 'Operation Management System',
    logoUrl: '/logo.png',
    faviconUrl: '/logo.png',
    theme: {
      primary: '#D32F2F',
      primaryHover: '#B71C1C',
      primarySoftBg: '#FFEBEE',
      headerGradient: 'linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 60%, #FCE4EC 100%)',
      secondaryAccent: '#7B1FA2',
      successAccent: '#2E7D32',
      canvasBg: '#F4F6F8',
      surfaceBg: '#FFFFFF',
      borderColor: '#E0E0E0',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
    },
  },
};

export const ACTIVE_BRAND_CONFIG: BrandConfig = BRAND_PRESETS['food-empire'];

export function applyBrandTheme(config: BrandConfig = ACTIVE_BRAND_CONFIG): void {
  if (typeof document === 'undefined') return;

  // 1. Update document title
  document.title = config.appName;

  // 2. Set CSS custom properties on document.documentElement.style
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--color-primary', config.theme.primary);
  rootStyle.setProperty('--color-primary-hover', config.theme.primaryHover);
  rootStyle.setProperty('--color-primary-soft-bg', config.theme.primarySoftBg);
  rootStyle.setProperty('--bg-header-gradient', config.theme.headerGradient);
  rootStyle.setProperty('--color-secondary-accent', config.theme.secondaryAccent);
  rootStyle.setProperty('--color-success-accent', config.theme.successAccent);
  rootStyle.setProperty('--bg-canvas', config.theme.canvasBg);
  rootStyle.setProperty('--bg-surface', config.theme.surfaceBg);
  rootStyle.setProperty('--border-color', config.theme.borderColor);
  rootStyle.setProperty('--text-primary', config.theme.textPrimary);
  rootStyle.setProperty('--text-secondary', config.theme.textSecondary);

  // 3. Update favicon if provided
  if (config.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = config.faviconUrl;
  }
}
