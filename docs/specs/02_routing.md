# 02 - Application Routing & Mock Authentication Specification
**Spec ID:** `SPEC-02`

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the routes, route guards, and simulated login flow defined in this document.
- **No Unrequested Auth Features:** Do NOT implement registration/sign-up pages, "Forgot Password" flows, email verification, OTP modals, OAuth/SSO buttons, or user profile settings pages.
- **No Unrequested Routes:** Do NOT add any routes beyond `/login` and the 6 protected module routes defined in Section 4.
- **Language Consistency:** All UI labels, form placeholders, validation messages, and button texts on the Login page MUST be rendered in **English**.

---

## 2. Mock Authentication & Session State
Because this is a frontend-only application using mock datasets, authentication is simulated client-side via React Context (`AuthContext`) backed by `localStorage`.

### 2.1. Storage Key & Session Schema
- **`localStorage` Key:** `fe_mock_auth_session`
- **Stored Session Object:**
```typescript
export interface AuthSession {
  userId: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Supervisor' | 'Employee';
  isAuthenticated: boolean;
}
```

### 2.2. Predefined Mock Login Credentials
Support authentication using the following deterministic mock accounts (or matching active users from `SPEC-01` mock data):

| Username | Password | Full Name | Role |
|---|---|---|---|
| `admin` | `123456` | `System Admin` | `Admin` |
| `sup01` | `123456` | `Nguyen Minh Tuan` | `Supervisor` |
| `namlh` | `123456` | `Le Hoang Nam` | `Employee` |

### 2.3. Auth Actions
- **`login(username, password)`:**
  - Validates non-empty inputs and checks against the predefined mock credentials (case-insensitive `username`).
  - On success: Saves `AuthSession` to `localStorage`, updates `AuthContext`, and redirects to `/operation-config/user-list`.
  - On failure: Displays inline error message `"Invalid username or password."` without page reload.
- **`logout()`:**
  - Triggered from the User Dropdown (`Admin v` / active user badge) in the Top Navigation Header (`SPEC-03`, Zone 1).
  - Removes `fe_mock_auth_session` from `localStorage`, resets `AuthContext`, and immediately redirects to `/login`.

---

## 3. Simulated Login Page (`/login`)
- **Layout:** Standalone centered card (`max-width: 400px`) on a clean light-gray canvas (`#F4F6F8`), rendered **without** `MainLayout` (no Top Header or Breadcrumb Bar).
- **Visual Styling (Aligned with `SPEC-03`):**
  - Top card accent border (`4px solid #D32F2F`) and brand title (`Food Empire`) + subtitle (`Operation Management System`).
  - Primary submit button (`Sign In`) in Crimson Red (`#D32F2F`, hover `#B71C1C`) with white text.
- **Form Fields & Controls:**
  1. **Username** (`type="text"`, required, placeholder: `"Enter username"`)
  2. **Password** (`type="password"`, required, placeholder: `"Enter password"`, with optional show/hide eye toggle)
  3. **Submit Button:** `"Sign In"`
  4. **Quick-Fill Demo Helper (Optional UX convenience):** Small subtle text/pill links below the form (`Demo: admin / 123456`) that auto-populate the username and password inputs on click.

---

## 4. Complete Route Table & Access Control

| Route Path | Access Level | Layout Wrapper | Target Page / Behavior |
|---|---|---|---|
| `/login` | Public Only (`PublicOnlyRoute`) | None | Renders `LoginPage`. If already authenticated, redirects to `/operation-config/user-list`. |
| `/` | Protected (`ProtectedRoute`) | `MainLayout` | Immediately redirects (`replace`) to `/operation-config/user-list`. |
| `/operation-config/user-list` | Protected (`ProtectedRoute`) | `MainLayout` | **Default Home Page** — Renders `UserListPage`. |
| `/operation-config/exam-list` | Protected (`ProtectedRoute`) | `MainLayout` | Renders `ExamListPage`. |
| `/planning/work-schedule` | Protected (`ProtectedRoute`) | `MainLayout` | Renders `WorkSchedulePage`. |
| `/report/attendant` | Protected (`ProtectedRoute`) | `MainLayout` | Renders `AttendantReportPage`. |
| `/report/sell-out-pa` | Protected (`ProtectedRoute`) | `MainLayout` | Renders `SellOutPaReportPage`. |
| `/system/notification` | Protected (`ProtectedRoute`) | `MainLayout` | Renders `NotificationPage`. |
| `*` (Catch-all) | Dynamic | — | If authenticated, redirects to `/operation-config/user-list`. If unauthenticated, redirects to `/login`. |

---

## 5. Route Guard Specifications

### 5.1. `ProtectedRoute`
- Checks `isAuthenticated` from `AuthContext` (hydrated synchronously from `localStorage` on initial app load to prevent flash redirects).
- If `false`: Redirects immediately to `/login` (`<Navigate to="/login" replace />`).
- If `true`: Renders `<MainLayout><Outlet /></MainLayout>`.

### 5.2. `PublicOnlyRoute`
- Wraps `/login`.
- If `isAuthenticated` is `true`: Redirects immediately to `/operation-config/user-list` (`<Navigate to="/operation-config/user-list" replace />`).
- If `false`: Renders `<LoginPage />`.
