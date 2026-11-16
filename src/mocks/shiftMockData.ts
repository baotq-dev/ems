import { ShiftOption, StoreOption, DailyScheduleRecord } from '@/types/shift';

export const MOCK_SHIFTS: ShiftOption[] = [
  {
    id: 'shift-ms',
    code: 'MS',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    colorToken: 'teal',
  },
  {
    id: 'shift-as',
    code: 'AS',
    name: 'Afternoon Shift',
    startTime: '14:00',
    endTime: '22:00',
    hours: 8,
    colorToken: 'navy',
  },
  {
    id: 'shift-fs',
    code: 'FS',
    name: 'Full Shift',
    startTime: '09:00',
    endTime: '18:00',
    hours: 8,
    colorToken: 'green',
  },
  {
    id: 'shift-off',
    code: 'OFF',
    name: 'Day Off',
    startTime: '00:00',
    endTime: '00:00',
    hours: 0,
    colorToken: 'amber',
  },
];

export const MOCK_STORES: StoreOption[] = [
  {
    id: 'str-001',
    code: 'STR001',
    name: 'Co.opmart Nguyen Dinh Chieu, D.3',
  },
  {
    id: 'str-002',
    code: 'STR002',
    name: 'WinMart Le Thanh Ton, D.1',
  },
  {
    id: 'str-003',
    code: 'STR003',
    name: 'Bach Hoa Xanh Phan Xich Long, Phu Nhuan',
  },
  {
    id: 'str-004',
    code: 'STR004',
    name: 'EMart Phan Van Tri, Go Vap',
  },
  {
    id: 'str-005',
    code: 'STR005',
    name: 'Lotte Mart Nam Sai Gon, D.7',
  },
];

