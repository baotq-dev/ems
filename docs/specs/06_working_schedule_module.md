# 06 - Working Schedule Module Specification (`/planning/work-schedule`)
**Spec ID:** `SPEC-06`  
**Parent Menu:** `Planning` | **Sub-Menu:** `Work Schedule` | **Route:** `/planning/work-schedule`

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the filter controls, employee list panel, monthly calendar grid, schedule statistics table, shift edit modal, and mock data structures defined in this specification.
- **No Unrequested Views:** Do NOT add Weekly/Daily calendar view toggles, drag-and-drop rescheduling, or backend API calls. Only the `Month` view is supported.
- **CSS & Theme Compliance:** Never hardcode hex colors inside component `.tsx` or `.css` files. Use CSS Custom Properties defined in `SPEC-04` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`, `var(--text-secondary)`).
- **Language Consistency:** All UI labels, calendar weekday headers, modal sections, table headers, and mock shift/store names MUST be rendered in **English**.

---

## 2. Mock Data & Types Specification (`src/mocks/shiftMockData.ts`)
Because no backend database is connected, create `src/mocks/shiftMockData.ts` containing deterministic mock records and supporting interfaces:

### 2.1. TypeScript Interfaces
```typescript
export interface ShiftOption {
  id: string;
  code: string;       // e.g., "MS", "AS", "FS"
  name: string;       // e.g., "Morning Shift", "Afternoon Shift", "Full Shift"
  startTime: string;  // e.g., "08:00"
  endTime: string;    // e.g., "16:00"
  hours: number;      // e.g., 8
  colorToken: 'teal' | 'navy' | 'green' | 'amber' | 'red';
}

export interface StoreOption {
  id: string;
  code: string;
  name: string;       // e.g., "Co.opmart Nguyen Dinh Chieu, D.3"
}

export interface AssignedShiftItem {
  id: string;
  shiftId: string;
  shiftCode: string;
  shiftName: string;
  storeId: string;
  storeName: string;
  checkInStatus: 'Not Checked In' | 'Checked In' | 'Late';
  colorToken: ShiftOption['colorToken'];
}

export interface ScheduleChangeRequestItem {
  id: string;
  defaultShift: string;
  requestedShiftTime: string;
  reason: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DailyScheduleRecord {
  userId: string;
  date: string; // ISO format: YYYY-MM-DD
  assignedShifts: AssignedShiftItem[];
  changeRequests: ScheduleChangeRequestItem[];
}
```

### 2.2. Required Mock Datasets (`src/mocks/shiftMockData.ts`)
- **`MOCK_SHIFTS`:** At least 4 predefined shifts (e.g., `MS - Morning Shift (08:00 - 16:00, 8h)`, `AS - Afternoon Shift (14:00 - 22:00, 8h)`, `FS - Full Shift (09:00 - 18:00, 8h)`, `OFF - Day Off (0h)`).
- **`MOCK_STORES`:** At least 5 predefined retail store locations (e.g., `Co.opmart Nguyen Dinh Chieu, D.3`, `WinMart Le Thanh Ton, D.1`, `Bach Hoa Xanh Phan Xich Long, Phu Nhuan`, `EMart Phan Van Tri, Go Vap`, `Lotte Mart Nam Sai Gon, D.7`).
- **`INITIAL_MOCK_SCHEDULES`:** Pre-populated schedule entries for 2–3 mock users from `SPEC-01` across dates in the current month so selection immediately demonstrates both assigned shift bars and empty editable slots.

---

## 3. Page Layout & Core Business Rules

### 3.1. Top Filter & Action Card
Rendered at the top of `<MainLayout />` canvas (`border: 1px solid var(--border-color)`, `background: var(--bg-surface)`, `border-radius: var(--radius-sm)`, `padding: 16px`):
- **Filter Inputs (3-Column Grid):**
  1. `Supervisor` (Clearable Select — options derived from supervisors in `SPEC-01`)
  2. `Position` (Clearable Select — options: `PG-Inline`, `Customer`, `Supervisor`, `Admin`)
  3. `Employee` (Clearable Select — filtered by selected `Supervisor` and `Position`, displaying `{employeeCode} - {fullName}`)
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`): Filters the left employee sidebar list and activates the selected employee on the calendar if an employee was chosen in the dropdown.
    - `Export Report` button (`var(--color-primary)`): Downloads a `.csv` summary of the active employee's monthly schedule.
  - **Right Group:**
    - `Template File` button (amber/secondary accent): Downloads a sample schedule `.csv` template.
    - `Import File` button (`var(--color-primary)`): Opens a file-upload modal to import mock schedule rows.
    - `Clear` icon button (`X`): Resets filter dropdowns, clears `selectedEmployeeId` to `null`, and returns the calendar to its initial empty state.

---

## 4. Split Workspace: Employee Sidebar & Monthly Calendar

### 4.1. Left Employee List Panel (`width: 260px`, fixed on desktop)
- **Top Status Legend Strip:** Horizontal row of compact color indicator pills representing shift/schedule states.
- **Panel Header:** `Employees ({filteredEmployees.length})` styled with `var(--color-primary-soft-bg)` and bold `var(--color-primary)` text.
- **Scrollable Employee List:**
  - Displays filtered employees formatted as `{employeeCode} - {fullName} ({currentPosition})`.
  - **Initial State:** No employee is selected by default (`selectedEmployeeId = null`).
  - **Selection Behavior:** Clicking any employee row highlights it (`background: var(--color-primary-soft-bg)`, `color: var(--color-primary)`, right chevron `>`) and immediately loads that employee's schedule onto the calendar grid.

