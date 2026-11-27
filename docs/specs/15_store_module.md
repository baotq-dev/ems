# 15 - Store Management Module Specification (`Tools > Store`)
**Spec ID:** `SPEC-15`  
**Parent Menu:** `Tools` | **Sub-Menu:** `Store` | **Route:** `/tools/store`

*(Note on Navigation, Routing & Translation Updates (`SPEC-02`, `SPEC-03`, `SPEC-11`): Add `{ key: 'store', label: 'Store', path: '/tools/store' }` under the `Tools` parent menu in `NAVIGATION_MENU` and `ProtectedRoute`. In `SPEC-11` translations, map `Store` $\leftrightarrow$ `Cửa hàng`.)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Store list view, filter bar, `.xlsx` multi-sheet template export/import logic, unified Insert/Update Store modal (with cascading location dropdowns and store photo preview), and mock datasets defined in this document.
- **Theme Consistency (CRITICAL):** Always apply the active enterprise theme CSS variables from `SPEC-04` and `SPEC-11` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`). Never hardcode green or blue header bars from reference layouts.
- **No Unrequested Backend Calls:** All filtering, sorting, pagination, cascading dropdown resolution, creation, updating, and Excel import/export must execute client-side against `src/mocks/storeMockData.ts`.
- **Language Consistency:** Support bilingual rendering (`en` / `vi`) via `useI18n()` (`SPEC-11`), defaulting to **English** labels as specified below.

---

## 2. Data Model, Reference Lookup Lists & Mock Data (`src/mocks/storeMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export type StoreStatus = 'Active' | 'Inactive';

export interface StoreChannelOption {
  code: string; // e.g., "Hyper", "Super", "CVS", "Minimart"
  name: string;
}

export interface StoreAccountOption {
  code: string; // e.g., "CUS001", "CUS002", "CUS003", "BHX"
  name: string; // e.g., "COOP", "BIG C", "MEGA", "Bach Hoa Xanh"
  chain?: string;
}

export interface StoreSupplierOption {
  code: string;
  name: string;
}

export interface StoreTypeOption {
  code: string;
  name: string;
}

export interface ProvinceHierarchyItem {
  id: number;
  area: string;     // Region/Area, e.g., "Mien Dong", "Song Tien", "Song Hau", "Bac Trung Bo"
  province: string; // e.g., "Ho Chi Minh City", "Tien Giang", "Ben Tre", "Kien Giang"
  districts: {
    name: string;   // e.g., "Vung Tau City", "My Tho City", "Ben Tre City"
    towns: string[]; // Ward/Commune list, e.g., ["Phuoc Thang Ward", "Ward 5", "Son Dong Commune"]
  }[];
}

