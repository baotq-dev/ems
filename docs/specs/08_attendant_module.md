# 08 - Attendance Management & Verification Module Specification
**Spec ID:** `SPEC-08`  
**Routes & Menu Integration:**
1. **Face Verification & Attendance Logs:** `Report > Attendant` (`/report/attendant`)
2. **Monthly Attendance Timesheet:** `Report > Timesheet` (`/report/timesheet`)
3. **Attendance & Image Verification Dashboard:** `Dashboard > Attendant Summary` (`/dashboard/attendant-summary`)

*(Note on Navigation & Routing Updates (`SPEC-02`, `SPEC-03`): Add `Dashboard` as a top-level parent menu with sub-menu `Attendant Summary` (`/dashboard/attendant-summary`), and add `Timesheet` (`/report/timesheet`) under the `Report` parent menu in `NAVIGATION_MENU` and `ProtectedRoute`.)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the three pages (`AttendantPage`, `TimesheetPage`, `AttendantSummaryPage`), modals, charts, and mock datasets defined in this document.
- **Theme Consistency (CRITICAL):** Always apply the active enterprise theme tokens from `SPEC-04` (`var(--color-primary)` / `#D32F2F`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`). Do NOT introduce mismatched green header bars or unconfigured primary colors.
- **No Unrequested Backend Calls:** All filtering, image verification status updates, manual attendance additions, timesheet aggregations, and chart calculations must operate client-side against `src/mocks/attendantMockData.ts`.
- **Language Consistency:** All UI labels, filter placeholders, legend badges, table headers, chart titles, and mock records MUST be rendered in **English**.

---

## 2. Data Models & Mock Data (`src/mocks/attendantMockData.ts`)

### 2.1. TypeScript Interfaces
```typescript
export type FaceVerificationStatus = 'Matched' | 'Mismatched' | 'ScanFailed';

export type TimesheetDayCode =
  | 'X'     // Full working day
  | 'X/2'   // Half working day
  | 'OFF'   // Scheduled day off
  | 'H'     // Holiday
  | 'AL'    // Annual Leave
  | 'UL'    // Unpaid Leave
  | 'Q'     // Absent / Unexcused
  | 'W_OFF'; // Worked on scheduled day off

export type TimesheetCellHighlight =
  | 'none'
  | 'confirmed'      // Blue
  | 'rejected'       // Orange
  | 'absent'         // Red
  | 'not_checked_out'// Yellow
  | 'worked_off_day';// Green

export interface AttendantLogRecord {
  id: string;
  region: 'North' | 'Central' | 'South';
  zone: string;               // e.g., "A", "B", "C"
  channel: string;            // e.g., "GT", "MT"
  chain: string;              // e.g., "Emart", "Co.opmart", "WinMart"
  storeCode: string;          // e.g., "HCM_BINH_TAN"
  storeName: string;          // e.g., "EMART_BINH TAN"
  storeAddress: string;
  province: string;
  supervisorId: string;
  supervisorName: string;
  userId: string;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  position: string;           // e.g., "PG-Inline", "SUP-D"
  workDate: string;           // YYYY-MM-DD
  shiftCode: string;          // e.g., "CA_AM", "CA_PM"
  shiftTimeRange: string;     // e.g., "09:00-15:00"
  checkInTime?: string;       // e.g., "08:58"
  checkOutTime?: string;      // e.g., "15:02"
  checkInPhotoUrl?: string;
  checkOutPhotoUrl?: string;
  verificationStatus: FaceVerificationStatus;
  checkInDistanceMeters: number;
  checkOutDistanceMeters?: number;
  totalDuration: string;      // Format: "HH:mm:ss", e.g., "06:04:12"
}

export interface TimesheetDayEntry {
  day: number;                // 1..31
  code: TimesheetDayCode | string; // e.g., "X", "OFF", "AL", or "02:53" if incomplete
  highlight: TimesheetCellHighlight;
}

export interface EmployeeTimesheetRow {
  id: string;
  supervisorId: string;
  supervisorName: string;
  employeeCode: string;       // e.g., "MER.HCM25"
  employeeName: string;
  position: string;           // e.g., "MER", "PG-Inline"
  month: string;              // "YYYY-MM"
  days: TimesheetDayEntry[];
}
```

### 2.2. Required Demo Mock Datasets
Create `src/mocks/attendantMockData.ts` with rich, realistic records so every chart, filter, and table renders populated data immediately:
- **`MOCK_ATTENDANT_LOGS`:** At least 15–20 check-in/check-out records spanning multiple dates, stores (`Emart`, `Co.opmart`, `WinMart`), employees, and all 3 `FaceVerificationStatus` values (`Matched`, `Mismatched`, `ScanFailed`), using clean avatar/selfie placeholder images for `checkInPhotoUrl` and `checkOutPhotoUrl`.
- **`MOCK_TIMESHEET_ROWS`:** At least 10 employee monthly timesheet rows for the current month (`days` 1–30/31) showcasing diverse codes (`X`, `X/2`, `OFF`, `AL`, `UL`, `H`, `Q`, `02:53`) and cell highlights (`confirmed`, `rejected`, `absent`, `not_checked_out`, `worked_off_day`).

---

## 3. Part 1: Face Verification & Attendance Logs (`/report/attendant`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (4-Column Responsive Grid):**
  1. `Date Range` (`From Date - To Date` date range input)
  2. `Channel` (Clearable Select: `MT`, `GT`)
  3. `Chain` (Clearable Select: `Emart`, `Co.opmart`, `WinMart`, `Lotte Mart`)
  4. `Zone` (Clearable Select: `A`, `B`, `C`)
  5. `Province/City` (Clearable Select)
  6. `Supervisor` (Clearable Select)
  7. `Position` (Clearable Select)
  8. `Employee` (Clearable Select displaying `{employeeCode} - {employeeName}`)
  9. `Store Code` (Text input, placeholder `"Enter store code"`)
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`): Applies all active filters to `MOCK_ATTENDANT_LOGS`.
    - `Export File` button (`var(--color-primary)`): Exports filtered attendance logs to `.csv`.
  - **Right Group:**
    - `Image Verification Stats` button (Soft rose/primary-tinted button `var(--color-primary-soft-bg)` with `var(--color-primary)` text & `Eye` icon): Navigates directly to `/dashboard/attendant-summary`.
    - `Add` button (`var(--color-primary)` with `UserPlus` icon): Opens a modal to manually record a new attendance entry into state.

