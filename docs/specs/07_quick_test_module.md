# 07 - Pre-Shift Quick Test Module Specification (`Exam List` & `Exam Result`)
**Spec ID:** `SPEC-07`  
**Routes:**
1. **Exam Configuration & Question Bank:** `Operation Configuration > Exam List` (`/operation-config/exam-list`)
2. **Employee Exam Results & History:** `Report > Exam Result` (`/report/exam-result`)  
*(Note: Add `{ key: 'exam-result', label: 'Exam Result', path: '/report/exam-result' }` under the `Report` parent menu in `NAVIGATION_MENU` (`SPEC-03`) and `ProtectedRoute` (`SPEC-02`).)*

---

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the two pages (`ExamListPage` and `ExamResultPage`), the `.xlsx` template parser/generator, expandable question/result details, and mock datasets defined in this specification.
- **Web Scope Boundary:** Employees take the Quick Test on a separate mobile application; the web application is strictly for **Admin/Supervisor exam creation via `.xlsx` import, role assignment, and viewing employee test results**. Do NOT build an interactive "Take Exam" quiz player page on the web.
- **Latest Attempt Display Rule:** Although employees may retake an exam multiple times (tracked by `attemptCount`), the web `Exam Result` detail panel **MUST display ONLY the employee's most recent (latest) attempt** (sorted by `submittedAt` descending, taking index `0`).
- **CSS & Theme Compliance:** Never hardcode hex colors inside `.tsx` or `.css` files. Use CSS Custom Properties from `SPEC-04` (`var(--color-primary)`, `var(--color-primary-hover)`, `var(--color-primary-soft-bg)`, `var(--color-secondary-accent)`, `var(--color-success-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`).
- **Language Consistency:** All UI labels, table headers, buttons, role checkboxes, and notifications MUST be rendered in **English**.

---

## 2. Excel Template Schema & Mock Data (`src/mocks/examMockData.ts`)

### 2.1. Exact `.xlsx` Import / Template File Format (`TemplateExamList.xlsx`)
Both **`Template File`** download and **`Import File`** upload (using `xlsx` / SheetJS library) MUST conform to the exact sheet and cell structure below:
- **Sheet Name:** `Data`
- **Metadata Header Block (Rows 1–4):**
  - **Row 1, Col A (`A1`):** `"TEMPLATE EXAM"`
  - **Row 2, Col A (`A2`):** `"Exam name:"` | **Col B (`B2`):** Exam Title string (e.g., `"Pre-Shift Quick Test 2026"`)
  - **Row 3, Col A (`A3`):** `"From date:"` | **Col B (`B3`):** Start date string (`YYYY-MM-DD`, e.g., `"2026-04-28"`)
  - **Row 4, Col A (`A4`):** `"To date:"` | **Col B (`B4`):** Optional end date string (`YYYY-MM-DD` or blank)
  - **Row 5:** Blank separator row
- **Question & Answer Table Header (Row 6, Cols A–H):**
  - `No.` | `QuestionId` | `Question` | `AnswerId` | `Answer` | `Correct` | `Action` | `Weight`
- **Row Parsing Rules (Row 7+):**
  - Rows sharing the same `QuestionId` are grouped into a single `ExamQuestion` with multiple `ExamAnswerOption` items.
  - `Correct`: Truthy indicator (`1`, `true`, `"TRUE"`, `"X"`, or `"Yes"`, case-insensitive) marks `isCorrect = true`; otherwise `false`.
  - `Weight`: Numeric point weight per question (defaults to `1` if blank).
  - `Action`: Optional row directive (e.g., `"ADD"`, `"UPDATE"`, `"DELETE"`; defaults to `"ADD"` if blank).

