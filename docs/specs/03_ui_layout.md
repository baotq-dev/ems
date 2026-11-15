# 03 - Main Application UI Layout & Navigation Specification

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the layout structure, navigation menus, and routes defined in this document.
- **No Unrequested Features:** Do NOT add extra top-level menus (e.g., `Dashboard`, `Tools`) under any circumstances.
- **No Unrequested Header Utilities:** Do NOT implement global search modals, global download drawers, or notification bell popovers in the top header. Keep header controls strictly limited to those specified in Section 3.1.
- **Language Consistency:** All UI labels, navigation items, breadcrumbs, button texts, and table headers MUST be rendered in **English** as defined below.

---

## 2. Visual Theme & Color Palette
Enterprise Red-and-White Design System:
- **Primary Brand Color:** Crimson Red (`#D32F2F`) — used for primary action buttons, active navigation states, section header bars, and table column header labels.
- **Primary Hover Color:** Dark Red (`#B71C1C`).
- **Header Surface Background:** Subtle light-rose to white linear gradient (`linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 60%, #FCE4EC 100%)`) with a `1px solid #E5E7EB` bottom border.
- **Canvas Background:** Light Neutral Gray (`#F4F6F8`).
- **Card / Table Surface:** Pure White (`#FFFFFF`) with `1px solid #E0E0E0` borders and `4px` border radius.
- **Semantic Action Colors (for page-level controls):**
  - Primary Action / Search / Add / Delete: Crimson Red (`#D32F2F`)
  - Secondary Utility Action (e.g., special info/tags): Purple (`#7B1FA2`)
  - Reset / Refresh / Restore Action: Green (`#2E7D32`)
- **Typography:** Clean sans-serif (`Inter`, `Roboto`, or system-ui), compact enterprise density (`13px`–`14px` base font size).

---

## 3. Global Shell Architecture (`MainLayout`)
The application uses a **Top Horizontal Navigation Shell** (no left sidebar) composed of three stacked vertical zones:

```text
+-----------------------------------------------------------------------------------+
| [Brand Logo]   [Operation Config v] [Planning v] [Report v] [System v]   [User v] |  <- Zone 1: Top Header (56px)
+-----------------------------------------------------------------------------------+
| [Home Icon] > [Parent Menu] > [Active Sub-Menu]                                   |  <- Zone 2: Breadcrumb Bar (40px)
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   <Outlet/> (Page-Specific Content: Collapsible Filter Card + Data Workspace)    |  <- Zone 3: Main Canvas (Fluid)
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### 3.1. Zone 1: Top Navigation Header
- **Height:** `56px` fixed, full width (`100%`), sticky at `top: 0`, `z-index: 50`.
- **Left Section (Brand Identity):**
  - Application logo + brand title (`Food Empire`).
  - Clicking the brand logo navigates to the default Home route (`/operation-config/user-list`).
- **Center-Left Section (Primary Dropdown Menus):**
  - Horizontal menu list with hover/click dropdown panels.
  - Each parent menu displays an icon, English label, and a downward chevron (`v`).
  - Active parent menu and active sub-menu item are highlighted in Crimson Red (`#D32F2F`).
- **Right Section (Session / Role Context):**
  - Displays current logged-in user badge with user icon and dropdown (`Admin v` or active mock user name/role).
  - *Note:* If role switching (e.g., Supervisor vs. Employee) is required by auth/role specs, place the mock role switcher inside this user dropdown only. Do not add unrelated settings pages.

### 3.2. Zone 2: Breadcrumb Bar
- **Height:** `40px`, full width, background `#FFFFFF` or `#FAFAFA`, bottom border `1px solid #E5E7EB`.
- **Structure:** `[Home Icon] > [Parent Menu Name] > [Current Sub-Menu Name]`
- **Behavior:** Automatically updates based on the active route. Clicking `[Home Icon]` navigates to `/operation-config/user-list`.

