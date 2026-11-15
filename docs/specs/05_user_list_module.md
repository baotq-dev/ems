# 05 - User List Module Specification (`/operation-config/user-list`)
**Spec ID:** `SPEC-05`  
**Parent Menu:** `Operation Configuration` | **Sub-Menu:** `User List` | **Route:** `/operation-config/user-list` (Default Home Route)

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the filter inputs, toolbar buttons, table columns, inline column filters, pagination controls, and CRUD actions defined in this specification.
- **Data Model Alignment:** All data fields, types, and mock records MUST strictly conform to `User` and `UserFilterParams` defined in `SPEC-01` (`src/types/user.ts`).
- **CSS & Theme Compliance:** Never hardcode hex colors. Use CSS Custom Properties from `SPEC-04` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-secondary-accent)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`).
- **Language Consistency:** All labels, placeholders, table headers, tooltips, and confirmation dialogs MUST be rendered in **English**.

---

## 2. Page Layout Structure
Rendered inside `<MainLayout />` (`SPEC-03`, Zone 3) with `16px` outer padding, consisting of two stacked white card blocks (`border: 1px solid var(--border-color)`, `border-radius: var(--radius-sm)`):
1. **Collapsible Search & Action Card**
2. **Pagination & User Data Table Card**

---

## 3. Section 1: Collapsible Search & Action Card

### 3.1. Header Bar
- **Background:** `var(--color-primary)`
- **Text Color:** `#FFFFFF` (white), bold, `14px`
- **Content:** Left-aligned chevron toggle icon (`ChevronDown` when expanded, `ChevronRight` when collapsed) + label `"Search"`.
- **Behavior:** Clicking anywhere on the header bar toggles the visibility of the filter body and action toolbar.

### 3.2. Filter Form Grid (4 Columns x 2 Rows)
Responsive grid (`grid-template-columns: repeat(4, minmax(0, 1fr))` on desktop, `2` columns on tablet, `1` column on mobile) with `12px`–`16px` gap. Labels are positioned above each input (`13px`, medium weight):

| Row | Col | Field Label (EN) | `UserFilterParams` Key | Input Type | Placeholder / Options |
|---|---|---|---|---|---|
| 1 | 1 | `Position` | `position` | Clearable Select | Placeholder: `"Select position"` \| Options: `PG-Inline`, `Customer`, `Supervisor`, `Admin` |
| 1 | 2 | `Supervisor` | `supervisorId` | Clearable Select | Placeholder: `"Select supervisor"` \| Options: Unique supervisors from mock users |
| 1 | 3 | `Employee Code` | `employeeCode` | Text Input | Placeholder: `"Enter employee code"` |
| 1 | 4 | `Full Name` | `fullName` | Text Input | Placeholder: `"Enter full name"` |
| 2 | 1 | `Username` | `username` | Text Input | Placeholder: `"Enter username"` |
| 2 | 2 | `Phone Number` | `phoneNumber` | Text Input | Placeholder: `"Enter phone number"` |
| 2 | 3 | `ID / CCCD` | `identityNumber` | Text Input | Placeholder: `"Enter ID / CCCD"` |
| 2 | 4 | `Status` | `employmentStatus` | Clearable Select | Placeholder: `"Select status"` \| Options: `Official`, `Probation`, `Resigned` |

### 3.3. Action Toolbar
Located directly below the filter grid inside the card, separated by subtle spacing, aligned left and right (`display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px`):

- **Left Action Group:**
  1. **`Search` Button:** Icon `Search` + text `"Search"`. Background `var(--color-primary)`, hover `var(--color-primary-hover)`, white text. Executes filtering against the mock user dataset and resets pagination to page `1`.
  2. **`Export File` Button:** Icon `Download` + text `"Export File"`. Background `var(--color-primary)`, white text. Generates and downloads a `.csv` file containing the currently filtered user records.
  3. **`Template File` Button:** Icon `Download` + text `"Template File"`. Background `var(--color-primary)`, white text. Downloads a sample `.csv` import template with expected column headers.
  4. **`I_imei` Button:** Icon `Info` + text `"I_imei"`. Background `var(--color-secondary-accent)`, white text. Opens a lightweight informational modal displaying device/IMEI assignment summary for active field users.

- **Right Action Group:**
  1. **`Add` Button:** Icon `UserPlus` + text `"Add"`. Background `var(--color-primary)`, white text. Opens the **Create User Modal** (Section 5).
  2. **`Import File` Button:** Icon `Plus` + text `"Import File"`. Background `var(--color-primary)`, white text. Opens a file-upload modal accepting `.csv`/`.xlsx` files to append mock user records.
  3. **`Clear Filters` Icon Button:** Icon `X` (neutral/subtle icon button). Resets all top filter inputs and inline column filters to empty strings, restoring the full unfiltered list.

---

## 4. Section 2: Pagination & User Data Table

### 4.1. Top Pagination Controls
Positioned centered/inline above the table inside the data card (`padding: 12px 16px`):
- **Navigation Buttons:** `<<` (First Page), `<` (Previous Page), numbered page buttons (`1`, `2`, `3`, ... with active page styled in `var(--color-primary-soft-bg)` and text `var(--color-primary)`), `>` (Next Page), `>>` (Last Page).
- **Entry Counter:** `"Showing {startIndex} to {endIndex} of {totalEntries} entries"` (styled in `var(--color-primary)`).
- **Page Size Selector:** Dropdown defaulting to `20` (options: `10`, `20`, `50`, `100`). Changing page size resets current page to `1`.

