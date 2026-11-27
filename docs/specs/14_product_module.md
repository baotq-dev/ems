# 14 - Product Management Module Specification (`Tools > Product`)
**Spec ID:** `SPEC-14`  
**Parent Menu:** `Tools` | **Sub-Menu:** `Product` | **Route:** `/tools/product`

*(Note on Navigation, Routing & Translation Updates (`SPEC-02`, `SPEC-03`, `SPEC-11`): Add `{ key: 'product', label: 'Product', path: '/tools/product' }` under the `Tools` parent menu in `NAVIGATION_MENU` and `ProtectedRoute`. In `SPEC-11` translations, map `Product` $\leftrightarrow$ `Sản phẩm`.)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Product list view, filter bar, `.xlsx` multi-sheet template export/import logic, unified Create/Update Product modal (with inactive date range management), and mock product dataset defined in this document.
- **Theme Consistency (CRITICAL):** Strictly apply the active enterprise theme CSS variables from `SPEC-04` and `SPEC-11` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`). Never hardcode hex colors inside component `.tsx` or `.css` files.
- **No Unrequested Backend Calls:** All filtering, sorting, pagination, creation, updating, and Excel import/export must execute client-side against `src/mocks/productMockData.ts`.
- **Language Consistency:** Support bilingual rendering (`en` / `vi`) via `useI18n()` (`SPEC-11`), defaulting to **English** labels as specified below.

---

## 2. Data Model, Excel Template Schema & Mock Data (`src/mocks/productMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export type ProductStatus = 'Active' | 'Inactive';

export interface ProductInactivePeriod {
  id: string;
  fromDate: string; // ISO format: YYYY-MM-DD
  toDate?: string;  // ISO format: YYYY-MM-DD (optional if open-ended)
}

