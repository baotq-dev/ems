import { NavMenuItem } from '@/types/navigation';

export const NAVIGATION_MENU: NavMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'Home',
    children: [
      {
        key: 'dashboard-summary',
        label: 'Dashboard Summary',
        path: '/dashboard/summary',
      },
      {
        key: 'attendant-summary',
        label: 'Attendant Summary',
        path: '/dashboard/attendant-summary',
      },
      {
        key: 'inventory-summary',
        label: 'Inventory Summary',
        path: '/dashboard/inventory-summary',
      },
      {
        key: 'out-of-stock-summary',
        label: 'OS Summary',
        path: '/dashboard/out-of-stock-summary',
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
      {
        key: 'timesheet',
        label: 'Timesheet',
        path: '/report/timesheet',
      },
      {
        key: 'exam-result',
        label: 'Exam Result',
        path: '/report/exam-result',
      },
    ],
  },
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