export const INITIAL_MOCK_SCHEDULES: DailyScheduleRecord[] = [
  // User usr-004 (Le Hoang Nam) - November 2026
  {
    userId: 'usr-004',
    date: '2026-11-02',
    assignedShifts: [
      {
        id: 'as-004-1',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-03',
    assignedShifts: [
      {
        id: 'as-004-2',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-04',
    assignedShifts: [
      {
        id: 'as-004-3',
        shiftId: 'shift-as',
        shiftCode: 'AS',
        shiftName: 'Afternoon Shift',
        storeId: 'str-002',
        storeName: 'WinMart Le Thanh Ton, D.1',
        checkInStatus: 'Not Checked In',
        colorToken: 'navy',
      },
    ],
    changeRequests: [
      {
        id: 'cr-004-1',
        defaultShift: 'MS (08:00 - 16:00)',
        requestedShiftTime: 'AS (14:00 - 22:00)',
        reason: 'Personal appointment in morning',
        approverName: 'Nguyen Minh Tuan',
        status: 'Approved',
      },
    ],
  },
  {
    userId: 'usr-004',
    date: '2026-11-06',
    assignedShifts: [
      {
        id: 'as-004-4',
        shiftId: 'shift-fs',
        shiftCode: 'FS',
        shiftName: 'Full Shift',
        storeId: 'str-004',
        storeName: 'EMart Phan Van Tri, Go Vap',
        checkInStatus: 'Late',
        colorToken: 'green',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-09',
    assignedShifts: [
      {
        id: 'as-004-5',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Not Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-10',
    assignedShifts: [
      {
        id: 'as-004-6',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-003',
        storeName: 'Bach Hoa Xanh Phan Xich Long, Phu Nhuan',
        checkInStatus: 'Not Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-13',
    assignedShifts: [
      {
        id: 'as-004-7',
        shiftId: 'shift-as',
        shiftCode: 'AS',
        shiftName: 'Afternoon Shift',
        storeId: 'str-002',
        storeName: 'WinMart Le Thanh Ton, D.1',
        checkInStatus: 'Not Checked In',
        colorToken: 'navy',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-16',
    assignedShifts: [
      {
        id: 'as-004-8',
        shiftId: 'shift-fs',
        shiftCode: 'FS',
        shiftName: 'Full Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Not Checked In',
        colorToken: 'green',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-18',
    assignedShifts: [
      {
        id: 'as-004-9',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-005',
        storeName: 'Lotte Mart Nam Sai Gon, D.7',
        checkInStatus: 'Not Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-004',
    date: '2026-11-20',
    assignedShifts: [
      {
        id: 'as-004-10',
        shiftId: 'shift-off',
        shiftCode: 'OFF',
        shiftName: 'Day Off',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Not Checked In',
        colorToken: 'amber',
      },
    ],
    changeRequests: [],
  },

  // User usr-005 (Pham Thu Hang) - November 2026
  {
    userId: 'usr-005',
    date: '2026-11-02',
    assignedShifts: [
      {
        id: 'as-005-1',
        shiftId: 'shift-as',
        shiftCode: 'AS',
        shiftName: 'Afternoon Shift',
        storeId: 'str-002',
        storeName: 'WinMart Le Thanh Ton, D.1',
        checkInStatus: 'Checked In',
        colorToken: 'navy',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-005',
    date: '2026-11-04',
    assignedShifts: [
      {
        id: 'as-005-2',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-003',
        storeName: 'Bach Hoa Xanh Phan Xich Long, Phu Nhuan',
        checkInStatus: 'Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-005',
    date: '2026-11-06',
    assignedShifts: [
      {
        id: 'as-005-3',
        shiftId: 'shift-fs',
        shiftCode: 'FS',
        shiftName: 'Full Shift',
        storeId: 'str-004',
        storeName: 'EMart Phan Van Tri, Go Vap',
        checkInStatus: 'Not Checked In',
        colorToken: 'green',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-005',
    date: '2026-11-10',
    assignedShifts: [
      {
        id: 'as-005-4',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Not Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-005',
    date: '2026-11-16',
    assignedShifts: [
      {
        id: 'as-005-5',
        shiftId: 'shift-as',
        shiftCode: 'AS',
        shiftName: 'Afternoon Shift',
        storeId: 'str-005',
        storeName: 'Lotte Mart Nam Sai Gon, D.7',
        checkInStatus: 'Not Checked In',
        colorToken: 'navy',
      },
    ],
    changeRequests: [],
  },

  // User usr-006 (Vu Quang Huy) - November 2026
  {
    userId: 'usr-006',
    date: '2026-11-03',
    assignedShifts: [
      {
        id: 'as-006-1',
        shiftId: 'shift-fs',
        shiftCode: 'FS',
        shiftName: 'Full Shift',
        storeId: 'str-001',
        storeName: 'Co.opmart Nguyen Dinh Chieu, D.3',
        checkInStatus: 'Checked In',
        colorToken: 'green',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-006',
    date: '2026-11-05',
    assignedShifts: [
      {
        id: 'as-006-2',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-004',
        storeName: 'EMart Phan Van Tri, Go Vap',
        checkInStatus: 'Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-006',
    date: '2026-11-08',
    assignedShifts: [
      {
        id: 'as-006-3',
        shiftId: 'shift-as',
        shiftCode: 'AS',
        shiftName: 'Afternoon Shift',
        storeId: 'str-002',
        storeName: 'WinMart Le Thanh Ton, D.1',
        checkInStatus: 'Not Checked In',
        colorToken: 'navy',
      },
    ],
    changeRequests: [],
  },
  {
    userId: 'usr-006',
    date: '2026-11-12',
    assignedShifts: [
      {
        id: 'as-006-4',
        shiftId: 'shift-ms',
        shiftCode: 'MS',
        shiftName: 'Morning Shift',
        storeId: 'str-003',
        storeName: 'Bach Hoa Xanh Phan Xich Long, Phu Nhuan',
        checkInStatus: 'Not Checked In',
        colorToken: 'teal',
      },
    ],
    changeRequests: [],
  },
];
