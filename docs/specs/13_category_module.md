# 13 - Product Category Management Module Specification (`Tools > Category`)
**Spec ID:** `SPEC-13`  
**Parent Menu:** `Tools` | **Sub-Menu:** `Category` | **Route:** `/tools/category`

*(Note on Navigation, Routing & Translation Updates (`SPEC-02`, `SPEC-03`, `SPEC-11`): Add `{ key: 'category', label: 'Category', path: '/tools/category' }` under the `Tools` parent menu in `NAVIGATION_MENU` and `ProtectedRoute`. In `SPEC-11` translations, map `Category` $\leftrightarrow$ `Danh mục sản phẩm`.)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Category list view, Active/Inactive status tabs, inline column filters, Insert Category modal, Update Category modal, and mock category dataset defined in this document.
- **Theme Consistency (CRITICAL):** Always apply the active enterprise theme CSS variables from `SPEC-04` and `SPEC-11` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`). Never hardcode hex colors inside component `.tsx` or `.css` files.
- **No Unrequested Backend Calls:** All filtering, sorting, pagination, creation, updating, and CSV/Excel report export must execute client-side against `src/mocks/categoryMockData.ts`.
- **Language Consistency:** Support bilingual rendering (`en` / `vi`) via `useI18n()` (`SPEC-11`), defaulting to **English** labels as specified below.

---

## 2. Data Model & Mock Data (`src/mocks/categoryMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export type CategoryStatus = 'Active' | 'Inactive';

export interface ProductCategoryRecord {
  id: string;
  division: string;        // e.g., "Beverages", "Coffee", "Cereal"
  brand: string;           // e.g., "MacCoffee", "Cafe Pho"
  brandVn: string;         // Vietnamese display name for Brand
  category: string;        // e.g., "Cafe Pho 3-in-1 24g x 10"
  categoryVn: string;      // Vietnamese display name for Category
  subCategory?: string;    // Optional sub-category EN
  subCategoryVn?: string;  // Optional sub-category VN
  variant?: string;        // Optional SKU variant / packaging note
  sortOrder: number;       // Numeric display order (e.g., 1, 2, 3...)
  status: CategoryStatus;  // "Active" | "Inactive"
}
```

### 2.2. Required Demo Mock Data (`src/mocks/categoryMockData.ts`)
- **`MOCK_DIVISIONS`:** Predefined options for dropdown/combobox selection (e.g., `["Coffee", "Tea & RTD", "Nutrition & Cereal"]`).
- **`MOCK_BRANDS`:** Predefined brand options (e.g., `["MacCoffee", "Cafe Pho", "Klassno", "NutriRite"]`).
- **`MOCK_SUB_CATEGORIES`:** Predefined sub-category options (e.g., `["Instant Coffee", "Iced Milk Coffee", "Cereal Drink", "Canned RTD"]`).
- **`INITIAL_CATEGORY_RECORDS`:** At least 12–15 realistic FMCG product category records spanning `Active` (majority, e.g., 10–12 items) and `Inactive` (2–3 items) statuses, with sequential `sortOrder` values (`1`, `2`, `3`, ...), populated `division`, `brand`, `brandVn`, `category`, `categoryVn`, and optional `subCategory` / `variant` fields so filtering, sorting, and editing work immediately on load.

---

## 3. Category List View (`/tools/category`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron (`ChevronDown` / `ChevronRight`).
- **Status Tab Switcher (Row 1 inside filter card):**
  - Segmented two-button toggle (`Active` | `Inactive`):
    - **Active Tab (`Active`):** When selected, styled with `background: var(--color-primary)`, `color: #FFFFFF`, bold text; filters table rows where `status === 'Active'`.
    - **Inactive Tab (`Inactive`):** When selected, styled with `background: var(--color-primary)`, `color: #FFFFFF`, bold text; filters table rows where `status === 'Inactive'`.
    - Inactive/unselected tab uses `background: var(--bg-surface)`, `border: 1px solid var(--border-color)`, `color: var(--text-primary)`.
    - Defaults to `'Active'` on initial load.
