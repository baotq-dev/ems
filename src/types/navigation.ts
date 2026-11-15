// Navigation Menu Types (SPEC-03)

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
