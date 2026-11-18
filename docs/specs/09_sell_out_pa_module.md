# 09 - Sell Out PA Report Module Specification (`/report/sell-out-pa`)
**Spec ID:** `SPEC-09`  
**Parent Menu:** `Report` | **Sub-Menu:** `Sell Out PA` | **Route:** `/report/sell-out-pa`

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the Sell Out PA Report list view, expandable line-item breakdown, Create Sell-Out Modal, and mock datasets defined in this document.
- **Theme Consistency (CRITICAL):** Strictly apply the enterprise theme CSS variables from `SPEC-04` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`). Do NOT introduce teal or green table headers.
- **No Unrequested Backend Calls:** All filtering, line-item expansion, record creation, deletion, and CSV export must operate client-side against `src/mocks/sellOutMockData.ts`.
- **Language Consistency:** All UI labels, filter placeholders, modal headers, table columns, buttons, and mock records MUST be rendered in **English**.

---

## 2. Data Models & Mock Data (`src/mocks/sellOutMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export interface ProductCatalogItem {
  id: string;
  category: string;      // e.g., "Coffee", "Tea & RTD", "Nutrition"
  productGroup: string;  // e.g., "3-in-1 Instant Coffee", "Canned Coffee", "Cereal"
  productCode: string;   // e.g., "FE-CF001"
  productName: string;   // e.g., "MacCoffee Cafe Pho 24g x 10"
  existingTotalQty: number; // Cumulative recorded quantity prior to current entry
}

export interface SellOutLineItem {
  id: string;
  category: string;
  productGroup: string;
  productCode: string;
  productName: string;
  totalQuantity: number;
  quantity: number;      // Sold units recorded in this submission
  note?: string;
  osa: boolean;          // On-Shelf Availability indicator
}

export interface SellOutReportRecord {
  id: string;
  zoneCode: string;      // e.g., "HCM03", "HCM01", "HN01", "HP01"
  channel: string;       // e.g., "MT", "GT"
  chain: string;         // e.g., "Co.opmart", "WinMart", "Emart"
  province: string;
  storeCode: string;     // e.g., "MCP_Q3"
  storeName: string;     // e.g., "Co.opmart Nguyen Dinh Chieu"
  storeAddress: string;
  supervisorId: string;
  supervisorName: string;
  userId: string;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  position: string;      // e.g., "PG-D", "PG-Inline", "PA"
  recordedAt: string;    // Format: "YYYY-MM-DD HH:mm"
  shiftCode: string;     // e.g., "CA_AM", "CA_PM"
  totalQuantity: number; // Sum of `quantity` across all `items`
  items: SellOutLineItem[];
}
```

### 2.2. Required Demo Mock Datasets (`src/mocks/sellOutMockData.ts`)
- **`MOCK_PRODUCT_CATALOG`:** At least 8–10 realistic FMCG/beverage product SKUs grouped across 2–3 categories (`Coffee`, `Instant Cereal`, `Beverages`) so the Create Sell-Out product table displays rich filterable items.
- **`MOCK_SELL_OUT_RECORDS`:** At least 8–10 realistic sell-out submission records across multiple zones (`HCM01`, `HCM02`, `HCM03`, `HN01`, `HP01`), chains (`Co.opmart`, `WinMart`, `Emart`), employees, and dates, each containing 2–4 populated `SellOutLineItem` rows so row expansion works immediately on load.

---

## 3. Part 1: Sell Out PA Report Page (`/report/sell-out-pa`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (4-Column Responsive Grid):**
  1. `Date Range` (`From Date - To Date` date range input)
  2. `Channel` (Clearable Select: `MT`, `GT`)
  3. `Chain` (Clearable Select: `Co.opmart`, `WinMart`, `Emart`, `Lotte Mart`)
  4. `Zone` (Clearable Select: `HCM01`, `HCM02`, `HCM03`, `HN01`, `HP01`)
  5. `Province/City` (Clearable Select)
  6. `Supervisor` (Clearable Select)
  7. `Position` (Clearable Select: `PG-D`, `PG-Inline`, `PA`)
  8. `Employee` (Clearable Select displaying `{employeeCode} - {employeeName}`)
  9. `Store Code` (Text input, placeholder `"Enter store code"`)
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`): Applies active filters to `MOCK_SELL_OUT_RECORDS` and resets page to `1`.
    - `Export File` button (`var(--color-primary-hover)`): Downloads filtered sell-out summary records as a `.csv` file.
  - **Right Group:**
    - `Add` button (`Plus` icon + `"Add"`, `var(--color-primary)`): Opens the **Create Sell-Out Modal** (Section 4).

