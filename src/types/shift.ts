// Types for Working Schedule Module (SPEC-06)

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
