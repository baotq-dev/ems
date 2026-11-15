# 04 - White-Label Branding & Theme Configuration Specification
**Spec ID:** `SPEC-04`

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the branding configuration schema, CSS variables, and initialization mechanism defined in this document.
- **Configuration-Driven White-Labeling:** This application is designed to be deployed for multiple enterprises by modifying **only** a single centralized configuration file (`src/config/brandConfig.ts`).
- **No Unrequested UI Controls:** Do NOT build a runtime theme-switcher dropdown, color picker modal, or "Brand Settings" admin page in the UI. Branding and theme switching is strictly configuration-driven.
- **No Hardcoded Brand Assets:** Components (`MainLayout`, `LoginPage`, document `<title>`) MUST NOT hardcode enterprise names, logos, or hex colors.

---

## 2. Branding & Theme Configuration Schema (`src/config/brandConfig.ts`)

### 2.1. TypeScript Interface
```typescript
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
```

### 2.2. Default Active Configuration (`Food Empire` Preset)
Unless overridden, `ACTIVE_BRAND_CONFIG` must default to the following enterprise preset:

```typescript
export const BRAND_PRESETS: Record<string, BrandConfig> = {
  'food-empire': {
    tenantKey: 'food-empire',
    appName: 'Food Empire',
    subtitle: 'Operation Management System',
    logoUrl: '/logo.png',
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
```
*(Note: To rebrand the application for another enterprise in the future, a developer only needs to add a new key to `BRAND_PRESETS`, supply its `appName`, `logoUrl`, and `theme` colors, and point `ACTIVE_BRAND_CONFIG` to it.)*

---

## 3. CSS Custom Properties & Styling Architecture (`src/styles/theme.css`)

### 3.1. Mandatory CSS Variables
All stylesheets and components MUST consume the following CSS Custom Properties defined on `:root`:

```css
:root {
  /* Brand & Action Colors */
  --color-primary: #D32F2F;
  --color-primary-hover: #B71C1C;
  --color-primary-soft-bg: #FFEBEE;
  --bg-header-gradient: linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 60%, #FCE4EC 100%);

  /* Semantic Action Colors */
  --color-secondary-accent: #7B1FA2;
  --color-success-accent: #2E7D32;

  /* Surfaces & Borders */
  --bg-canvas: #F4F6F8;
  --bg-surface: #FFFFFF;
  --border-color: #E0E0E0;

  /* Typography */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --font-family-base: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Enterprise Layout Tokens */
  --header-height: 56px;
  --breadcrumb-height: 40px;
  --radius-sm: 4px;
  --radius-md: 6px;
}
```

### 3.2. Dynamic Runtime Injection (`applyBrandTheme`)
Create a pure initialization function `applyBrandTheme(config: BrandConfig)` in `src/config/brandConfig.ts` and invoke it once in `src/main.tsx` before rendering `<App />`:
1. Updates `document.title = config.appName`.
2. Sets each CSS custom property on `document.documentElement.style` (`--color-primary`, `--color-primary-hover`, `--color-primary-soft-bg`, `--bg-header-gradient`, `--color-secondary-accent`, `--color-success-accent`, `--bg-canvas`, `--bg-surface`, `--border-color`, `--text-primary`, `--text-secondary`).
3. If `config.faviconUrl` is provided, updates `<link rel="icon">` href attribute.

---

## 4. Component Integration Rules
- **Top Navigation Header (`SPEC-03`, Zone 1):**
  - Renders `ACTIVE_BRAND_CONFIG.logoUrl` (with graceful fallback to a clean brand badge/icon if image fails to load) alongside `ACTIVE_BRAND_CONFIG.appName`.
  - Uses `background: var(--bg-header-gradient)`.
  - Active menu states use `color: var(--color-primary)` and `background-color: var(--color-primary-soft-bg)`.
- **Login Page (`SPEC-02`, Section 3):**
  - Renders `ACTIVE_BRAND_CONFIG.logoUrl`, `ACTIVE_BRAND_CONFIG.appName`, and `ACTIVE_BRAND_CONFIG.subtitle`.
  - Card top border uses `4px solid var(--color-primary)` and submit button uses `background-color: var(--color-primary)` (hover: `var(--color-primary-hover)`).
- **Module Pages (`SPEC-05+`):**
  - Filter card header bars, primary `Search` / `Add` buttons, and table column headers MUST use `var(--color-primary)`.
  - Utility buttons (e.g., `I_imei` / tags) MUST use `var(--color-secondary-accent)`.
  - Reset/restore row actions MUST use `var(--color-success-accent)`.
