export type ShiftRefCode = 'ON' | 'OFF';

export interface ShiftGroupOption {
  code: string; // e.g., "PA", "PA_KHO", "AUDITOR", "SUP"
  name: string; // e.g., "PA", "PA KHO", "AUDITOR", "SUP - ON"
}

export interface WorkingShiftRecord {
  id: string;
  shiftGroup: string;      // e.g., "PA"
  groupName: string;       // e.g., "PA"
  shiftCode: string;       // e.g., "AM07H00"
  shiftName: string;       // e.g., "07:00 - 15:00"
  fromTime: string;        // Format: "HH:mm", e.g., "07:00"
  toTime: string;          // Format: "HH:mm", e.g., "15:00"
  value: number;           // Shift coefficient / workday value, e.g., 1 or 6
  sortOrder?: number;      // Optional display sort index
  refCode: ShiftRefCode;   // "ON" (working) or "OFF" (day off)
  isOt: boolean;           // Overtime flag
  isActive: boolean;       // Active status flag (defaults to true)
  skipReport: boolean;     // Exclude from attendance/shift report flag
  note?: string;
}
