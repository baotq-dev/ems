import * as XLSX from 'xlsx';
import { ExamItem, ExamQuestion, EmployeeExamResultSummary } from '@/types/exam';
import { WorkingShiftRecord, ShiftRefCode } from '@/types/workingShift';

export function generateExamTemplateXlsx(): void {
  const wsData: (string | number | boolean)[][] = [
    ['TEMPLATE EXAM'],
    ['Exam name:', 'Pre-Shift Quick Test 2026'],
    ['From date:', '2026-04-28'],
    ['To date:', '2026-12-31'],
    [],
    ['No.', 'QuestionId', 'Question', 'AnswerId', 'Answer', 'Correct', 'Action', 'Weight'],
    [1, 'q01', 'What is the standard mixing ratio for MacCoffee 3in1 Classic?', 'q01-a1', '1 packet with 70ml hot water (80-90°C)', 1, 'ADD', 1],
    [1, 'q01', 'What is the standard mixing ratio for MacCoffee 3in1 Classic?', 'q01-a2', '1 packet with 150ml boiling water', 0, 'ADD', 1],
    [1, 'q01', 'What is the standard mixing ratio for MacCoffee 3in1 Classic?', 'q01-a3', '2 packets with 50ml lukewarm water', 0, 'ADD', 1],
    [1, 'q01', 'What is the standard mixing ratio for MacCoffee 3in1 Classic?', 'q01-a4', '1 packet with 120ml cold water', 0, 'ADD', 1],
    [2, 'q02', 'When sampling MacCereal to customers, what hygiene rule is mandatory?', 'q02-a1', 'Wear clean gloves and a face mask at all times', 1, 'ADD', 1],
    [2, 'q02', 'When sampling MacCereal to customers, what hygiene rule is mandatory?', 'q02-a2', 'Only clean hands with dry napkin', 0, 'ADD', 1],
    [2, 'q02', 'When sampling MacCereal to customers, what hygiene rule is mandatory?', 'q02-a3', 'Gloves are optional if hands look clean', 0, 'ADD', 1],
    [2, 'q02', 'When sampling MacCereal to customers, what hygiene rule is mandatory?', 'q02-a4', 'Mask is only required when supervisor is visiting', 0, 'ADD', 1],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, 'TemplateExamList.xlsx');
}

export async function parseExamImportXlsx(file: File): Promise<ExamItem> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames.includes('Data') ? 'Data' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Convert to 2D array
  const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Read metadata rows 1-4
  let examName = 'Imported Exam';
  let fromDate = new Date().toISOString().split('T')[0];
  let toDate = '';

  for (let r = 0; r < Math.min(6, rows.length); r++) {
    const row = rows[r] || [];
    const col0 = String(row[0] || '').trim().toLowerCase();
    const col1 = String(row[1] || '').trim();

    if (col0.includes('exam name:')) {
      examName = col1 || examName;
    } else if (col0.includes('from date:')) {
      fromDate = col1 || fromDate;
    } else if (col0.includes('to date:')) {
      toDate = col1;
    }
  }

  // Find header row (usually row 6, index 5) containing 'QuestionId' or 'Question'
  let headerIndex = -1;
  for (let r = 0; r < rows.length; r++) {
    const rowStr = (rows[r] || []).map((c) => String(c || '').toLowerCase()).join(' ');
    if (rowStr.includes('questionid') || (rowStr.includes('question') && rowStr.includes('answer'))) {
      headerIndex = r;
      break;
    }
  }

  const questionsMap = new Map<string, ExamQuestion>();
  const dataStartIndex = headerIndex >= 0 ? headerIndex + 1 : 6;

  for (let r = dataStartIndex; r < rows.length; r++) {
    const row = rows[r] || [];
    if (!row || row.length === 0) continue;

    const no = Number(row[0]) || questionsMap.size + 1;
    const questionId = String(row[1] || `q-${no}`).trim();
    const questionText = String(row[2] || '').trim();
    const answerId = String(row[3] || `a-${r}`).trim();
    const answerText = String(row[4] || '').trim();
    const correctVal = String(row[5] ?? '').trim().toLowerCase();
    const weightVal = Number(row[7]) || 1;

    if (!questionText || !answerText) continue;

    const isCorrect = correctVal === '1' || correctVal === 'true' || correctVal === 'x' || correctVal === 'yes';

    if (!questionsMap.has(questionId)) {
      questionsMap.set(questionId, {
        questionId,
        orderNo: questionsMap.size + 1,
        questionText,
        weight: weightVal,
        options: [
          {
            answerId,
            answerText,
            isCorrect,
          },
        ],
      });
    } else {
      const q = questionsMap.get(questionId)!;
      q.options.push({
        answerId,
        answerText,
        isCorrect,
      });
    }
  }

  const questions = Array.from(questionsMap.values());

  return {
    id: `exam-${Date.now()}`,
    examName,
    fromDate,
    toDate: toDate || undefined,
    assignedRoles: ['PG-Inline', 'PG-D', 'SUP-D'],
    questions,
  };
}

