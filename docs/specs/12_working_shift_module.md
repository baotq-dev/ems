# 12 - Working Shift Management Module Specification (`Tools > Working Shift`)
**Spec ID:** `SPEC-12`  
**Parent Menu:** `Tools` | **Sub-Menu:** `Working Shift` | **Route:** `/tools/working-shift`

*(Note on Navigation, Routing & Translation Updates (`SPEC-02`, `SPEC-03`, `SPEC-11`): Add `Tools` as a top-level parent menu with sub-menu `Working Shift` (`/tools/working-shift`) in `NAVIGATION_MENU` and `ProtectedRoute`. In `SPEC-11` translations, map `Tools` $\leftrightarrow$ `Công cụ` and `Working Shift` $\leftrightarrow$ `Ca làm việc`.)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Working Shift list view, filter bar, `.xlsx` template export/import logic, Insert Shift modal, Update Shift modal, and mock shift dataset defined in this document.
- **Theme Consistency (CRITICAL):** Always apply the active enterprise theme CSS variables from `SPEC-04` and `SPEC-11` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`). Do NOT hardcode green or blue header bars from reference layouts.
- **No Unrequested Backend Calls:** All filtering, pagination, manual creation/editing, and Excel template import/export must execute client-side against `src/mocks/workingShiftMockData.ts`.
- **Language Consistency:** Support bilingual rendering (`en` / `vi`) via `useI18n()` (`SPEC-11`), defaulting to **English** labels as specified below.

---

## 2. Data Model, Excel Template Schema & Mock Data (`src/mocks/workingShiftMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export type ShiftRefCode = 'ON' | 'OFF';

export interface ShiftGroupOption {
  code: string; // e.g., "PA", "PA_KHO", "AUDITOR", "SUP"
  name: string; // e.g., "PA", "PA KHO", "AUDITOR", "SUP - ON"
}

export interface WorkingShiftRecord {
  id: string;
  shiftGroup: string;      // e.g., "PA"
  groupName: string;       // e.g., "PA"
  shiftCode: string;       // e.g., "AM07H00"
  shiftName: string;       // e.g., "07:00 - 15:00"
  fromTime: string;        // Format: "HH:mm", e.g., "07:00"
  toTime: string;          // Format: "HH:mm", e.g., "15:00"
  value: number;           // Shift coefficient / workday value, e.g., 1 or 6
  sortOrder?: number;      // Optional display sort index
  refCode: ShiftRefCode;   // "ON" (working) or "OFF" (day off)
  isOt: boolean;           // Overtime flag
  isActive: boolean;       // Active status flag (defaults to true)
  skipReport: boolean;     // Exclude from attendance/shift report flag
  note?: string;
}
```

### 2.2. Exact `.xlsx` Template & Import File Schema (`TemplateShiftList.xlsx`)
Both **`Template File`** download and **`Import File`** upload (using `xlsx` / SheetJS) MUST follow the exact structure of `TemplateShiftList.xlsx`:
- **Sheet Name:** `ShiftList`
- **Title Block (Rows 1–2):**
  - **Row 1, Col D (`D1`):** `"SHIFT LIST"`
  - **Row 2:** Blank separator row
- **Header Row (Row 3, Cols A–M):**
  1. `No.`
  2. `ShiftGroup*` (Required)
  3. `GroupName*` (Required)
  4. `RefCode*` (Required — `"ON"` or `"OFF"`)
  5. `ShiftCode*` (Required)
  6. `ShiftName*` (Required)
  7. `From` (`HH:mm`, e.g., `"07:00"`)
  8. `To` (`HH:mm`, e.g., `"15:00"`)
  9. `Value` (Numeric, defaults to `1`)
  10. `Note` (Optional text)
  11. `Order` (Optional numeric `sortOrder`)
  12. `OT` (Boolean indicator: `1` / `TRUE` / `Yes` $\rightarrow$ `true`, else `false`)
  13. `Status` (Boolean/status indicator: `1` / `Active` / `TRUE` $\rightarrow$ `true`, `0` / `Inactive` $\rightarrow$ `false`; defaults to `true`)

### 2.3. Required Demo Mock Data (`src/mocks/workingShiftMockData.ts`)
- **`MOCK_SHIFT_GROUPS`:** Predefined dropdown options including:
  - `{ code: 'PA', name: 'PA' }`
  - `{ code: 'PA_KHO', name: 'PA KHO' }`
  - `{ code: 'AUDITOR', name: 'AUDITOR' }`
  - `{ code: 'SUP', name: 'SUP - ON' }`
- **`INITIAL_WORKING_SHIFTS`:** At least 12–15 realistic shift records across `PA`, `PA_KHO`, `AUDITOR`, and `SUP` (e.g., `AM07H00` `07:00 - 15:00`, `AM07H30` `07:30 - 15:00`, `AM09H00` `09:00 - 15:00`, `AM0714` `07:00 - 14:00`, `PM1420` `14:01 - 20:00`, `PMPA` `PM-PA(15:00-22:00)`, `AMPA` `AM-PA(09:00-15:00)`, `PA-AM` `PA-AM(09:00-15:00)`, `PA-PM` `PA-PM(15:00-21:00)`).

---

## 3. Working Shift List View (`/tools/working-shift`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (Horizontal Row):**
  1. **`Shift Group` (`Shift`):** Clearable Select dropdown populated from `MOCK_SHIFT_GROUPS` formatted as `{code} - {name}` (e.g., `"PA - PA"`, `"SUP - SUP - ON"`).
  2. **`Status`:** Checkbox input labeled `"Active"` (checked by default `true`; when checked, filters `isActive === true`; when unchecked, shows inactive or all records).
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`, white `Search` icon + `"Search"`): Applies filter criteria to `workingShifts` state.
    - `Export Report` button (`var(--color-success-accent)`, white `Download` icon + `"Export Report"`): Exports filtered shift records to `.csv` / `.xlsx`.
  - **Right Group:**
    - `Template File` button (amber accent `#F59E0B`, `Download` icon + `"Template File"`): Generates and downloads `TemplateShiftList.xlsx` matching Section 2.2 with sample rows.
    - `Add` button (`var(--color-primary)`, `FilePlus` icon + `"Add"`): Opens the **Insert Working Shift Modal** (Section 4.1).
    - `Import File` button (`var(--color-success-accent)`, `Plus` icon + `"Import File"`): Opens a file picker modal accepting `.xlsx` files, parses the `ShiftList` sheet per Section 2.2, validates required columns (`ShiftGroup*`, `GroupName*`, `RefCode*`, `ShiftCode*`, `ShiftName*`), and appends/updates records in state.
    - `Clear` icon button (`X`): Resets filter dropdown and inline column filters.