### 3.2. Verification Legend & Data Table
- **Top Bar Above Table:**
  - Centered Pagination Controls (`<<`, `<`, page numbers, `>`, `>>`, `"Showing X to Y of Z entries"`, page size `20`).
  - Right-aligned **Image Verification Legend:**
    - `Image Verification Legend:`
    - Green Star (`var(--color-success-accent)`): `Matched`
    - Amber Star (`#F59E0B`): `Mismatched`
    - Red Star (`var(--color-primary)`): `Scan Failed`
- **Table Columns (with inline text quick-filter inputs under `Zone`, `Chain`, `Store Name`, `Address`, `Employee Name`):**
  1. `No.` (Center)
  2. `Zone` (`zone`, sortable, inline filter)
  3. `Chain` (`chain`, sortable, inline filter)
  4. `Store Name` (2-line cell: bold `storeCode` over `storeName`, sortable, inline filter)
  5. `Address` (`storeAddress`, inline filter)
  6. `Employee Name` (3-line cell: bold `phoneNumber`, `employeeName`, muted `position`, sortable, inline filter)
  7. `Date & Shift` (3-line cell: `workDate`, bold `shiftCode`, `(shiftTimeRange)`, sortable)
  8. `Check-in - Check-out` (Side-by-side thumbnail pair with timestamps `checkInTime` and `checkOutTime` above each photo, plus a corner star badge indicating `verificationStatus`. Clicking a photo opens an enlarged preview modal.)
  9. `Distance` (2-line cell: `In: {checkInDistanceMeters} (m)` and `Out: {checkOutDistanceMeters ?? 0} (m)`)
  10. `Total Duration` (`totalDuration`, sortable, bold)
  11. `Actions` (`#` — Split button with `Pencil` edit icon and dropdown chevron allowing supervisor override of `verificationStatus` between `Matched`, `Mismatched`, and `ScanFailed`).

---

## 4. Part 2: Monthly Attendance Timesheet (`/report/timesheet`)

### 4.1. Collapsible Search Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (4-Column Grid):**
  1. `Date Range` (`From Date - To Date` selecting the target month period)
  2. `Supervisor` (Clearable Select)
  3. `Position` (Clearable Select)
  4. `Employee` (Clearable Select)
- **Action Toolbar:**
  - `Search` button (`var(--color-primary)`): Filters the timesheet matrix.
  - `Export Excel` button (`var(--color-success-accent)`): Downloads the visible timesheet matrix as `.csv`/`.xlsx`.