export interface ProductRecord {
  id: string;
  categoryId: number | string;   // Links to category reference (e.g., 305, 596)
  division: string;              // e.g., "Sabeco", "Carlsberg", "Heineken"
  brand: string;                 // e.g., "Sai Gon Lager", "1664 Blanc"
  productGroup?: string;         // Sub-category / group label
  productCode: string;           // e.g., "P00001", "P00001-FES"
  productName: string;           // e.g., "SAIGON LAGER x 24 lon"
  barcode?: string;              // Retail unit barcode
  barrelBarcode?: string;        // Case/carton barcode
  barrelSize: number;            // Units per case/carton (e.g., 24, 12, 0)
  unit: string;                  // Packaging unit (e.g., "Case", "Can", "Bottle")
  packageSize?: string;          // Volume/weight per unit (e.g., "330ml", "250ml")
  sortOrder: number;             // Display order index (defaults to 0)
  price: number;                 // Unit/case price (defaults to 0)
  status: ProductStatus;         // "Active" | "Inactive"
  inactiveFrom?: string;         // Active/latest inactive start date (YYYY-MM-DD)
  inactiveTo?: string;           // Active/latest inactive end date (YYYY-MM-DD)
  inactivePeriods: ProductInactivePeriod[]; // History of scheduled inactive date ranges
  expiryDate?: string;           // Optional expiry date
  createdAt: string;             // ISO format: YYYY-MM-DD
}
```

### 2.2. Exact `.xlsx` Template & Import File Schema (`ProductListTemplate.xlsx`)
Both **`Template File`** download and **`Import File`** upload (using `xlsx` / SheetJS) MUST support the two-sheet workbook structure:

#### Sheet 1: `ProductList` (Primary Import / Export Sheet)
- **Title Block (Rows 1–2):**
  - **Row 1, Col C (`C1`):** `"PRODUCT LIST"`
  - **Row 2:** Blank separator row
- **Header Row (Row 3, Cols A–S):**
  1. `No.`
  2. `Product Code` (Required)
  3. `Product Name` (Required)
  4. `Price` (Numeric, defaults to `0`)
  5. `Barcode` (Optional)
  6. `Barrel Barcode` (Optional)
  7. `Barrel Size` (Numeric, defaults to `0`)
  8. `Package Size` (Optional, e.g., `"330"`)
  9. `Unit` (e.g., `"Case"`)
  10. `Status` (`"Active"` or `"Inactive"`, defaults to `"Active"`)
  11. `ExpiryDate` (Optional `YYYY-MM-DD`)
  12. `Order` (Numeric `sortOrder`, defaults to `0`)
  13. `ID Category` (Category reference ID)
  14. `Division` (Required, e.g., `"Sabeco"`)
  15. `Brand` (Required, e.g., `"Sai Gon Lager"`)
  16. `Product Group` (Optional)
  17. `Inactive From` (Optional `YYYY-MM-DD`)
  18. `Inactive To` (Optional `YYYY-MM-DD`)
  19. `Created Date` (`YYYY-MM-DD`)

#### Sheet 2: `CategoryRef` (Reference Lookup Sheet included in exported template)
- **Header Row (Row 3, Cols B–H):**
  - `ID Category` | `Division` | `Brand` | `Product Group` | `SubCategory` | `SubCategory (VN)` | `Variant`
- Populated automatically from `SPEC-13` (`INITIAL_CATEGORY_RECORDS`) when generating **`Template File`** so users have valid category IDs for reference.

### 2.3. Required Demo Mock Data (`src/mocks/productMockData.ts`)
- **`INITIAL_PRODUCT_RECORDS`:** At least 12–15 realistic FMCG beverage products matching the workbook structure (e.g., `P00001` `SAIGON LAGER x 24 lon`, `P00001-FES` `SAIGON LAGER x 24 lon Festive`, `P00010` `Lac Viet 24 lon`, `P00011` `Lac Viet 12 lon` with `Inactive` status and `inactiveFrom: '2025-12-13'`, `P00023` `333 PILSNER x 24 lon`, `P00027` `1664 Blanc 24 lon`, `P00012` `Heineken Regular 24 lon`), linked cleanly to `Division` and `Brand` options from `SPEC-13`.

---

## 3. Product List View (`/tools/product`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron (`ChevronDown` / `ChevronRight`).
- **Filter Inputs (4-Column Responsive Grid):**
  1. **`Division`:** Clearable Select dropdown (options derived from unique `division` values, placeholder `"Select division"`).
  2. **`Brand`:** Clearable Select dropdown (filtered by selected `Division` if chosen, placeholder `"Select brand"`).
  3. **`Product Group`:** Clearable Select dropdown (placeholder `"Select product group"`).
  4. **`Product Code`:** Text input (`placeholder: "Product code"`).
  5. **`Product Name`:** Text input (`placeholder: "Product name"`).
  6. **`Status`:** Clearable Select dropdown with options `Active` and `Inactive` (defaults to `"Active"`).
  7. **`Date Range` (`From Date - To Date`):** Date range input filtering by `createdAt` or `inactiveFrom`/`inactiveTo` overlap.
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`, white `Search` icon + `"Search"`): Applies active filter criteria and resets pagination to page `1`.
    - `Template File` button (amber accent `#F59E0B`, `Download` icon + `"Template File"`): Generates and downloads the two-sheet `.xlsx` template (`ProductList` + `CategoryRef`) per Section 2.2.
    - `Export Report` button (`var(--color-success-accent)`, `Download` icon + `"Export Report"`): Exports currently filtered product records to `.xlsx` / `.csv`.
  - **Right Group:**
    - `Create` button (`var(--color-primary)`, `Plus` icon + `"Create"`): Opens the **Product Form Modal** in `'create'` mode (Section 4).
    - `Import File` button (`var(--color-success-accent)`, `Plus` icon + `"Import File"`): Opens a file picker modal accepting `.xlsx` files, parses `ProductList` rows per Section 2.2, validates required fields (`Product Code`, `Product Name`, `Division`, `Brand`), and appends/updates records in state.
    - `Clear` icon button (`X`): Resets all filter inputs and inline column filters.

### 3.2. Pagination & Product Data Table
- **Top & Bottom Pagination Controls:** Centered navigation (`<<`, `<`, page numbers, `>`, `>>`), `"Showing {start} to {end} of {total} entries"`, and page size selector defaulting to `20` (options: `20`, `50`, `100`).
- **Table Structure (2 Header Rows):**
  - **Row 1 (Column Headers):** Bold column labels (`13px`). `Inactive From` and `Inactive To` include ascending/descending sort toggles (`ArrowUpDown`).
  - **Row 2 (Inline Quick-Filter Row):** Compact text inputs (`height: 28px`, `border: 1px solid var(--border-color)`) under every data column for instantaneous client-side filtering.

| # | Column Header (EN) | `ProductRecord` Key | Sortable | Inline Filter | Alignment / Display Format |
|---|---|---|---|---|---|
| 1 | `No.` | Computed index | No | Text input | Center (`(page - 1) * pageSize + rowIndex + 1`) |
| 2 | `Division` | `division` | No | Text input | Center (e.g., `Sabeco`) |
| 3 | `Brand` | `brand` | No | Text input | Center (e.g., `Sai Gon Lager`) |
| 4 | `Product Code` | `productCode` | No | Text input | Center (e.g., `P00001`) |
| 5 | `Product Name` | `productName` | No | Text input | Left (e.g., `SAIGON LAGER x 24 lon`) |
| 6 | `Unit` | `unit` | No | Text input | Center (e.g., `Case`) |
| 7 | `Product Barcode` | `barcode` | No | Text input | Center (displays `barcode` or blank) |
| 8 | `Status` | `status` | No | Text input | Center (`Active` / `Inactive`) |
| 9 | `Inactive From` | `inactiveFrom` | Yes | Text input | Center (`YYYY-MM-DD` or blank) |
| 10 | `Inactive To` | `inactiveTo` | Yes | Text input | Center (`YYYY-MM-DD` or blank) |
| 11 | `Actions` | — | No | Blank | Center — Outline square icon button (`border: 1px solid var(--color-primary)`, `color: var(--color-primary)`) with `Pencil` edit icon; clicking opens the **Product Form Modal** in `'update'` mode pre-filled with that row's record |