- **Action Toolbar (Row 2 inside filter card):**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`, white `Search` icon + `"Search"`): Applies active status tab and inline column filters, resetting pagination to page `1`.
    - `Export Report` button (`var(--color-success-accent)`, white `Download` icon + `"Export Report"`): Exports currently filtered category records to `.csv`.
  - **Right Group:**
    - `Add New` button (`var(--color-primary)`, white `Plus` icon + `"Add New"`): Opens the **Insert Category Modal** (Section 4.1).

### 3.2. Pagination & Category Data Table
- **Top Pagination Controls:** Centered summary `"Showing {start} to {end} of {total} entries"`, navigation buttons (`<<`, `<`, page numbers, `>`, `>>`), and page size selector defaulting to `50` (options: `20`, `50`, `100`).
- **Table Structure (2 Header Rows):**
  - **Row 1 (Column Headers with Sort Controls):** Bold column labels with ascending/descending sort toggles (`ArrowUpDown`). Clicking a header sorts rows by that field; the active sort column header is highlighted in `var(--color-primary)`.
  - **Row 2 (Inline Quick-Filter Row):** Compact text inputs (`height: 28px`, `border: 1px solid var(--border-color)`) under text columns to filter matching rows instantaneously as the user types.

| # | Column Header (EN) | `ProductCategoryRecord` Key | Sortable | Inline Filter | Alignment / Cell Rendering |
|---|---|---|---|---|---|
| 1 | `Division` | `division` | Yes | Text input | Center |
| 2 | `Brand` | `brand` | Yes | Text input | Center |
| 3 | `Brand (VN)` | `brandVn` | Yes | Text input | Center |
| 4 | `Category` | `category` | Yes | Text input | Center |
| 5 | `Category (VN)` | `categoryVn` | Yes | Text input | Center |
| 6 | `Sub Category` | `subCategory` | Yes | Text input | Center |
| 7 | `Sub Category (VN)` | `subCategoryVn` | Yes | Text input | Center |
| 8 | `Variant` | `variant` | Yes | Text input | Center |
| 9 | `Order` | `sortOrder` | Yes | Text input | Center (numeric) |
| 10 | `Status` | `status` | Yes | Checkbox | Center — `CheckCircle2` icon in `var(--color-success-accent)` when `Active`; muted `XCircle` icon when `Inactive` |
| 11 | `Actions` | — | No | Blank | Center — Outline icon button with `Pencil` edit icon; clicking opens the **Update Category Modal** pre-filled with that row's record |

---

## 4. Insert & Update Category Modals (`CategoryFormModal`)
A unified responsive modal (`max-width: 1050px`, expandable to full-screen width via header expand toggle) supporting both **Insert** and **Update** modes.

### 4.1. Modal Header
- **Left Title:**
  - Create Mode: `"INSERT"`
  - Edit Mode: `"UPDATE"`
- **Right Controls:** Expand/Collapse modal width button (`Maximize2` / `Minimize2`) + circular Close (`X`) icon button.

### 4.2. Modal Body (Two Grouped Form Sections)

#### Group 1: `Category` (Section Divider Header)
- **Row 1 (3-Column Grid):**
  1. **`Division`:** Editable combobox / select dropdown populated from `MOCK_DIVISIONS` (allows selecting an existing division or typing a new value, placeholder `"..."`).
  2. **`Brand`:** Editable combobox / select dropdown populated from `MOCK_BRANDS` (placeholder `"..."`).
  3. **`Brand (VN)`:** Text input (`placeholder: "..."`).
- **Row 2 (2-Column Grid — spanning columns 1 & 2):**
  1. **`Category`:** Editable combobox / text input (`placeholder: "..."`).
  2. **`Category (VN)`:** Text input (`placeholder: "..."`).

#### Group 2: `Other` (Section Divider Header)
- **Row 1 (3-Column Grid):**
  1. **`Sub Category`:** Editable combobox / select dropdown populated from `MOCK_SUB_CATEGORIES` (`placeholder: "..."`).
  2. **`Sub Category (VN)`:** Text input (`placeholder: "..."`).
  3. **`Variant`:** Text input (`placeholder: "..."`).
- **Row 2 (2 Inputs aligned left):**
  1. **`Order`:** Numeric stepper input (`type="number"`, `min={0}`, `placeholder: "..."`).
  2. **`Status`:** Clearable Select dropdown with options `Active` and `Inactive` (defaults to `Active` in `INSERT` mode).

### 4.3. Mode-Specific Initialization & Footer Actions
- **Insert Mode (`mode === 'insert'`):**
  - Initializes all text/combobox fields to empty strings (`""`), `sortOrder` to next available order (`records.length + 1`), and `status` to `'Active'`.
- **Update Mode (`mode === 'update'`):**
  - **CRITICAL:** Must pre-populate **all** form inputs (`division`, `brand`, `brandVn`, `category`, `categoryVn`, `subCategory`, `subCategoryVn`, `variant`, `sortOrder`, `status`) with the exact values of the selected `ProductCategoryRecord`.
- **Modal Footer (Bottom-Right Aligned):**
  - `display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px`:
  1. **`Close` Button:** Outline neutral button (`border: 1px solid var(--border-color)`, `background: var(--bg-surface)`, red `X` icon + `"Close"` text). Closes modal without saving.
  2. **`Save` Button:** Solid primary button (`background: var(--color-success-accent)` or `var(--color-primary)`, white `Save` icon + `"Save"` text).
     - **Validation:** Requires non-empty `division`, `brand`, and `category` (displays inline error if missing).
     - **Action:** In `INSERT` mode, appends the new `ProductCategoryRecord` to state; in `UPDATE` mode, updates the matching record in state in real time, then closes the modal.
