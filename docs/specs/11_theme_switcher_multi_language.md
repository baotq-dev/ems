# 11 - Runtime Theme Switcher & Multi-Language (`VI` / `EN`) Specification
**Spec ID:** `SPEC-11`  
**Target Area:** Top Navigation Header (`MainLayout`, Zone 1) & Global App Context (`ThemeContext` + `I18nContext`)

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Header Theme Dropdown button, the `VI` / `EN` segmented language switcher, the theme preset registry, and the bilingual translation dictionary (`en` / `vi`) defined in this document.
- **Explicit Override of Prior Constraints:** This specification explicitly supersedes the "no runtime theme-switcher UI" and "English-only UI" restrictions in `SPEC-03` and `SPEC-04`.
- **No Unrequested Utilities:** Do NOT add search modals, notification bells, or third-party i18n/UI libraries unless needed. Use lightweight, zero-dependency React Contexts backed by `localStorage`.
- **CSS Variable Compliance:** Theme switching MUST operate by updating the CSS Custom Properties defined in `SPEC-04` (`--color-primary`, `--color-primary-hover`, `--color-primary-soft-bg`, `--bg-header-gradient`) on `document.documentElement`. Never hardcode colors inside components.

---

## 2. Top Navigation Header Control Layout (`SPEC-03` Zone 1 Extension)

### 2.1. Control Placement (Right of User Avatar Area)
In `MainLayout` Zone 1 (Right Section), place the two new controls immediately to the **right** of the User Avatar dropdown:

```text
+---------------------------------------------------------------------------------------------------+
| [Brand Logo]   [Menus...]                 [User Avatar v]  [Palette Icon]  [ VI | EN ]            |
+---------------------------------------------------------------------------------------------------+
```

1. **User Avatar Dropdown (`Admin v`):** Existing session/role menu (`SPEC-02`, `SPEC-03`).
2. **Theme Switcher Button:**
   - Square icon button (`34px x 34px`, `border-radius: var(--radius-sm)`) displaying a `Palette` icon (Lucide).
   - Styled with `background: var(--color-primary)`, white icon, hover `var(--color-primary-hover)`, and a subtle focus ring (`var(--color-primary-soft-bg)`) when its dropdown is open.
   - Clicking toggles a floating dropdown menu (`min-width: 180px`, `background: var(--bg-surface)`, `border: 1px solid var(--border-color)`, `border-radius: var(--radius-md)`, `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`).
3. **Language Switcher (`VI` / `EN` Segmented Toggle):**
   - Two-segment pill/button group (`height: 34px`, `border: 1px solid var(--border-color)`, `border-radius: var(--radius-sm)`, `overflow: hidden`).
   - **Left Segment:** `VI`
   - **Right Segment:** `EN`
   - **Active Segment Styling:** `background: var(--color-primary)`, `color: #FFFFFF`, bold (`600`).
   - **Inactive Segment Styling:** `background: var(--bg-surface)`, `color: var(--text-primary)`, medium (`500`).

---

## 3. Theme Preset Configurations & Runtime Switching (`src/config/themePresets.ts`)

### 3.1. Theme Preset Schema
Extend `SPEC-04` (`BrandConfig.theme`) with selectable primary theme presets:

```typescript
export interface ThemePreset {
  key: string;
  label: string;
  group: 'Standard' | 'Dark Accent';
  primary: string;
  primaryHover: string;
  primarySoftBg: string;
  headerGradient: string;
}
```

### 3.2. Required Theme Presets
Provide the following presets in the dropdown menu (grouped cleanly under section labels):

| Key | Dropdown Label | Group | `primary` | `primaryHover` | `primarySoftBg` | `headerGradient` |
|---|---|---|---|---|---|---|
| `crimson-red` | `Crimson Red (Default)` | `Standard` | `#D32F2F` | `#B71C1C` | `#FFEBEE` | `linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 60%, #FCE4EC 100%)` |
| `emerald-green` | `Emerald Green` | `Standard` | `#2E7D32` | `#1B5E20` | `#E8F5E9` | `linear-gradient(90deg, #F1F8E9 0%, #FFFFFF 60%, #E8F5E9 100%)` |
| `dark-blue` | `dark-blue` | `Dark Accent` | `#1D4ED8` | `#1E3A8A` | `#EFF6FF` | `linear-gradient(90deg, #EFF6FF 0%, #FFFFFF 60%, #DBEAFE 100%)` |
| `dark-indigo` | `dark-indigo` | `Dark Accent` | `#4338CA` | `#312E81` | `#EEF2FF` | `linear-gradient(90deg, #EEF2FF 0%, #FFFFFF 60%, #E0E7FF 100%)` |
| `dark-purple` | `dark-purple` | `Dark Accent` | `#6D28D9` | `#4C1D95` | `#F5F3FF` | `linear-gradient(90deg, #F5F3FF 0%, #FFFFFF 60%, #EDE9FE 100%)` |