export interface StoreRecord {
  id: string;
  storeImageUrl?: string;
  channelCode?: string;
  channelName?: string;
  accountCode: string;       // Chain/Account code, e.g., "CUS003", "BHX"
  accountName: string;       // Chain/Account name, e.g., "MEGA", "Bach Hoa Xanh"
  supplierCode?: string;
  supplierName?: string;
  storeType?: string;
  storeCode: string;         // Required, e.g., "A103", "A112", "BI26", "S071"
  storeName: string;         // Required, e.g., "Mega Vung Tau"
  address: string;           // Required full street address
  area: string;              // Region/Area, e.g., "Mien Dong", "Song Tien", "Song Hau"
  provinceId?: number;
  province: string;          // Legacy/current Province/City
  district?: string;
  town?: string;             // Ward/Commune
  newProvince?: string;      // Merged/New Province/City
  newTown?: string;          // Merged/New Ward/Commune
  districtTownNote?: string;
  activeDate?: string;       // YYYY-MM-DD
  closedDate?: string;       // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  coordinateSource?: string;
  oldStoreCode?: string;
  codeChangeNote?: string;
  mobile?: string;
  email?: string;
  frequency: number;         // Visit/shift frequency (defaults to 1)
  locationCode?: string;
  unitCode?: string;
  overview?: string;
  status: StoreStatus;       // "Active" | "Inactive"
  createdAt: string;
  updatedAt: string;
}
```

### 2.2. Required Lookup & Demo Mock Data (`src/mocks/storeMockData.ts`)
Populate `src/mocks/storeMockData.ts` directly from the reference workbook structure (`StoreList.xlsx`):
- **`MOCK_CHANNELS`:** `Hyper`, `Super`, `CVS`, `Minimart`.
- **`MOCK_ACCOUNTS` (Chains):** `CUS001 - COOP`, `CUS002 - BIG C`, `CUS003 - MEGA`, `BHX - Bach Hoa Xanh`, `CUS004 - WCM`, `CUS005 - LOTTE`, `CUS006 - AEON`, `CUS007 - Emart`, `CUS008 - Satra Mart`, `ANNAM`, `BRG`, `FUJI`.
- **`MOCK_SUPPLIERS`:** `SUP001 - South Distribution Co.`, `SUP002 - Mekong Trading JSC`, `SUP003 - Central Retail Logistics`.
- **`MOCK_STORE_TYPES`:** `Modern Trade`, `Supermarket`, `Convenience Store`, `Hypermarket`.
- **`MOCK_PROVINCE_HIERARCHY` & `MOCK_NEW_PROVINCES`:** Cascading Area $\rightarrow$ Province $\rightarrow$ District $\rightarrow$ Ward/Town dataset covering `Mien Dong` (`Ba Ria - Vung Tau`, `Ho Chi Minh City`), `Song Tien` (`Tien Giang`, `Ben Tre`, `Dong Thap`, `Vinh Long`), `Song Hau` (`Kien Giang`, `Can Tho`), and `Bac Trung Bo` (`Nghe An`), plus merged/new province-ward mappings (`Ho Chi Minh City`, `Dong Thap Province`, `Vinh Long Province` $\rightarrow$ `Phu Tuc Commune`)[span_0](start_span)[span_0](end_span).
- **`INITIAL_STORE_RECORDS`:** At least 8–10 realistic store records including both `Active` stores and the 4 reference `Inactive` records (`A103 - Mega Vung Tau`, `A112 - BHX - 264 Ap Bac My Tho`, `BI26 - Go Ben Tre` with `closedDate: '2025-01-01'`, `S071 - Coop Ha Tien - Kien Giang`)[span_1](start_span)[span_1](end_span) so filtering by `Active` vs. `InActive` demonstrates both states immediately.

### 2.3. Exact `.xlsx` Template & Import File Schema (`StoreList.xlsx`)
Both **`Template File`** download and **`Import File`** upload (using `xlsx` / SheetJS) MUST support the multi-sheet workbook structure:
- **Sheet 1 (`StoreList`):**
  - **Row 1, Col A (`A1`):** `"STORE LIST"`
  - **Row 2:** Format hints (`yyyy-MM-dd` in Col U, `Active/Inactive` in Col W)
  - **Rows 3–4 (Grouped Headers, Cols A–AA):** `No.`, `Supplier` (`Code`, `Name`), `Account` (`Code`, `Name`, `Chain`), `Channel` (`Code`, `Name`), `Store Type`, `Store Code (*)`, `Store Name (*)`, `Address (*)`, `Province (*)` (`Id`, `Area`, `Province`, `District`, `Town`), `Location` (`Latitude`, `Longitude`, `Accuracy`), `Closed Date`, `Frequency`, `Status`, `Created Date`, `Updated Date`, `Note`, `Overview`.
- **Reference Lookup Sheets (included when exporting `Template File`):** `Accounts`, `Channels`, `Provinces` populated from `MOCK_ACCOUNTS`, `MOCK_CHANNELS`, and `MOCK_PROVINCE_HIERARCHY`.

---

## 3. Store List View (`/tools/store`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron (`ChevronDown` / `ChevronRight`)[span_2](start_span)[span_2](end_span).
- **Filter Inputs (4-Column Responsive Grid):**
  1. **`Channel`:** Clearable Select from `MOCK_CHANNELS` (`placeholder: "Select one"`)[span_3](start_span)[span_3](end_span).
  2. **`Chain` (Account):** Clearable Select from `MOCK_ACCOUNTS` formatted as `{code} - {name}` (`placeholder: "Select chain"`)[span_4](start_span)[span_4](end_span).
  3. **`Region / Area`:** Clearable Select derived from unique `area` values (`placeholder: "Select region"`)[span_5](start_span)[span_5](end_span).
  4. **`Province/City`:** Clearable Select filtered by selected `Region / Area` (`placeholder: "Select province/city"`)[span_6](start_span)[span_6](end_span).
  5. **`Store Code`:** Text input (`placeholder: "Store code"`)[span_7](start_span)[span_7](end_span).
  6. **`Store Name`:** Text input (`placeholder: "Store name"`)[span_8](start_span)[span_8](end_span).
  7. **`Province/City (New)`:** Clearable Select from `MOCK_NEW_PROVINCES` (`placeholder: "Select province/city"`)[span_9](start_span)[span_9](end_span).
  8. **`Ward/Commune (New)`:** Clearable Select filtered by selected `Province/City (New)` (`placeholder: "Select ward/commune"`)[span_10](start_span)[span_10](end_span).
- **Status Checkbox Row:**
  - Label `"Status :"` above checkbox `"InActive"`[span_11](start_span)[span_11](end_span).
  - **Behavior:** Unchecked by default (displays `status === 'Active'` stores, or all stores if configured; when `"InActive"` is checked, filters specifically for `status === 'Inactive'` stores)[span_12](start_span)[span_12](end_span).
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`, white `Search` icon + `"Search"`): Applies all active filters and resets pagination to page `1`[span_13](start_span)[span_13](end_span).
    - `Export Report` button (`var(--color-success-accent)`, white `Download` icon + `"Export Report"`): Downloads filtered store records as `.xlsx` / `.csv`[span_14](start_span)[span_14](end_span).
    - `Template File` button (amber accent `#F59E0B`, white `Download` icon + `"Template File"`): Generates and downloads `StoreList.xlsx` matching Section 2.3[span_15](start_span)[span_15](end_span).
  - **Right Group:**
    - `Import File` button (`var(--color-success-accent)`, white `Plus` icon + `"Import File"`): Opens a file picker modal accepting `.xlsx` files, parses `StoreList` rows, validates `Store Code (*)`, `Store Name (*)`, `Address (*)`, and appends/updates records in state[span_16](start_span)[span_16](end_span).
    - `Clear` icon button (`X`, `var(--color-primary)`): Resets all filter dropdowns/inputs and inline column filters[span_17](start_span)[span_17](end_span).

