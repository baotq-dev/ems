# AGENT.md - AI Coding Agent Execution Guide

## 1. Project & Tech Stack Overview
This repository is a multi-enterprise (white-label ready) frontend web application built with:
- **Core Framework:** React (Functional Components + Hooks)
- **Language:** TypeScript (Strict mode enabled, zero `any` types unless explicitly justified)
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling & Icons:** Standard CSS / Tailwind CSS + CSS Custom Properties (`var(--*)`) + Lucide Icons
- **Data Layer:** Local mock datasets and client-side state management as defined in the specification files (no unrequested backend API integrations)

---

## 2. Strict Rules for AI Agents
You MUST obey the following rules at all times during execution:

1. **Strict Scope Adherence:** Implement ONLY the exact features, routes, fields, and behaviors explicitly specified in the assigned step and referenced specification files.
2. **Zero Unrequested Additions or Refactoring:** Do NOT add extra pages, helper utilities, UI components, menus, runtime theme-switcher UIs, or "nice-to-have" features outside the specs. Do NOT refactor existing working code unless explicitly instructed by the current step.
3. **Stop on Ambiguity or Contradiction:** If you encounter any unclear requirement, missing edge case, or conflict between specification files, **STOP IMMEDIATELY** and ask the user for clarification. Never guess or invent business logic.
4. **Read-Only Specifications:** Never modify, rename, delete, or reformat any file inside `docs/specs/` (or `AGENT.md`). Treat all spec files as immutable source-of-truth documents.
5. **Language Consistency:** All UI text, labels, table headers, navigation items, mock data values (unless specified otherwise), and code comments MUST be written in **English**.

---

## 3. Strict CSS & White-Label Styling Rules
To ensure the application can be rebranded for any enterprise simply by changing configuration values (`SPEC-04`):
1. **No Hardcoded Hex Colors in Components:** Never write raw hex color codes (e.g., `#D32F2F`, `#B71C1C`) inside component `.tsx` or component `.css` files. Always reference CSS Custom Properties (e.g., `var(--color-primary)`, `var(--color-primary-hover)`) or Tailwind classes mapped to those variables.
2. **No Hardcoded Brand Strings:** Never hardcode enterprise names (e.g., `"Food Empire"`, `"Sabeco"`) or logo paths inside layout/login components. Always read `appName`, `subtitle`, and `logoUrl` from `src/config/brandConfig.ts`.
3. **Compact Enterprise Density:** Maintain consistent spacing (`16px` canvas padding, `4px` border radius on cards/inputs/buttons, `13px`–`14px` base typography) across all views.
4. **Scoped & Predictable Styles:** Keep styling clean and deterministic. Do not introduce heavy external UI component libraries unless explicitly specified.

---

## 4. Mandatory Reading Order
Before writing or modifying any code, you MUST read the specification files in `docs/specs/` in the exact following sequence:

1. **`01_data_models.md`** — Core Data Models, Types & Entities (`ID: SPEC-01`)
2. **`02_routing.md`** — Application Routing & Mock Authentication (`ID: SPEC-02`)
3. **`03_ui_layout.md`** — Global Shell Layout & Navigation Hierarchy (`ID: SPEC-03`)
4. **`04_branding_theme.md`** — White-Label Branding, Theme Tokens & CSS Rules (`ID: SPEC-04`)
5. **`05_*.md+`** — Module-Specific Functional & UI Specifications (`ID: SPEC-05+`)

---

## 5. Incremental Implementation Plan
Execute the project in small, sequential steps. Do NOT jump ahead to future steps until the current step is verified and reported.

### Step 1: Project Foundation & Type Definitions
- **Target Spec IDs:** `SPEC-01` (`docs/specs/01_data_models.md`)
- **Scope:** Set up folder structure (`src/types/`, `src/config/`, `src/mocks/`, `src/layouts/`, `src/pages/`, `src/components/`) and implement exact TypeScript interfaces/enums matching `SPEC-01`.
- **Definition of Done (DoD):**
  - All TypeScript interfaces compile with zero errors (`tsc --noEmit`).
  - Field names and types match `SPEC-01` 100% with no extra or missing properties.

### Step 2: Branding Config, CSS Tokens & Mock Data
- **Target Spec IDs:** `SPEC-01`, `SPEC-04` (`docs/specs/04_branding_theme.md`)
- **Scope:** Implement `src/config/brandConfig.ts`, global CSS custom properties (`src/styles/theme.css`), dynamic theme injector utility, and deterministic mock datasets conforming to `SPEC-01`.
- **Definition of Done (DoD):**
  - Document title, logo, and CSS variables (`--color-primary`, etc.) automatically apply from `brandConfig.ts` on app boot.
  - Mock data strictly conforms to `SPEC-01` types with zero TypeScript errors.

### Step 3: Routing, Mock Auth & Global Application Shell
- **Target Spec IDs:** `SPEC-02`, `SPEC-03`, `SPEC-04` (`02_routing.md`, `03_ui_layout.md`, `04_branding_theme.md`)
- **Scope:** Implement `AuthContext`, `LoginPage` (`/login`), route guards (`ProtectedRoute`, `PublicOnlyRoute`), and `MainLayout` (Top Header, Breadcrumb Bar, Main Canvas) using `brandConfig` and CSS variables.
- **Definition of Done (DoD):**
  - Login/logout flow and route guards work accurately.
  - Top header renders ONLY the 4 specified parent menus and 6 sub-menus with dynamic brand logo/title and theme tokens.
  - Zero hardcoded hex colors or hardcoded brand strings exist in layout or login components.

### Step 4: Module-by-Module UI & Feature Implementation
- **Target Spec IDs:** `SPEC-01`, `SPEC-02`, `SPEC-03`, `SPEC-04`, `SPEC-05+`
- **Scope:** Implement one module per sub-step (e.g., Step 4.1: `User List`, Step 4.2: `Work Schedule`, Step 4.3: `Exam List`, Step 4.4: `Attendant`, Step 4.5: `Sell Out PA`, Step 4.6: `Notification`).
- **Definition of Done (DoD):**
  - Filter panels, action buttons, tables, pagination, and modals match the module spec 100%.
  - All interactive flows work cleanly against the mock state with zero console or TypeScript errors.

---

## 6. Mandatory Step Completion Report Template
After completing **each step**, you MUST output a concise status report using the exact format below before moving to the next step:

```markdown
### Step Completion Report
- **Step Completed:** [Step Number & Name]
- **Spec IDs Fulfilled:** [e.g., SPEC-01, SPEC-04]
- **Files Changed / Created:**
  - `path/to/file1.tsx` (Created / Modified)
  - `path/to/file2.ts` (Created / Modified)
- **Verification Method:** [e.g., Verified TypeScript compilation via `tsc --noEmit`, verified CSS variable injection and route guards in browser]
- **Remaining Issues / Blockers:** [None | List any ambiguities, missing specs, or pending items]
```