### 3.3. Persistence & Application Behavior
- **`localStorage` Key:** `fe_active_theme_key` (defaults to `'crimson-red'`).
- **Dropdown Interaction:**
  - Displays a checkmark (`Check` icon) next to the currently active preset.
  - Selecting any preset immediately updates `--color-primary`, `--color-primary-hover`, `--color-primary-soft-bg`, and `--bg-header-gradient` on `document.documentElement.style`, persists the key to `localStorage`, and closes the dropdown.
  - Clicking outside the dropdown closes it cleanly.

---

## 4. Bilingual Internationalization (`VI` / `EN`) (`src/i18n/translations.ts`)

### 4.1. Language State & Persistence
- **Supported Locales:** `'en' | 'vi'`
- **`localStorage` Key:** `fe_active_locale` (defaults to `'en'`).
- **Context Hook:** `useI18n()` exposing `{ locale, setLocale, t }`.
  - Clicking **`VI`** calls `setLocale('vi')` and saves `'vi'` to `localStorage`.
  - Clicking **`EN`** calls `setLocale('en')` and saves `'en'` to `localStorage`.

### 4.2. Translation Coverage Requirements
All static UI chrome across the application MUST dynamically render in Vietnamese when `locale === 'vi'` and English when `locale === 'en'`:

1. **Navigation Menus & Breadcrumbs (`SPEC-03`, `SPEC-07`, `SPEC-08`):**
   - `Dashboard` $\leftrightarrow$ `Tổng quan`
   - `Attendant Summary` $\leftrightarrow$ `Thống kê chấm công`
   - `Operation Configuration` $\leftrightarrow$ `Cấu hình vận hành`
   - `User List` $\leftrightarrow$ `Danh sách nhân viên`
   - `Exam List` $\leftrightarrow$ `Danh sách bài kiểm tra`
   - `Planning` $\leftrightarrow$ `Lập kế hoạch`
   - `Work Schedule` $\leftrightarrow$ `Lịch làm việc`
   - `Report` $\leftrightarrow$ `Báo cáo`
   - `Attendant` $\leftrightarrow$ `Chấm công`
   - `Timesheet` $\leftrightarrow$ `Bảng công`
   - `Exam Result` $\leftrightarrow$ `Kết quả kiểm tra`
   - `Sell Out PA` $\leftrightarrow$ `Báo cáo số bán PA`

2. **Common Toolbar & Table Actions:**
   - `Search` $\leftrightarrow$ `Tìm kiếm`
   - `Export File` / `Export Excel` / `Export Report` $\leftrightarrow$ `Xuất file` / `Xuất Excel` / `Xuất báo cáo`
   - `Template File` $\leftrightarrow$ `File mẫu`
   - `Import File` $\leftrightarrow$ `Nhập File`
   - `Add` $\leftrightarrow$ `Thêm`
   - `Save` $\leftrightarrow$ `Lưu`
   - `Close` / `Cancel` $\leftrightarrow$ `Đóng` / `Hủy`
   - `Delete` $\leftrightarrow$ `Xóa`
   - `Actions` $\leftrightarrow$ `Chức năng`
   - `No results found` $\leftrightarrow$ `Không tìm thấy dữ liệu`
   - `Showing {start} to {end} of {total} entries` $\leftrightarrow$ `Hiển thị {start} đến {end} trong {total} mục`

3. **Filter Labels, Table Headers, Modal Titles & Login Page:**
   - Include complete `en` and `vi` dictionary entries for `LoginPage` (`Sign In` $\leftrightarrow$ `Đăng nhập`, `Username` $\leftrightarrow$ `Tên đăng nhập`, `Password` $\leftrightarrow$ `Mật khẩu`), `UserListPage`, `WorkSchedulePage` (`Mon`–`Sun` $\leftrightarrow$ `Thứ 2`–`CN`, `Month` $\leftrightarrow$ `Tháng`), `ExamListPage`, `ExamResultPage`, `AttendantPage`, `TimesheetPage`, `AttendantSummaryPage`, and `SellOutPaReportPage`.
   - Fallback rule: If a dynamic or unmapped key is passed to `t(key)`, return the English default string gracefully without throwing runtime errors.