### 3.3. Zone 3: Main Content Canvas
- **Layout:** Fluid container with `16px` outer padding (`padding: 16px`).
- **Standard Page Pattern:** Unless overridden by a specific module spec (such as calendar/schedule views), standard list/report pages inside `<Outlet />` follow a two-block vertical stack:
  1. **Collapsible Filter Panel:** Full-width card with a solid Crimson Red (`#D32F2F`) header bar (`Search` + collapse/expand chevron), containing a responsive 4-column input grid and a bottom action toolbar (Left: `Search`, `Export`, etc.; Right: `Add`, `Import`, etc.).
  2. **Data Display Container:** Full-width white card containing pagination controls (`Showing X to Y of Z entries` + page size selector `20`) and a bordered data table with Crimson Red (`#D32F2F`) column headers.

---

## 4. Navigation Hierarchy & Module Routing
The system implements **exactly 6 functional modules** grouped under **4 top-level menus**.

| # | Business Module (VN Reference) | Parent Menu (EN) | Sub-Menu (EN) | Route Path | Notes |
|---|---|---|---|---|---|
| 1 | Trang chủ | `Operation Configuration` | `User List` | `/operation-config/user-list` | **Default Home Route** (`/` redirects here) |
| 2 | Lịch & Phân ca | `Planning` | `Work Schedule` | `/planning/work-schedule` | Shift planning & schedule management |
| 3 | Quick test đầu ca | `Operation Configuration` | `Exam List` | `/operation-config/exam-list` | Pre-shift quick test management |
| 4 | Chấm công | `Report` | `Attendant` | `/report/attendant` | Attendance tracking & records |
| 5 | Báo cáo số bán | `Report` | `Sell Out PA` | `/report/sell-out-pa` | PA sell-out sales report |
| 6 | Thông báo & Tài liệu | `System` | `Notification` | `/system/notification` | Announcements & documents |

### 4.1. Exact Navigation Tree Structure
```typescript
export interface NavSubItem {
  key: string;
  label: string;
  path: string;
}

export interface NavMenuItem {
  key: string;
  label: string;
  icon: string;
  children: NavSubItem[];
}

export const NAVIGATION_MENU: NavMenuItem[] = [
  {
    key: 'operation-config',
    label: 'Operation Configuration',
    icon: 'SlidersHorizontal',
    children: [
      {
        key: 'user-list',
        label: 'User List',
        path: '/operation-config/user-list',
      },
      {
        key: 'exam-list',
        label: 'Exam List',
        path: '/operation-config/exam-list',
      },
    ],
  },
  {
    key: 'planning',
    label: 'Planning',
    icon: 'CalendarDays',
    children: [
      {
        key: 'work-schedule',
        label: 'Work Schedule',
        path: '/planning/work-schedule',
      },
    ],
  },
  {
    key: 'report',
    label: 'Report',
    icon: 'FolderBarChart',
    children: [
      {
        key: 'attendant',
        label: 'Attendant',
        path: '/report/attendant',
      },
      {
        key: 'sell-out-pa',
        label: 'Sell Out PA',
        path: '/report/sell-out-pa',
      },
    ],
  },
  {
    key: 'system',
    label: 'System',
    icon: 'Settings',
    children: [
      {
        key: 'notification',
        label: 'Notification',
        path: '/system/notification',
      },
    ],
  },
];
```

---

## 5. Routing & Fallback Behavior
- **Root Path (`/`):** Must immediately redirect (`<Navigate to="/operation-config/user-list" replace />`) to **User List**.
- **Unknown Routes (`*`):** Redirect to `/operation-config/user-list` (do not create a separate 404 feature page unless explicitly requested).
- **Responsive Behavior:**
  - Desktop (`>= 1024px`): Full horizontal navigation bar with dropdown menus and 4-column filter grids.
  - Tablet/Mobile (`< 1024px`): Collapse horizontal menu items into a hamburger drawer toggle while preserving the exact same 4 parent menus and 6 sub-menus.
