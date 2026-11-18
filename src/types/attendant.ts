// Types for Attendance Management & Verification Module (SPEC-08)

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
  | 'confirmed'       // Blue
  | 'rejected'        // Orange
  | 'absent'          // Red
  | 'not_checked_out' // Yellow
  | 'worked_off_day'; // Green

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
  code: TimesheetDayCode | string; // e.g., "X", "OFF", "AL", or "02:53"
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