### 3.2. Pagination & Store Data Table
- **Top & Bottom Pagination Controls:** Centered navigation (`<<`, `<`, page numbers, `>`, `>>`), `"Showing {start} to {end} of {total} entries"`, and page size selector defaulting to `20` (options: `20`, `50`, `100`)[span_18](start_span)[span_18](end_span).
- **Table Structure (2 Header Rows):**
  - **Row 1 (Column Headers):** Bold column labels with ascending/descending sort toggles (`ArrowUpDown`)[span_19](start_span)[span_19](end_span). The rightmost action header displays the **`Create`** primary button (`var(--color-primary)`, white `"Create"` text) which opens the **Store Form Modal** in `'create'` mode[span_20](start_span)[span_20](end_span).
  - **Row 2 (Inline Quick-Filter Row):** Compact text inputs (`height: 28px`, `border: 1px solid var(--border-color)`) under searchable columns for instant client-side filtering[span_21](start_span)[span_21](end_span).

| # | Column Header (EN) | `StoreRecord` Key | Sortable | Inline Filter | Alignment / Display Format |
|---|---|---|---|---|---|
| 1 | `No.` | Computed index | Yes | Text input | Center (`(page - 1) * pageSize + rowIndex + 1`)[span_22](start_span)[span_22](end_span) |
| 2 | `Overview` | `overview` | No | Blank | Center (displays `overview` or blank)[span_23](start_span)[span_23](end_span) |
| 3 | `Region` | `area` | Yes | Text input | Center (e.g., `Mien Dong`, `Song Tien`, `Song Hau`)[span_24](start_span)[span_24](end_span) |
| 4 | `Channel` | `channelName` | Yes | Text input | Center (e.g., `Hyper`, `Super`, or blank)[span_25](start_span)[span_25](end_span) |
| 5 | `Chain` | `accountCode` / `accountName` | Yes | Text input | Center — 2-line cell: bold `accountCode` over `accountName`[span_26](start_span)[span_26](end_span) |
| 6 | `Store Code` | `storeCode` | Yes | Text input | Center (e.g., `A103`, `A112`, `BI26`, `S071`)[span_27](start_span)[span_27](end_span) |
| 7 | `Store Name` | `storeName` | Yes | Text input | Left (e.g., `Mega Vung Tau`)[span_28](start_span)[span_28](end_span) |
| 8 | `Address` | `address` | Yes | Text input | Left (full street address)[span_29](start_span)[span_29](end_span) |
| 9 | `Closed Date` | `closedDate` | Yes | Text input | Center (`YYYY-MM-DD` or blank)[span_30](start_span)[span_30](end_span) |
| 10 | `Province/City (New)` | `newProvince` | Yes | Text input | Center (e.g., `Ho Chi Minh City`, `Dong Thap Province`)[span_31](start_span)[span_31](end_span) |
| 11 | `Ward/Commune (New)` | `newTown` | Yes | Text input | Center (e.g., `Phu Tuc Commune` or blank)[span_32](start_span)[span_32](end_span) |
| 12 | `Actions` (`Create` btn) | — | No | Blank | Center — Square outline/amber icon button with `Pencil` edit icon; clicking opens the **Store Form Modal** in `'update'` mode pre-filled with that row's record[span_33](start_span)[span_33](end_span) |