### 4.2. Color Status Legend Strip
Horizontal legend bar displayed above the pagination and table:
- Blue Swatch (`#0284C7`): `1_Confirm`
- Orange Swatch (`#F97316`): `1_Reject`
- Crimson Red Swatch (`var(--color-primary)`): `Absent`
- Yellow Swatch (`#EAB308`): `Not Checked Out`
- Green Swatch (`var(--color-success-accent)`): `Worked on Day Off`

### 4.3. Multi-Header Monthly Matrix Table
- **Pagination Bar:** `<<`, `<`, page numbers, `>`, `>>`, `"Showing X to Y of Z entries"`, page size `10` (options: `10`, `20`, `50`).
- **Frozen Left Columns (Sticky left on horizontal scroll):**
  1. `No.`
  2. `Supervisor` (`supervisorName`)
  3. `Employee` (2-line cell: bold `employeeCode` over `{employeeName} ({position})`)
- **Dynamic Calendar Day Columns (`1` through `30`/`31`):**
  - **Top Group Header:** Month name (e.g., `September`, `November`) spanning all day columns, styled with dark neutral/charcoal header (`#4B5563`) and white bold text.
  - **Sub-Header Row 1 (Weekday):** `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`. **Sunday (`Sun`) headers** are highlighted in dark rust/brown (`#7C2D12`) with white text.
  - **Sub-Header Row 2 (Day Number):** `1`, `2`, ..., `31` (with Sunday day numbers matching the `#7C2D12` highlight).
  - **Data Cells:** Displays `dayEntry.code` (`X`, `X/2`, `OFF`, `AL`, `UL`, `H`, `Q`, or `HH:mm`). If `dayEntry.highlight !== 'none'`, fills the cell background with the corresponding legend color and contrasting text.

---

## 5. Part 3: Attendance & Image Verification Dashboard (`/dashboard/attendant-summary`)

### 5.1. Filter Bar
Top white filter card (`border: 1px solid var(--border-color)`, `padding: 16px`) containing:
- **Row 1 (4-Column Grid):**
  1. `Date Range` (`From Date - To Date`)
  2. `Zone` (Clearable Select)
  3. `Chain` (Clearable Select)
  4. `Supervisor` (Clearable Select)
- **Row 2 (3-Column Grid):**
  1. `Store` (Clearable Select)
  2. `Group By` (Select: `By Employee`, `By Store`, `By Supervisor`)
  3. `Search` button (`var(--color-primary)` with `Search` icon)

### 5.2. Analytical Charts & Verification Breakdown
Render responsive, interactive charts (using SVG/Recharts/Chart.js or clean custom responsive SVG visualizations with hover tooltips) computed dynamically from the filtered `MOCK_ATTENDANT_LOGS`:

1. **Chart 1: Daily PA Attendance Statistics (`Daily PA Attendance Statistics`)**
   - Full-width combo bar + line chart across dates in the selected range (`DD/MM`).
   - Series: `Scheduled Users` (Blue bar), `Checked-in Users` (Green bar), `Attendance Rate (%)` (Red line with percentage labels).
2. **Chart 2: Daily Supervisor Attendance Statistics (`Daily Supervisor Attendance Statistics`)**
   - Full-width combo bar + line chart across dates in the selected range (`DD/MM`) for Supervisor-level roles.
   - Series: `Scheduled Users`, `Checked-in Users`, `Attendance Rate (%)`.
3. **Row 3 — 3-Column Donut Chart Grid (Attendance & Image Verification Rates):**
   - **Donut 1:** `Overall Attendance & Verification Rate` (Center bold percentage + breakdown of `Checked-in / Matched` vs. `Unverified / Absent`).
   - **Donut 2:** `PA Attendance & Verification Rate` (Filtered to PA/PG roles).
   - **Donut 3:** `Supervisor Attendance & Verification Rate` (Filtered to Supervisor roles).
   - **Image Verification Status Summary Strip:** Displays exact counts and percentages for `Matched` (Green), `Mismatched` (Amber), and `Scan Failed` (Red) derived from `MOCK_ATTENDANT_LOGS`.
4. **Chart 4: PA Attendance Statistics by Supervisor (`PA Attendance Statistics by Supervisor`)**
   - Tab switcher above card: `PA` | `SUP`.
   - Full-width horizontal-scrollable bar/line chart displaying attendance counts and rate (`%`) grouped per Supervisor name along the X-axis.