### 4.2. Right Calendar Grid & Strict Date Boundary Rules
1. **Calendar Top Bar:**
   - **Left:** Previous Month (`<`) and Next Month (`>`) buttons (`background: var(--color-primary)`, white icons).
   - **Center:** Bold month/year title formatted as `MM/YYYY` (defaults to the current system month and year).
   - **Right:** Static active view badge `"Month"` (`background: var(--color-primary)`, white text).
2. **Grid Structure (Monday to Sunday):**
   - **7 Weekday Headers:** Strictly ordered `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`.
   - **Row Span:** Starts on **Monday of the first week** containing the 1st day of the active month, and runs through **Sunday of the 5th week** (or 6th week only if the month's final days extend past the 5th Sunday, ensuring every day of the active month is visible).
   - **Day Number Placement:** Positioned in the **top-right corner** of every calendar cell (`1`, `2`, ..., `30`/`31`).
     - Dates belonging to the **active month** use `var(--text-primary)` (bold).
     - Leading days from the previous month and trailing days from the next month use muted `var(--text-secondary)` (`opacity: 0.45`).
3. **Strict Edit Region Visibility Rules (CRITICAL):**
   - **Rule A — No Employee Selected (`selectedEmployeeId === null`):**
     - The calendar grid MUST render **completely empty** (only top-right day numbers visible). **Zero** edit buttons or shift bars may appear on any cell.
   - **Rule B — Employee Selected (`selectedEmployeeId !== null`):**
     - Editable schedule bars appear **ONLY on dates strictly within the active month** (`cellDate.month === activeMonth && cellDate.year === activeYear`).
     - *Boundary Example:* If October 31 is Saturday and November 1 is Sunday, Week 1 displays `Mon 26` through `Sat 31` (muted, **no edit controls**) and `Sun 1` (active month, **edit control visible**). Edit controls continue through `Mon 30`, and any trailing December dates (`Tue 1` onward) MUST remain **empty with no edit controls**.
   - **Cell Content (Active Month + Employee Selected):**
     - **If shifts are assigned on that date:** Render stacked shift pill bar(s) displaying `{shiftCode} ({shiftName}) - {storeName}` with an edit icon. Clicking the bar opens the **Schedule Detail & Edit Modal** for that date.
     - **If no shifts are assigned on that date:** Render a full-width clickable edit bar containing a centered `SquarePen` edit icon. Clicking it opens the **Schedule Detail & Edit Modal** for that date.

### 4.3. Bottom Section: Working Schedule Statistics (Collapsible)
Rendered directly below the calendar grid (`border: 1px solid var(--border-color)`, `background: var(--bg-surface)`):
- **Header Bar:** `var(--color-primary)` background, white bold text `"Working Schedule Statistics"` with collapse/expand toggle (`-` / `+`).
- **2-Column Summary Table (`Metric` | `Quantity`):**
  1. `Standard Working Hours / Month`: Fixed `216` (or `0` when no employee is selected).
  2. `Total Registered Working Hours`: Sum of `shift.hours` for all assigned shifts of the selected employee within the active month (`0` when no employee is selected).
  3. Dynamic Shift Count Rows (e.g., `MS (Morning Shift)`): Count of assigned days for each shift type in the active month.
  4. `Active Scheduled Stores Count`: Count of distinct `storeId`s scheduled for the selected employee in the active month.

---

## 5. Schedule Detail & Edit Modal (`ScheduleDetailModal`)
Triggered when clicking an editable cell/bar on any active-month date for a selected employee.

### 5.1. Modal Header
- **Left Title:** `{YYYY-MM-DD} | {employee.username} - {employee.fullName} ({employee.currentPosition})`
- **Right Controls:** Expand/Collapse modal width icon button + Close (`X`) icon button.

### 5.2. Modal Body (2-Column Split Layout)
#### Left Column (~62% width): Current Schedule & Change Requests
1. **Card 1: `Working Schedule` (Collapsible)**
   - Table Columns: `Shift` | `Store` | `Check-in` | `Action`
   - Displays all `assignedShifts` for the selected employee on `{YYYY-MM-DD}` (or `"No results found"` if empty). Includes a remove icon button per row to unassign a shift.
2. **Card 2: `Schedule Change Requests` (Collapsible)**
   - Toolbar above table: Right-aligned outline button `"Delete Request"` (deletes checked rows).
   - Table Columns: `Action` | `Default Shift` | `Changed Shift / Time` | `Approval Request` | `Approver` | `Status` | `[Checkbox]`
   - Displays `changeRequests` for that date (or `"No results found"` if empty).

#### Right Column (~38% width): `Add Working Schedule` (Collapsible)
1. **`Shift` Dropdown:** Label `"Shift"`, placeholder `"Select shift"`, options from `MOCK_SHIFTS` (`{code} - {name} ({startTime} - {endTime})`).
2. **`Store` Dropdown:** Label `"Store"`, placeholder `"Select store"`, options from `MOCK_STORES`.
3. **Stage Store Button:** Full-width outline button with downward chevron (`ChevronDown`). Clicking appends the selected `Store` into the staging table below (preventing duplicate stores in the same staging list).
4. **Staged Stores Table:** Single header `Store Name` (with a remove `X` icon per staged row; displays `"No results found"` when empty).
5. **Save Button:** Full-width solid button (`background: var(--color-success-accent)`, white `Save` icon + `"Save"` text).
   - **Validation:** Requires a selected `Shift` and at least 1 staged `Store`.
   - **Action:** Appends the new `AssignedShiftItem`(s) to the employee's `DailyScheduleRecord` for `{YYYY-MM-DD}`, updates the left `Working Schedule` table inside the modal, updates the calendar cell and bottom `Working Schedule Statistics` table in real time, and clears the staging form.