---

## 4. Unified Create & Update Store Modal (`StoreFormModal`)
A single reusable modal component (`max-width: 1180px`, expandable via header expand toggle) shared by both **Insert** (`mode === 'create'`) and **Update** (`mode === 'update'`) flows[span_34](start_span)[span_34](end_span).

### 4.1. Modal Header
- **Left Title:**
  - Create Mode (`mode === 'create'`): `"Insert"`[span_35](start_span)[span_35](end_span)
  - Update Mode (`mode === 'update'`): `"Update"`
- **Right Controls:** Expand/Collapse width icon button (`Maximize2` / `Minimize2`) + Close (`X`) icon button[span_36](start_span)[span_36](end_span).

### 4.2. Form Body Structure
1. **Top Store Photo Banner Box:**
   - Full-width bordered preview frame (`height: 150px`, `border: 1px solid var(--border-color)`, `border-radius: var(--radius-sm)`, `position: relative`)[span_37](start_span)[span_37](end_span).
   - Displays uploaded/existing store storefront image (`storeImageUrl`) or a clean placeholder (`"No store image"` with `Image` icon)[span_38](start_span)[span_38](end_span).
   - Bottom-right overlay button **`Choose Image`** (`ImagePlus` icon + `"Choose Image"`) accepting local image selection (`FileReader` / `URL.createObjectURL`)[span_39](start_span)[span_39](end_span).