### 4.2. Data Table Structure & Columns
- **Container:** Horizontal scroll wrapper (`overflow-x: auto`) with `1px solid var(--border-color)` cell borders.
- **Header Row (`<tr>` 1):** Column titles rendered in `var(--color-primary)` bold text (`13px`). All data columns support client-side ascending/descending sorting (`ArrowUpDown` icon).
- **Inline Quick-Filter Row (`<tr>` 2):** Positioned directly below the header row. Contains compact text inputs (`height: 28px`, `border: 1px solid var(--border-color)`) under each searchable column to filter rows instantaneously as the user types.

| # | Column Header (EN) | `User` Property (`SPEC-01`) | Sortable | Inline Filter | Alignment / Display Format |
|---|---|---|---|---|---|
| 1 | `No.` | Computed index | No | No | Center (`(page - 1) * pageSize + rowIndex + 1`) |
| 2 | `Region` | `region` | Yes | Yes (text) | Center (`North`, `Central`, `South`) |
| 3 | `Province/City` | `workProvince` | Yes | Yes (text) | Center (e.g., `Ha Noi`, `Da Nang`, `Ho Chi Minh City`) |
| 4 | `Province/City (New)` | `newWorkProvince` | Yes | Yes (text) | Center (displays `newWorkProvince` or `-`) |
| 5 | `Employee Code` | `employeeCode` | Yes | Yes (text) | Center (e.g., `FD001`) |
| 6 | `Supervisor` | `currentSupervisorName` | Yes | Yes (text) | Center (e.g., `Nguyen Minh Tuan` or `-`) |
| 7 | `Full Name` | `fullName` | Yes | Yes (text) | Center (e.g., `Le Hoang Nam`) |
| 8 | `ID / CCCD` | `identityNumber` | Yes | Yes (text) | Center (e.g., `012345678901`) |
| 9 | `Position` | `currentPosition` | Yes | Yes (text) | Center (e.g., `PG-Inline`, `Customer`) |
| 10 | `Username` | `username` | Yes | Yes (text) | Center (e.g., `namlh`) |
| 11 | `Employment Status` | `employmentStatus` | Yes | Yes (text) | Center (`Official`, `Probation`, `Resigned`) |
| 12 | `Join Date` | `joinDate` | Yes | Yes (text) | Center (`DD-MM-YYYY`) |
| 13 | `Resign Date` | Derived from `statusHistory` | Yes | Yes (text) | Center (`DD-MM-YYYY` if `employmentStatus === 'Resigned'`, else blank) |
| 14 | `Actions` | — | No | No | Center — Action icon buttons (see 4.3) |

*(Note: Data cell text uses `var(--color-primary)` or `var(--text-primary)` consistently across rows with subtle row hover highlight.)*

### 4.3. Row Action Buttons (`Actions` Column)
Compact square icon buttons (`28px x 28px`, `border-radius: var(--radius-sm)`, white icon) arranged in a compact cluster:
1. **Edit (`Pencil` icon):** Background `var(--color-primary)`. Opens **Edit User Modal** pre-filled with the selected `User` record.
2. **Delete (`Trash2` icon):** Background `var(--color-primary)`. Opens a confirmation dialog (`"Are you sure you want to delete user {fullName}?"`) and removes the user from state upon confirmation.
3. **Reset Password (`RotateCw` icon):** Background `var(--color-success-accent)`. Opens a confirmation dialog (`"Reset password for {username} to default (123456)?"`) and updates `user.password` in mock state.

---

## 5. Create / Edit User Form Modal (`UserFormModal`)
Triggered by clicking **`Add`** (Create mode) or the row **`Edit`** button (Edit mode). Renders a large scrollable modal (`max-width: 1100px`) organized into the **5 sections defined in `SPEC-01`**:
1. **Personal Information:** Avatar preview/placeholder, `Last Name` (`lastName`), `First Name` (`firstName`), `Full Name` (`fullName`), `Gender`, `Date of Birth`, `Marital Status`, `Email`, `Phone Number`, `Region`, `Work Province`, `New Work Province`, `Permanent Address`, `Temporary Address`.
2. **Work & Assignment Information:**
   - `Employee Code` (`employeeCode`), `Join Date` (`joinDate`).
   - **Position Assignment Sub-table:** Select `Position` + `From Date` / `To Date` + `Add` button, displaying `positionHistory` rows (`No.`, `Position`, `From Date`, `To Date`, `Delete`).
   - **Supervisor Assignment Sub-table:** Select `Supervisor` + `From Date` / `To Date` + `Add` button, displaying `supervisorHistory` rows (`No.`, `Supervisor`, `From Date`, `To Date`, `Delete`).
3. **Identity Document Information:** Toggle between `CMND` and `CCCD` (`identityDocType`), `ID Number` (`identityNumber`), `Issue Date`, `Issue Place`, and two image upload preview boxes (`Front ID Photo` and `Back ID Photo`).
4. **Account Information:** `Username`, `Password`, `Confirm Password`, and `Account Status` (`Active` / `Inactive`).
5. **Employment Status & History:** Status selector (`Official`, `Probation`, `Resigned`), `From Date` / `To Date`, `Note`, and `statusHistory` sub-table (`No.`, `Status`, `From Date`, `To Date`, `Actual Date`, `Reason`, `Note`, `Delete`).
- **Footer Actions:** `"Save"` button (`var(--color-success-accent)` or `var(--color-primary)`) and `"Cancel"` button. Saving validates required fields (`employeeCode`, `lastName`, `firstName`, `phoneNumber`, `username`, `identityNumber`) and updates the User List state immediately.