### 3.2. Sell-Out Report Data Table & Expandable Line Items
- **Top Pagination Controls:** `<<`, `<`, page numbers, `>`, `>>`, `"Showing X to Y of Z entries"`, and page size selector (`20`).
- **Master Table Columns (with inline text quick-filter inputs under `Zone`, `Chain`, `Store Name`, `Address`, `Employee Name`, `Date`, `Total`):**
  1. `Expand` toggle column (`ChevronRight` / `ChevronDown` button to reveal SKU breakdown)
  2. `No.` (Center)
  3. `Zone` (`zoneCode`, sortable, inline filter)
  4. `Chain` (`chain`, sortable, inline filter)
  5. `Store Name` (2-line cell: bold `storeCode` over `storeName`, sortable, inline filter)
  6. `Address` (`storeAddress`, sortable, inline filter)
  7. `Employee Name` (2-line cell: bold `phoneNumber` over `{employeeName} ({position})`, sortable, inline filter)
  8. `Date` (2-line cell: `recordedAt` over bold `shiftCode`, sortable, inline filter)
  9. `Total` (`totalQuantity`, Center, bold, sortable, inline filter)
  10. `Actions` (`#` — Center, circular/compact outline red `Trash2` icon button deleting the record after confirmation)

#### Expandable Line-Item Sub-Table (Rendered beneath expanded row)
Displays the recorded SKU breakdown (`record.items`) in a clean nested table:
- Columns: `No.` | `Category` | `Product Group` | `Product Code` | `Product Name` | `Quantity` | `OSA` (`Yes` / `No` badge) | `Note`

---

## 4. Part 2: Create Sell-Out Modal (`CreateSellOutModal`)
Triggered when clicking **`+ Add`** in the Sell Out PA Report toolbar. Renders a wide scrollable modal (`max-width: 1150px`) styled strictly with `SPEC-04` theme variables.

### 4.1. Modal Header
- **Title:** `"Create Sell-Out Report"`
- **Right Control:** Close (`X`) icon button.

### 4.2. Top Selection Bar & Conditional Store Visibility Rule (CRITICAL)
3-column horizontal form grid at the top of the modal body:
1. **`Date` Input:** Label `"Date"`, date picker defaulting to current date (`YYYY-MM-DD`).
2. **`Employee` Dropdown:** Label `"Employee"`, placeholder `"Select employee"`, options formatted as `{employeeCode} - {fullName} ({position})`.
3. **`Store` Dropdown (Conditional Rendering):**
   - **Initial State (`selectedEmployeeId === ''`):** The `Store` field MUST NOT be visible until the user selects an employee in the `Employee` dropdown.
   - **Active State (`selectedEmployeeId !== ''`):** Once an employee is chosen, smoothly reveal the `Store` dropdown (`placeholder: "Select store"`) alongside a compact refresh/reset icon button (`RotateCw`) that resets product quantities/filters.
   - Selecting a `Store` loads the `MOCK_PRODUCT_CATALOG` rows into the product entry table below (if no store is selected yet, the table displays `"No results found"`).

### 4.3. Product Entry Table
- **Table Header Styling:** Solid `var(--color-primary)` background with white bold text (`13px`).
- **Inline Quick-Filter Row:** Positioned directly below the header row with compact text inputs under `Category`, `Product Group`, `Product Code`, and `Product Name` for fast SKU lookup.
- **Columns:**
  1. `Bulk Delete` (Header red circular `Trash2` icon button to zero-out/clear selected rows + row checkbox)
  2. `No.` (Center)
  3. `Category` (`category`, inline filter)
  4. `Product Group` (`productGroup`, inline filter)
  5. `Product Code` (`productCode`, inline filter)
  6. `Product Name` (`productName`, inline filter)
  7. `Total Quantity` (`existingTotalQty + quantity`, Center, read-only)
  8. `Quantity` (Compact numeric `<input type="number" min={0} />` for entering sold quantity)
  9. `Note` (Compact text `<input type="text" placeholder="Note..." />`)
  10. `OSA` (Checkbox indicating On-Shelf Availability, checked by default)

### 4.4. Modal Footer (Bottom-Right Action Buttons)
Aligned strictly to the **bottom-right** (`display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px`):
1. **`Close` Button:** Neutral outline button (`border: 1px solid var(--border-color)`, `background: var(--bg-surface)`, `color: var(--text-primary)`). Closes the modal and discards unsaved inputs.
2. **`Save` Button:** Primary solid button (`background: var(--color-primary)`, hover `var(--color-primary-hover)`, white text).
   - **Validation:** Requires `Date`, `Employee`, `Store`, and at least one product row with `quantity > 0` (displays an inline validation alert if missing).
   - **Save Behavior:** Creates a new `SellOutReportRecord` containing all items where `quantity > 0`, computes `totalQuantity`, prepends the record to the top of `SellOutPaReportPage`'s table, and closes the modal.