2. **4-Column Store Detail Grid (`4 columns x 6 rows`):**
   - **Row 1:**
     1. `Channel`: Select from `MOCK_CHANNELS` (`placeholder: "Select one"`)[span_40](start_span)[span_40](end_span)
     2. `Chain`: Select from `MOCK_ACCOUNTS` (`placeholder: "Select chain"`)[span_41](start_span)[span_41](end_span)
     3. `Supplier`: Select from `MOCK_SUPPLIERS` (`placeholder: "Select one"`)[span_42](start_span)[span_42](end_span)
     4. `Store Type`: Select from `MOCK_STORE_TYPES` (`placeholder: "Select one"`)[span_43](start_span)[span_43](end_span)
   - **Row 2 (Required Identity & Address Fields):**
     1. `Store Code *`: Clearable text input (`required`, with clear `X` suffix button)[span_44](start_span)[span_44](end_span)
     2. `Store Name *`: Clearable text input (`required`, with clear `X` suffix button)[span_45](start_span)[span_45](end_span)
     3. `Address *` (spans columns 3–4): Clearable text input (`required`, with clear `X` suffix button)[span_46](start_span)[span_46](end_span)
   - **Row 3 (Cascading Administrative Location):**
     1. `Region / Area`: Select from `MOCK_PROVINCE_HIERARCHY` areas (`placeholder: "Select one"`)[span_47](start_span)[span_47](end_span)
     2. `Province/City`: Select filtered by selected `Region / Area` (`placeholder: "Select one"`)[span_48](start_span)[span_48](end_span)
     3. `District`: Select filtered by selected `Province/City` (`placeholder: "Select one"`)[span_49](start_span)[span_49](end_span)
     4. `Ward/Commune`: Select filtered by selected `District` (`placeholder: "Select one"`)[span_50](start_span)[span_50](end_span)
   - **Row 4 (Dates & Latitude):**
     1. `Active Date`: Date input (`type="date"`)[span_51](start_span)[span_51](end_span)
     2. `Closed Date`: Date input (`type="date"`)[span_52](start_span)[span_52](end_span)
     3. `District / Town Note`: Text input[span_53](start_span)[span_53](end_span)
     4. `Latitude`: Numeric/decimal text input[span_54](start_span)[span_54](end_span)
   - **Row 5 (Coordinates & Legacy Code):**
     1. `Longitude`: Numeric/decimal text input[span_55](start_span)[span_55](end_span)
     2. `Accuracy`: Numeric text input[span_56](start_span)[span_56](end_span)
     3. `Coordinate Source`: Text input[span_57](start_span)[span_57](end_span)
     4. `Old Store Code`: Text input[span_58](start_span)[span_58](end_span)
   - **Row 6 (Contact & Visit Frequency):**
     1. `Code Change Note`: Text input[span_59](start_span)[span_59](end_span)
     2. `Mobile`: Tel/text input[span_60](start_span)[span_60](end_span)
     3. `Email`: Email input[span_61](start_span)[span_61](end_span)
     4. `Frequency *`: Numeric input + interactive range slider (`min={1}`, `max={30}`, default `1`) with a green checkmark badge (`var(--color-success-accent)`)[span_62](start_span)[span_62](end_span)
   - **Row 7 (New Administrative Mapping & Location Codes):**
     1. `Location Code`: Text input[span_63](start_span)[span_63](end_span)
     2. `Province/City (New)`: Select from `MOCK_NEW_PROVINCES` (`placeholder: "Select province/city"`)[span_64](start_span)[span_64](end_span)
     3. `Ward/Commune (New)`: Select filtered by `Province/City (New)` (`placeholder: "Select ward/commune"`)[span_65](start_span)[span_65](end_span)
     4. `Unit Code`: Text input[span_66](start_span)[span_66](end_span)

### 4.3. Mode-Specific Initialization & Footer Actions
- **Create Mode (`mode === 'create'`):**
  - Initializes all text/dropdown inputs empty (`""`), `frequency` to `1`, and `status` to `'Active'`[span_67](start_span)[span_67](end_span).
- **Update Mode (`mode === 'update'`):**
  - **CRITICAL:** Pre-fills **every** field in Sections 4.2.1 and 4.2.2 (`storeImageUrl`, `channelCode`, `accountCode`, `supplierCode`, `storeType`, `storeCode`, `storeName`, `address`, `area`, `province`, `district`, `town`, `activeDate`, `closedDate`, `districtTownNote`, `latitude`, `longitude`, `accuracy`, `coordinateSource`, `oldStoreCode`, `codeChangeNote`, `mobile`, `email`, `frequency`, `locationCode`, `newProvince`, `newTown`, `unitCode`) with the exact values of the selected `StoreRecord`.
- **Status Derivation Rule:** If `closedDate` is populated, automatically mark `status = 'Inactive'`; otherwise `'Active'`.
- **Modal Footer (Bottom-Right Aligned):**
  - `display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px`[span_68](start_span)[span_68](end_span):
  1. **`Cancel` Button:** Outline/secondary button (`X` icon + `"Cancel"` text). Discards changes and closes modal[span_69](start_span)[span_69](end_span).
  2. **`Insert` / `Update` Button:** Primary solid button (`background: var(--color-success-accent)` or `var(--color-primary)`, white `Check` icon + `"Insert"` in create mode or `"Update"` in edit mode)[span_70](start_span)[span_70](end_span).
     - **Validation:** Requires non-empty `storeCode`, `storeName`, `address`, and `frequency >= 1` (displays inline error message if missing)[span_71](start_span)[span_71](end_span).
     - **Action:** In `'create'` mode, prepends the new `StoreRecord` to `stores` state; in `'update'` mode, updates the matching record in state in real time, then closes the modal.