---

## 4. Unified Create & Update Product Modal (`ProductFormModal`)
A single reusable modal component (`max-width: 960px`) shared by both **Create** (`mode === 'create'`) and **Update** (`mode === 'update'`) flows.

### 4.1. Modal Header
- **Left Title:**
  - Create Mode (`mode === 'create'`): `"Insert"`
  - Update Mode (`mode === 'update'`): `"Update"`
- **Right Control:** Close (`X`) icon button.

### 4.2. Form Body Structure
1. **Top Full-Width Category / Division Selector:**
   - **Label:** `"Select Category / Product Group"`
   - **Control:** Clearable Select dropdown populated from `INITIAL_CATEGORY_RECORDS` (`SPEC-13`) formatted as `{division} - {brand} - {category}` (placeholder `"Select division / category"`). Selecting an option automatically sets `categoryId`, `division`, `brand`, and `productGroup` on the form state.
2. **3-Column Product Specification Grid (`3 columns x 3 rows`):**
   - **Row 1:**
     1. `Product Code *` (Text input, required, e.g., `"P00001"`)
     2. `Product Name *` (Text input, required, e.g., `"SAIGON LAGER x 24 lon"`)
     3. `Barcode` (Text input for retail unit barcode)
   - **Row 2:**
     1. `Barrel Barcode` (Text input for carton/barrel barcode)
     2. `Barrel Size` (Numeric input `type="number"`, `min={0}`, default `0`)
     3. `Unit` (Text input, e.g., `"Case"`)
   - **Row 3:**
     1. `Package Size` (Text input, e.g., `"330ml"`)
     2. `Order By` (Numeric input `type="number"`, `min={0}`, default `0`)
     3. `Price` (Numeric input `type="number"`, `min={0}`, default `0`)
3. **Sub-Card Section: `Inactive Date Schedule` (`Inactive Periods`)**
   Rendered inside a bordered inner card (`border: 1px solid var(--border-color)`, `border-radius: var(--radius-sm)`, `padding: 16px`):
   - **Section Heading:** Bold `16px` title `"Inactive Date Schedule"`.
   - **2-Column Split Layout inside Sub-Card:**
     - **Left Controls (~40% width):**
       - Label `"From Date - To Date"`
       - Inline date range picker (`fromDate` and `toDate` inputs) + primary red **`-> Add`** button (`background: var(--color-primary)`, white text).
       - Clicking **`-> Add`** appends `{ id, fromDate, toDate }` to the local `inactivePeriods` list (requires `fromDate`).
     - **Right Sub-Table (~60% width):**
       - Columns: `No.` | `From Date` | `To Date` | `Delete`
       - Displays `"No results found"` when `inactivePeriods` is empty; otherwise lists added periods with a red `Trash2` delete icon button per row.

### 4.3. Mode-Specific Initialization & Footer Actions
- **Create Mode (`mode === 'create'`):**
  - Initializes all text inputs empty (`""`), numeric inputs (`barrelSize`, `sortOrder`, `price`) to `0`, `status` to `'Active'`, and `inactivePeriods` to `[]`.
- **Update Mode (`mode === 'update'`):**
  - **CRITICAL:** Pre-fills **all** inputs (`categoryId`, `division`, `brand`, `productCode`, `productName`, `barcode`, `barrelBarcode`, `barrelSize`, `unit`, `packageSize`, `sortOrder`, `price`, and `inactivePeriods`) with the exact values of the selected `ProductRecord`.
- **Status & Inactive Sync Rule:**
  - When saving, if `inactivePeriods.length > 0`, sync `inactiveFrom` and `inactiveTo` from the latest entry in `inactivePeriods` and set `status` accordingly (or keep `'Active'` when `inactivePeriods` is cleared/empty).
- **Modal Footer (Bottom-Right Aligned):**
  - `display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px`:
  1. **`Cancel` Button:** Neutral/secondary button (`X` icon + `"Cancel"` text). Discards changes and closes modal.
  2. **`Save` Button:** Primary solid button (`background: var(--color-success-accent)` or `var(--color-primary)`, white `Save` icon + `"Save"` text).
     - **Validation:** Requires non-empty `division`/`brand`, `productCode`, and `productName` (shows inline error if missing).
     - **Action:** In `'create'` mode, prepends the new `ProductRecord` to `products` state; in `'update'` mode, updates the existing record in state in real time, then closes modal.
