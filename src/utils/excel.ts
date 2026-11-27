import * as XLSX from 'xlsx';
import { ExamItem, ExamQuestion, EmployeeExamResultSummary } from '@/types/exam';
import { WorkingShiftRecord, ShiftRefCode } from '@/types/workingShift';
import { ProductCategoryRecord } from '@/types/category';
import { ProductRecord, ProductStatus } from '@/types/product';
import { StoreRecord, StoreStatus } from '@/types/store';
import { INITIAL_CATEGORY_RECORDS } from '@/mocks/categoryMockData';
import {
  MOCK_CHANNELS,
  MOCK_ACCOUNTS,
  MOCK_PROVINCE_HIERARCHY,
} from '@/mocks/storeMockData';

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
 * SPEC-14: Generate and download ProductListTemplate.xlsx (Two-sheet workbook: ProductList + CategoryRef)
 */

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

export function exportCategoriesCsv(categories: ProductCategoryRecord[], filename = 'ProductCategoryList.csv'): void {
  const headers = [
    'No.',
    'Division',
    'Brand',
    'Brand (VN)',
    'Category',
    'Category (VN)',
    'Sub Category',
    'Sub Category (VN)',
    'Variant',
    'Order',
    'Status',
  ];

  const rows = categories.map((c, idx) => [
    idx + 1,
    `"${c.division}"`,
    `"${c.brand}"`,
    `"${c.brandVn}"`,
    `"${c.category}"`,
    `"${c.categoryVn}"`,
    `"${c.subCategory || ''}"`,
    `"${c.subCategoryVn || ''}"`,
    `"${c.variant || ''}"`,
    c.sortOrder,
    `"${c.status}"`,
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

export function generateProductTemplateXlsx(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: ProductList
  const wsProductData: (string | number | boolean | null)[][] = [
    [null, null, 'PRODUCT LIST'],
    [],
    [
      'No.',
      'Product Code',
      'Product Name',
      'Price',
      'Barcode',
      'Barrel Barcode',
      'Barrel Size',
      'Package Size',
      'Unit',
      'Status',
      'ExpiryDate',
      'Order',
      'ID Category',
      'Division',
      'Brand',
      'Product Group',
      'Inactive From',
      'Inactive To',
      'Created Date',
    ],
    [
      1,
      'P00001',
      'SAIGON LAGER x 24 lon',
      265000,
      '8934567890123',
      '18934567890120',
      24,
      '330ml',
      'Case',
      'Active',
      '',
      1,
      'cat-001',
      'Sabeco',
      'Sai Gon Lager',
      'Lager Beer',
      '',
      '',
      '2026-01-15',
    ],
    [
      2,
      'P00011',
      'Lac Viet 12 lon 330ml Gift Box',
      135000,
      '8934567890136',
      '18934567890133',
      12,
      '330ml',
      'Box',
      'Inactive',
      '',
      4,
      'cat-002',
      'Sabeco',
      'Lac Viet',
      'Craft Lager',
      '2025-12-13',
      '2026-06-30',
      '2025-11-20',
    ],
  ];

  const wsProduct = XLSX.utils.aoa_to_sheet(wsProductData);
  XLSX.utils.book_append_sheet(wb, wsProduct, 'ProductList');

  // Sheet 2: CategoryRef
  const wsCatData: (string | number | boolean | null)[][] = [
    [],
    [],
    [
      null,
      'ID Category',
      'Division',
      'Brand',
      'Product Group',
      'SubCategory',
      'SubCategory (VN)',
      'Variant',
    ],
    ...INITIAL_CATEGORY_RECORDS.map((c) => [
      null,
      c.id,
      c.division,
      c.brand,
      c.category,
      c.subCategory || '',
      c.subCategoryVn || '',
      c.variant || '',
    ]),
  ];

  const wsCat = XLSX.utils.aoa_to_sheet(wsCatData);
  XLSX.utils.book_append_sheet(wb, wsCat, 'CategoryRef');

  XLSX.writeFile(wb, 'ProductListTemplate.xlsx');
}

/**
 * SPEC-14: Parse imported ProductListTemplate.xlsx file
 */
export async function parseProductImportXlsx(file: File): Promise<ProductRecord[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames.includes('ProductList') ? 'ProductList' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 4) {
    throw new Error('ProductList sheet must contain header row and at least one data row.');
  }

  const dataRows = rows.slice(3);
  const importedRecords: ProductRecord[] = [];

  dataRows.forEach((r, idx) => {
    if (!r || r.length === 0) return;
    const productCode = String(r[1] || '').trim();
    const productName = String(r[2] || '').trim();
    const price = Number(r[3]) || 0;
    const barcode = r[4] ? String(r[4]).trim() : undefined;
    const barrelBarcode = r[5] ? String(r[5]).trim() : undefined;
    const barrelSize = Number(r[6]) || 0;
    const packageSize = r[7] ? String(r[7]).trim() : undefined;
    const unit = String(r[8] || 'Case').trim();
    const rawStatus = String(r[9] || 'Active').trim();
    const status: ProductStatus = rawStatus.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    const expiryDate = r[10] ? String(r[10]).trim() : undefined;
    const sortOrder = Number(r[11]) || idx + 1;
    const categoryId = String(r[12] || 'cat-001').trim();
    const division = String(r[13] || '').trim();
    const brand = String(r[14] || '').trim();
    const productGroup = r[15] ? String(r[15]).trim() : undefined;
    const inactiveFrom = r[16] ? String(r[16]).trim() : undefined;
    const inactiveTo = r[17] ? String(r[17]).trim() : undefined;
    const createdAt = r[18] ? String(r[18]).trim() : new Date().toISOString().split('T')[0];

    // Validate required fields
    if (!productCode || !productName || !division || !brand) {
      return;
    }

    importedRecords.push({
      id: `prod-import-${Date.now()}-${idx}`,
      categoryId,
      division,
      brand,
      productGroup,
      productCode,
      productName,
      barcode,
      barrelBarcode,
      barrelSize,
      unit,
      packageSize,
      sortOrder,
      price,
      status,
      inactiveFrom,
      inactiveTo,
      inactivePeriods: inactiveFrom
        ? [{ id: `pip-${Date.now()}-${idx}`, fromDate: inactiveFrom, toDate: inactiveTo }]
        : [],
      expiryDate,
      createdAt,
    });
  });

  return importedRecords;
}

/**
 * SPEC-14: Export Products to CSV / XLSX
 */
export function exportProductsCsv(products: ProductRecord[], filename = 'ProductList.csv'): void {
  const headers = [
    'No.',
    'Division',
    'Brand',
    'Product Code',
    'Product Name',
    'Unit',
    'Barcode',
    'Barrel Size',
    'Price',
    'Status',
    'Inactive From',
    'Inactive To',
    'Created Date',
  ];

  const rows = products.map((p, idx) => [
    idx + 1,
    `"${p.division}"`,
    `"${p.brand}"`,
    `"${p.productCode}"`,
    `"${p.productName}"`,
    `"${p.unit}"`,
    `"${p.barcode || ''}"`,
    p.barrelSize,
    p.price,
    `"${p.status}"`,
    `"${p.inactiveFrom || ''}"`,
    `"${p.inactiveTo || ''}"`,
    `"${p.createdAt}"`,
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
 * SPEC-15: Generate and download StoreList.xlsx (Multi-sheet workbook: StoreList + Accounts, Channels, Provinces)
 */
export function generateStoreTemplateXlsx(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: StoreList
  const wsStoreData: (string | number | boolean | null)[][] = [
    ['STORE LIST'],
    ['Format Date: yyyy-MM-dd | Status: Active/Inactive'],
    [
      'No.',
      'Supplier Code',
      'Supplier Name',
      'Account Code',
      'Account Name',
      'Chain',
      'Channel Code',
      'Channel Name',
      'Store Type',
      'Store Code (*)',
      'Store Name (*)',
      'Address (*)',
      'Province Id',
      'Area',
      'Province',
      'District',
      'Town',
      'Latitude',
      'Longitude',
      'Accuracy',
      'Closed Date',
      'Frequency',
      'Status',
      'Created Date',
      'Updated Date',
      'Note',
      'Overview',
    ],
    [
      1,
      'SUP001',
      'South Distribution Co.',
      'CUS003',
      'MEGA',
      'Mega Market',
      'Hyper',
      'Hypermarket',
      'Hypermarket',
      'A103',
      'Mega Vung Tau',
      'QL51B, Ward 11, Vung Tau City, Ba Ria - Vung Tau',
      2,
      'Mien Dong',
      'Ba Ria - Vung Tau',
      'Vung Tau City',
      'Phuoc Thang Ward',
      10.3759,
      107.1234,
      10,
      '2025-06-30',
      3,
      'Inactive',
      '2023-01-01',
      '2025-06-30',
      'Coastal flagship store',
      'High traffic hypermarket in Vung Tau coastal area',
    ],
  ];

  const wsStore = XLSX.utils.aoa_to_sheet(wsStoreData);
  XLSX.utils.book_append_sheet(wb, wsStore, 'StoreList');

  // Sheet 2: Accounts
  const wsAccountsData = [
    ['Account Code', 'Account Name', 'Chain'],
    ...MOCK_ACCOUNTS.map((a) => [a.code, a.name, a.chain || '']),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsAccountsData), 'Accounts');

  // Sheet 3: Channels
  const wsChannelsData = [
    ['Channel Code', 'Channel Name'],
    ...MOCK_CHANNELS.map((c) => [c.code, c.name]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsChannelsData), 'Channels');

  // Sheet 4: Provinces
  const wsProvincesData: (string | number)[][] = [['Area', 'Province', 'District', 'Town']];
  MOCK_PROVINCE_HIERARCHY.forEach((p) => {
    p.districts.forEach((d) => {
      d.towns.forEach((tw) => {
        wsProvincesData.push([p.area, p.province, d.name, tw]);
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsProvincesData), 'Provinces');

  XLSX.writeFile(wb, 'StoreList.xlsx');
}

/**
 * SPEC-15: Parse imported StoreList.xlsx file
 */
export async function parseStoreImportXlsx(file: File): Promise<StoreRecord[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames.includes('StoreList') ? 'StoreList' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 4) {
    throw new Error('StoreList sheet must contain header row and at least one data row.');
  }

  const dataRows = rows.slice(3);
  const importedStores: StoreRecord[] = [];

  dataRows.forEach((r, idx) => {
    if (!r || r.length === 0) return;
    const storeCode = String(r[9] || '').trim();
    const storeName = String(r[10] || '').trim();
    const address = String(r[11] || '').trim();

    if (!storeCode || !storeName || !address) {
      return;
    }

    const supplierCode = r[1] ? String(r[1]).trim() : undefined;
    const supplierName = r[2] ? String(r[2]).trim() : undefined;
    const accountCode = String(r[3] || 'CUS001').trim();
    const accountName = String(r[4] || 'COOP').trim();
    const channelCode = r[6] ? String(r[6]).trim() : undefined;
    const channelName = r[7] ? String(r[7]).trim() : undefined;
    const storeType = r[8] ? String(r[8]).trim() : undefined;
    const area = String(r[13] || 'Mien Dong').trim();
    const province = String(r[14] || 'Ho Chi Minh City').trim();
    const district = r[15] ? String(r[15]).trim() : undefined;
    const town = r[16] ? String(r[16]).trim() : undefined;
    const latitude = Number(r[17]) || undefined;
    const longitude = Number(r[18]) || undefined;
    const accuracy = Number(r[19]) || undefined;
    const closedDate = r[20] ? String(r[20]).trim() : undefined;
    const frequency = Number(r[21]) || 1;
    const rawStatus = String(r[22] || (closedDate ? 'Inactive' : 'Active')).trim();
    const status: StoreStatus = rawStatus.toLowerCase() === 'inactive' || closedDate ? 'Inactive' : 'Active';
    const createdAt = r[23] ? String(r[23]).trim() : new Date().toISOString().split('T')[0];
    const updatedAt = r[24] ? String(r[24]).trim() : new Date().toISOString().split('T')[0];
    const overview = r[26] ? String(r[26]).trim() : undefined;

    importedStores.push({
      id: `str-import-${Date.now()}-${idx}`,
      storeCode,
      storeName,
      address,
      accountCode,
      accountName,
      supplierCode,
      supplierName,
      channelCode,
      channelName,
      storeType,
      area,
      province,
      district,
      town,
      newProvince: province,
      newTown: town,
      latitude,
      longitude,
      accuracy,
      closedDate,
      frequency,
      status,
      overview,
      createdAt,
      updatedAt,
    });
  });

  return importedStores;
}

/**
 * SPEC-15: Export Store List to CSV / XLSX
 */
export function exportStoresCsv(stores: StoreRecord[], filename = 'StoreList.csv'): void {
  const headers = [
    'No.',
    'Region',
    'Channel',
    'Account Code',
    'Account Name',
    'Store Code',
    'Store Name',
    'Address',
    'Closed Date',
    'Province/City (New)',
    'Ward/Commune (New)',
    'Status',
    'Frequency',
    'Created Date',
  ];

  const rows = stores.map((s, idx) => [
    idx + 1,
    `"${s.area}"`,
    `"${s.channelName || ''}"`,
    `"${s.accountCode}"`,
    `"${s.accountName}"`,
    `"${s.storeCode}"`,
    `"${s.storeName}"`,
    `"${s.address}"`,
    `"${s.closedDate || ''}"`,
    `"${s.newProvince || ''}"`,
    `"${s.newTown || ''}"`,
    `"${s.status}"`,
    s.frequency,
    `"${s.createdAt}"`,
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

/**
 * SPEC-14: Generate and download ProductListTemplate.xlsx (Two-sheet workbook: ProductList + CategoryRef)
 */