### 2.2. TypeScript Interfaces (`src/types/exam.ts` or `src/mocks/examMockData.ts`)
```typescript
export type TargetExamRole =
  | 'Customer'
  | 'GS'
  | 'TL'
  | 'PG-D'
  | 'PG-Inline'
  | 'PG-G'
  | 'SUP-D'
  | 'SUP-G'
  | 'TBHV';

export interface ExamAnswerOption {
  answerId: string;
  answerText: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  questionId: string;
  orderNo: number;
  questionText: string;
  weight: number;
  options: ExamAnswerOption[];
}

export interface ExamItem {
  id: string;
  examName: string;
  fromDate: string; // YYYY-MM-DD
  toDate?: string;  // YYYY-MM-DD
  assignedRoles: TargetExamRole[];
  questions: ExamQuestion[];
}

export interface EmployeeQuestionAnswer {
  questionId: string;
  selectedAnswerId: string;
}

export interface ExamAttemptRecord {
  attemptId: string;
  submittedAt: string; // Format: "YYYY-MM-DD HH:mm:ss"
  score: number;
  totalWeight: number;
  answers: EmployeeQuestionAnswer[];
}

export interface EmployeeExamResultSummary {
  id: string;
  supervisorId: string;
  supervisorName: string;
  employeeCode: string;
  employeeName: string;
  position: TargetExamRole | string;
  examId: string;
  examName: string;
  examFromDate: string;
  examToDate?: string;
  attemptDateRange: string; // e.g., "2026-10-01 - 2026-10-23"
  attemptCount: number;     // Total times employee took the exam (e.g., 2)
  attempts: ExamAttemptRecord[]; // Full history; UI renders ONLY the latest attempt
}
```

### 2.3. Required Demo Mock Data (`src/mocks/examMockData.ts`)
Provide pre-populated mock records so the demo works immediately on first load without requiring an initial file upload:
- **`MOCK_EXAMS`:** At least 2 exams (e.g., `"Pre-Shift Quick Test 2026"` with 6+ realistic FMCG/beverage product knowledge questions and 4 options each, pre-assigned to `['PG-D', 'PG-Inline', 'SUP-D']`, plus a second exam `"New Product Launch Quiz Q4"`).
- **`MOCK_EXAM_RESULTS`:** At least 3–4 employee result records linked to `MOCK_EXAMS`, including at least one employee with `attemptCount: 2` (containing 2 timestamped attempts in `attempts[]` so the UI clearly demonstrates displaying **only the latest attempt** while showing `Attempts: 2` in the summary row, including both a correctly answered question and an incorrectly answered question for color-highlighting verification).

---

## 3. Part 1: Exam List Page (`/operation-config/exam-list`)

### 3.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (2-Column Grid):**
  1. `Date Range` (`From Date - To Date` date range input)
  2. `Exam` (Clearable Select dropdown populated from `MOCK_EXAMS`)
- **Action Toolbar:**
  - **Left Group:**
    - `Search` button (`var(--color-primary)`): Filters the exam table by date range and selected exam.
    - `Export File` button (`var(--color-success-accent)`): Exports the currently filtered exam list summary to `.csv`/`.xlsx`.
  - **Right Group:**
    - `Template File` button (amber/secondary accent `#F59E0B`): Generates and downloads a valid `.xlsx` file (`TemplateExamList.xlsx`) following Section 2.1 with sample rows so users can test importing immediately.
    - `Import File` button (`var(--color-primary)`): Opens a file picker / modal accepting `.xlsx` files. Parses the `Data` sheet per Section 2.1, validates `Exam name:` and `From date:`, and prepends/updates the exam in state.
    - `Clear` icon button (`X`): Resets filter fields and restores the full exam list.

### 3.2. Exam List Data Table & Expandable Details
- **Top Pagination Bar:** `<<`, `<`, page numbers, `>`, `>>`, `"Showing X to Y of Z entries"`, and page size selector (`20`).
- **Master Table Columns:**
  1. `Expand` toggle column (`ChevronDown` / `ChevronRight` circular button)
  2. `No.` (Center)
  3. `Exam Name` (Supports inline text quick-filter input below header)
  4. `From Date` (`YYYY-MM-DD`, Center)
  5. `To Date` (`YYYY-MM-DD` or blank, Center)
  6. `Question Count` (`exam.questions.length`, Center)
  7. `Delete` (Center — Red `Trash2` icon button with confirmation dialog)

#### Expandable Detail Drawer (Rendered directly beneath expanded Exam row)
1. **Target Role Assignment Bar:**
   - Light rose strip (`background: var(--color-primary-soft-bg)`) displaying inline checkboxes for all 9 `TargetExamRole` values: `Customer`, `GS`, `TL`, `PG-D`, `PG-Inline`, `PG-G`, `SUP-D`, `SUP-G`, `TBHV`.
   - Right-aligned **`Save`** icon button (`background: var(--color-secondary-accent)`, white `Save` icon): Saves updated `assignedRoles` for that exam and shows a brief confirmation toast/banner.