### 3.2. Pagination & Shift Data Table
- **Top Pagination Controls:** `<<`, `<`, page numbers, `>`, `>>`, `"Showing {start} to {end} of {total} entries"`, and page size selector defaulting to `50` (options: `20`, `50`, `100`).
- **Table Columns (with inline text/filter inputs in Row 2 under searchable columns):**
  1. `No.` (Center)
  2. `Shift Group` (`shiftGroup`, Center, inline text filter)
  3. `Group Name` (`groupName`, Center, inline text filter)
  4. `Shift Code` (`shiftCode`, Center, inline text filter)
  5. `Shift Name` (`shiftName`, Center, inline text filter)
  6. `OT` (`isOt`, Center — read-only checkbox indicator)
  7. `From` (`fromTime`, Center, inline text filter)
  8. `To` (`toTime`, Center, inline text filter)
  9. `Value` (`value`, Center, inline text filter)
  10. `Ref Code` (`refCode`, Center — `"ON"` / `"OFF"`, inline text filter)
  11. `Skip Report` (`skipReport`, Center — read-only checkbox indicator)
  12. `Note` (`note`, Left, inline text filter)
  13. `Actions` (`#` — Center, circular outline icon button with `Pencil` edit icon; clicking opens the **Update Working Shift Modal** pre-filled with that row's data).

---

## 4. Insert & Update Working Shift Modals

### 4.1. Insert Working Shift Modal (`InsertShiftModal`)
Triggered by clicking **`+ Add`**. Renders a clean modal (`max-width: 820px`):
- **Header:** Title `"Insert"` + top-right close `X` icon button.
- **Form Grid:**
  - **Row 1 (2 Columns):**
    1. `Shift Group *` (Required Select from `MOCK_SHIFT_GROUPS`, placeholder `"Select group name"`)
    2. `Shift Code` (Text input, e.g., `"AM07H00"`)
  - **Row 2 (Full Width):**
    1. `Shift Name` (Text input, e.g., `"07:00 - 15:00"`)
  - **Row 3 (4 Columns):**
    1. `From` (Time input `type="time"`, default `"00:00"`)
    2. `To` (Time input `type="time"`, default `"00:00"`)
    3. `Value` (Numeric input `type="number"`, step `"0.5"`, default `1`)
    4. `Sort Order` (Numeric input `type="number"`, optional)
  - **Row 4 (4-Column Boolean & Toggle Strip):**
    1. `Ref Code`: Toggle switch between `ON` (active green `var(--color-success-accent)`) and `OFF` (neutral gray), defaulting to `ON`.
    2. `OT`: Checkbox labeled `"Yes"` / `"No"` dynamically reflecting checked state (default unchecked `No`).
    3. `Status`: Checkbox labeled `"Active"` / `"Inactive"` dynamically reflecting checked state (default checked `Active`).
    4. `Skip Report`: Checkbox labeled `"Yes"` / `"No"` dynamically reflecting checked state (default unchecked `No`).
  - **Row 5 (Full Width):**
    1. `Note` (Text input)
- **Footer (Bottom-Right Aligned):**
  1. `Cancel` button (`background: var(--color-primary)`, white text): Discards input and closes modal.
  2. `Add` button (`background: var(--color-success-accent)` or `var(--color-primary-hover)`, white text): Validates required fields (`shiftGroup`, `shiftCode`, `shiftName`), prepends the new `WorkingShiftRecord` to state, and closes modal.

### 4.2. Update Working Shift Modal (`UpdateShiftModal`)
Triggered by clicking the row **`Edit` (`Pencil`)** button:
- **Header:** Title `"Update"` + top-right close `X` icon button.
- **Form Fields:** Identical 5-row field layout to `InsertShiftModal` (Section 4.1), pre-populated with the selected `WorkingShiftRecord`'s values (`shiftGroup`, `shiftCode`, `shiftName`, `fromTime`, `toTime`, `value`, `sortOrder`, `refCode`, `isOt`, `isActive`, `skipReport`, `note`).
- **Footer (Bottom-Right Aligned):**
  1. `Cancel` button (`background: var(--color-primary)`, white text): Closes modal without saving.
  2. `Update` button (`background: var(--color-success-accent)` or `var(--color-primary-hover)`, white text): Validates inputs, updates the matching record in `workingShifts` state in real time, and closes modal.