export function exportExamListCsv(exams: ExamItem[], filename = 'exam_list_export.csv'): void {
  const headers = ['No.', 'Exam Name', 'From Date', 'To Date', 'Question Count', 'Assigned Roles'];
  const rows = exams.map((ex, idx) => [
    idx + 1,
    `"${ex.examName}"`,
    ex.fromDate,
    ex.toDate || '',
    ex.questions.length,
    `"${ex.assignedRoles.join(', ')}"`,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * SPEC-12: Generate and download TemplateShiftList.xlsx
 * Follows exact schema: Sheet "ShiftList", D1="SHIFT LIST", Row 3 Header cols A-M
 */
export function generateShiftTemplateXlsx(): void {
  const wsData: (string | number | boolean | null)[][] = [
    [null, null, null, 'SHIFT LIST'],
    [],
    [
      'No.',
      'ShiftGroup*',
      'GroupName*',
      'RefCode*',
      'ShiftCode*',
      'ShiftName*',
      'From',
      'To',
      'Value',
      'Note',
      'Order',
      'OT',
      'Status',
    ],
    [
      1,
      'PA',
      'PA',
      'ON',
      'AM07H00',
      '07:00 - 15:00',
      '07:00',
      '15:00',
      1,
      'Morning shift sample',
      1,
      0,
      1,
    ],
    [
      2,
      'PA',
      'PA',
      'ON',
      'PM1420',
      '14:01 - 20:00',
      '14:01',
      '20:00',
      0.75,
      'Afternoon sample',
      2,
      0,
      1,
    ],
    [
      3,
      'PA_KHO',
      'PA KHO',
      'ON',
      'KHO-OT',
      '17:00 - 21:00',
      '17:00',
      '21:00',
      0.5,
      'Overtime warehouse sample',
      3,
      1,
      1,
    ],
    [
      4,
      'PA',
      'PA',
      'OFF',
      'OFF-DAY',
      'Day Off (OFF)',
      '00:00',
      '00:00',
      0,
      'Day off sample',
      4,
      0,
      1,
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ShiftList');
  XLSX.writeFile(wb, 'TemplateShiftList.xlsx');
}

/**
 * SPEC-12: Parse imported TemplateShiftList.xlsx file
 */
export async function parseShiftImportXlsx(file: File): Promise<WorkingShiftRecord[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames.includes('ShiftList') ? 'ShiftList' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rows: (string | number | boolean | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Rows 0-1 are Title block, Row 2 is Header (index 2), Data starts at index 3
  if (rows.length < 4) {
    throw new Error('ShiftList sheet must contain header row and at least one data row.');
  }

  const dataRows = rows.slice(3);
  const importedRecords: WorkingShiftRecord[] = [];

  dataRows.forEach((r, idx) => {
    if (!r || r.length === 0) return;
    const shiftGroup = String(r[1] || '').trim();
    const groupName = String(r[2] || '').trim();
    const rawRefCode = String(r[3] || '').trim().toUpperCase();
    const refCode: ShiftRefCode = rawRefCode === 'OFF' ? 'OFF' : 'ON';
    const shiftCode = String(r[4] || '').trim();
    const shiftName = String(r[5] || '').trim();

    // Required columns validation
    if (!shiftGroup || !groupName || !shiftCode || !shiftName) {
      return; // Skip invalid rows missing mandatory fields
    }

    const fromTime = String(r[6] || '00:00').trim();
    const toTime = String(r[7] || '00:00').trim();
    const valueNum = Number(r[8]);
    const value = !isNaN(valueNum) ? valueNum : 1;
    const note = r[9] !== undefined ? String(r[9]).trim() : undefined;
    const sortOrderNum = Number(r[10]);
    const sortOrder = !isNaN(sortOrderNum) ? sortOrderNum : idx + 1;

    // OT Boolean parsing: 1 / TRUE / Yes -> true
    const rawOt = String(r[11] || '').trim().toLowerCase();
    const isOt = rawOt === '1' || rawOt === 'true' || rawOt === 'yes';

    // Status Boolean parsing: 1 / Active / TRUE -> true, 0 / Inactive / false -> false (defaults to true)
    const rawStatus = String(r[12] !== undefined ? r[12] : '1').trim().toLowerCase();
    const isActive = !(rawStatus === '0' || rawStatus === 'inactive' || rawStatus === 'false');

    importedRecords.push({
      id: `ws-import-${Date.now()}-${idx}`,
      shiftGroup,
      groupName,
      refCode,
      shiftCode,
      shiftName,
      fromTime: fromTime || '00:00',
      toTime: toTime || '00:00',
      value,
      note,
      sortOrder,
      isOt,
      isActive,
      skipReport: refCode === 'OFF',
    });
  });

  return importedRecords;
}

/**
 * SPEC-12: Export Working Shift List to CSV
 */
export function exportWorkingShiftsCsv(shifts: WorkingShiftRecord[], filename = 'WorkingShiftList.csv'): void {
  const headers = [
    'No.',
    'Shift Group',
    'Group Name',
    'Shift Code',
    'Shift Name',
    'OT',
    'From',
    'To',
    'Value',
    'Ref Code',
    'Skip Report',
    'Status',
    'Note',
  ];

  const rows = shifts.map((s, idx) => {
    return [
      idx + 1,
      `"${s.shiftGroup}"`,
      `"${s.groupName}"`,
      `"${s.shiftCode}"`,
      `"${s.shiftName}"`,
      s.isOt ? 'Yes' : 'No',
      `"${s.fromTime}"`,
      `"${s.toTime}"`,
      s.value,
      `"${s.refCode}"`,
      s.skipReport ? 'Yes' : 'No',
      s.isActive ? 'Active' : 'Inactive',
      `"${s.note || ''}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}





export function exportExamResultsCsv(
  results: EmployeeExamResultSummary[],
  filename = 'exam_results_export.csv'
): void {
  const headers = [
    'No.',
    'Supervisor',
    'Employee Code',
    'Employee Name',
    'Position',
    'Exam Name',
    'Date Range',
    'Total Attempts',
    'Latest Score',
    'Latest Submitted At',
  ];

  const rows = results.map((r, idx) => {
    const latestAttempt = [...r.attempts].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0];

    const scoreStr = latestAttempt ? `${latestAttempt.score}/${latestAttempt.totalWeight}` : '-';
    const submittedAtStr = latestAttempt ? latestAttempt.submittedAt : '-';

    return [
      idx + 1,
      `"${r.supervisorName}"`,
      r.employeeCode,
      `"${r.employeeName}"`,
      r.position,
      `"${r.examName}"`,
      `"${r.attemptDateRange}"`,
      r.attemptCount,
      `"${scoreStr}"`,
      `"${submittedAtStr}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * SPEC-12: Generate and download TemplateShiftList.xlsx
 * Follows exact schema: Sheet "ShiftList", D1="SHIFT LIST", Row 3 Header cols A-M
 */