2. **Question Search Bar:**
   - Compact search input (`placeholder: "Search question..."`) filtering the question cards below in real time.
3. **2-Column Question & Answer Grid:**
   - Displays all questions in a 2-column responsive grid (`grid-template-columns: repeat(2, minmax(0, 1fr))`).
   - Each Question Card contains:
     - **Header:** Bold `var(--color-primary)` title `"Question {orderNo}: {questionText}"` + right-aligned `X` delete button (removes question from exam after confirmation).
     - **Answer Options List:** Vertical list of all `options` with a read-only checkbox indicator:
       - If `option.isCorrect === true`: Checked red checkbox (`var(--color-primary)`) + bold option text.
       - If `option.isCorrect === false`: Unchecked neutral checkbox + regular option text.

---

## 4. Part 2: Exam Result Page (`/report/exam-result`)

### 4.1. Collapsible Search & Action Card
- **Header Bar:** `var(--color-primary)` background, white bold text `"Search"` + collapse/expand chevron.
- **Filter Inputs (4-Column Grid):**
  1. `Date Range` (`From Date - To Date`)
  2. `Exam` (Clearable Select from `MOCK_EXAMS`)
  3. `Supervisor` (Clearable Select from supervisors)
  4. `Position` (Clearable Select from `TargetExamRole`)
- **Action Toolbar:**
  - **Left Group:** `Search` button (`var(--color-primary)`), `Export File` button (`var(--color-success-accent)` — downloads filtered results as `.csv`).
  - **Right Group:** `Clear` icon button (`X`).

### 4.2. Exam Result Summary Table & Latest Attempt Viewer
- **Top & Bottom Pagination Controls:** `<<`, `<`, page numbers, `>`, `>>`, `"Showing X to Y of Z entries"`, and page size selector (`20`).
- **Summary Table Columns (with inline text quick-filter inputs under searchable columns):**
  1. `Expand` toggle column (`ChevronDown` / `ChevronRight` circular button)
  2. `No.` (Center)
  3. `Sup` (`supervisorName`, inline filter)
  4. `Employee Code` (`employeeCode`, inline filter)
  5. `Employee Name` (`employeeName`, inline filter)
  6. `Position` (`position`, inline filter)
  7. `Exam Name` (`"{examName} ({examFromDate} - {examToDate || ''})"`, inline filter)
  8. `Date` (`attemptDateRange`, inline filter)
  9. `Attempts` (`attemptCount`, Center, inline filter)

#### Expandable Latest Attempt Detail Panel (Rendered beneath expanded Result row)
- **Strict Latest-Attempt Rule:** Select ONLY the single most recent attempt from `result.attempts` (highest `submittedAt` timestamp). Do NOT render older superseded attempts.
- **Header Badge:** Elevated pill card displaying `"Submitted At: {latestAttempt.submittedAt}"` in bold `var(--color-primary)` text (plus score summary `"Score: {latestAttempt.score}/{latestAttempt.totalWeight}"`).
- **Question-by-Question Answer Breakdown:**
  - Iterates through the corresponding `ExamItem.questions` in order:
  - **Question Title:** Bold green/dark heading `"Question {orderNo}: {questionText}"`.
  - **Answer Options Rendering & Distinct Color Rules (CRITICAL):**
    Each option displays a checkbox and label styled distinctly based on whether the employee selected it and whether it is the official correct answer:
    1. **Correct Answer (Not Selected by Employee):**
       - Unchecked box + **Amber/Orange highlighted text** (`#D97706` / bold) with subtle tag `(Correct Answer)` so reviewers immediately see what the right answer was when the employee missed it.
    2. **Employee Selected & Correct (`selectedAnswerId === option.answerId && option.isCorrect`):**
       - Checked green/primary box + **Green highlighted text** (`var(--color-success-accent)`, bold) with badge `(Selected - Correct)`.
    3. **Employee Selected & Incorrect (`selectedAnswerId === option.answerId && !option.isCorrect`):**
       - Checked crimson red box (`var(--color-primary)`) + **Crimson Red highlighted text** (`var(--color-primary)`, bold) with badge `(Selected - Incorrect)`.
    4. **Unselected & Incorrect Option:**
       - Unchecked neutral box + standard muted/regular text (`var(--text-primary)`).
