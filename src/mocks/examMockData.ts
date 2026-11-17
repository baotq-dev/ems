import { ExamItem, EmployeeExamResultSummary } from '@/types/exam';

export const MOCK_EXAMS: ExamItem[] = [
  {
    id: 'exam-01',
    examName: 'Pre-Shift Quick Test 2026',
    fromDate: '2026-04-28',
    toDate: '2026-12-31',
    assignedRoles: ['PG-D', 'PG-Inline', 'SUP-D'],
    questions: [
      {
        questionId: 'q01',
        orderNo: 1,
        questionText: 'What is the standard mixing ratio for MacCoffee 3in1 Classic?',
        weight: 1,
        options: [
          { answerId: 'q01-a1', answerText: '1 packet with 70ml hot water (80-90°C)', isCorrect: true },
          { answerId: 'q01-a2', answerText: '1 packet with 150ml boiling water', isCorrect: false },
          { answerId: 'q01-a3', answerText: '2 packets with 50ml lukewarm water', isCorrect: false },
          { answerId: 'q01-a4', answerText: '1 packet with 120ml cold water', isCorrect: false },
        ],
      },
      {
        questionId: 'q02',
        orderNo: 2,
        questionText: 'When sampling MacCereal to customers, what hygiene rule is mandatory?',
        weight: 1,
        options: [
          { answerId: 'q02-a1', answerText: 'Wear clean gloves and a face mask at all times', isCorrect: true },
          { answerId: 'q02-a2', answerText: 'Only clean hands with dry napkin', isCorrect: false },
          { answerId: 'q02-a3', answerText: 'Gloves are optional if hands look clean', isCorrect: false },
          { answerId: 'q02-a4', answerText: 'Mask is only required when supervisor is visiting', isCorrect: false },
        ],
      },
      {
        questionId: 'q03',
        orderNo: 3,
        questionText: 'What is the shelf life requirement for products displayed on promotional end-caps?',
        weight: 1,
        options: [
          { answerId: 'q03-a1', answerText: 'At least 2/3 of remaining shelf life, FIFO strictly followed', isCorrect: true },
          { answerId: 'q03-a2', answerText: 'Any shelf life as long as not expired', isCorrect: false },
          { answerId: 'q03-a3', answerText: 'LIFO principle should be prioritized', isCorrect: false },
          { answerId: 'q03-a4', answerText: 'Near-expiry items must be displayed at eye level without notice', isCorrect: false },
        ],
      },
      {
        questionId: 'q04',
        orderNo: 4,
        questionText: 'How many minutes before shift start must a PG arrive at the store for check-in?',
        weight: 1,
        options: [
          { answerId: 'q04-a1', answerText: '15 minutes prior to shift start for uniform & booth prep', isCorrect: true },
          { answerId: 'q04-a2', answerText: 'Exact shift start time is fine', isCorrect: false },
          { answerId: 'q04-a3', answerText: '30 minutes late is acceptable if reported', isCorrect: false },
          { answerId: 'q04-a4', answerText: '5 minutes after shift starts', isCorrect: false },
        ],
      },
      {
        questionId: 'q05',
        orderNo: 5,
        questionText: 'Which key selling message applies to Cafe PHO Black Ice Coffee?',
        weight: 1,
        options: [
          { answerId: 'q05-a1', answerText: 'Bold Vietnamese iced black coffee taste with rich aroma', isCorrect: true },
          { answerId: 'q05-a2', answerText: 'Mild European drip coffee flavor with hazelnut', isCorrect: false },
          { answerId: 'q05-a3', answerText: 'Decaffeinated fruit-flavored beverage', isCorrect: false },
          { answerId: 'q05-a4', answerText: 'Herbal tea alternative', isCorrect: false },
        ],
      },
      {
        questionId: 'q06',
        orderNo: 6,
        questionText: 'What is the proper procedure if a customer complains about damaged packaging?',
        weight: 1,
        options: [
          { answerId: 'q06-a1', answerText: 'Apologize sincerely, immediately exchange for an intact product, and report to supervisor', isCorrect: true },
          { answerId: 'q06-a2', answerText: 'Advise customer to contact manufacturer hotline directly', isCorrect: false },
          { answerId: 'q06-a3', answerText: 'Ignore if the box inside is still intact', isCorrect: false },
          { answerId: 'q06-a4', answerText: 'Ask supermarket staff to handle it', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'exam-02',
    examName: 'New Product Launch Quiz Q4',
    fromDate: '2026-10-01',
    toDate: '2026-11-30',
    assignedRoles: ['PG-Inline', 'TL', 'Customer'],
    questions: [
      {
        questionId: 'q2-01',
        orderNo: 1,
        questionText: 'What is the primary target demographic for the new MacTea Bubble Milk Tea line?',
        weight: 1,
        options: [
          { answerId: 'q2-01-a1', answerText: 'Gen Z and young office workers seeking convenient trendy beverage', isCorrect: true },
          { answerId: 'q2-01-a2', answerText: 'Senior citizens seeking low-caffeine tea', isCorrect: false },
          { answerId: 'q2-01-a3', answerText: 'Professional athletes only', isCorrect: false },
          { answerId: 'q2-01-a4', answerText: 'Children under 5 years old', isCorrect: false },
        ],
      },
      {
        questionId: 'q2-02',
        orderNo: 2,
        questionText: 'How is the promotional buy-2-get-1 gift bundle distributed at store?',
        weight: 1,
        options: [
          { answerId: 'q2-02-a1', answerText: 'Handed directly by PG with stamped receipt confirmation', isCorrect: true },
          { answerId: 'q2-02-a2', answerText: 'Customer picks gift themselves from shelf', isCorrect: false },
          { answerId: 'q2-02-a3', answerText: 'Mailed to customer residential address', isCorrect: false },
          { answerId: 'q2-02-a4', answerText: 'Gift is claimed online via website only', isCorrect: false },
        ],
      },
    ],
  },
];

export const MOCK_EXAM_RESULTS: EmployeeExamResultSummary[] = [
  {
    id: 'res-001',
    supervisorId: 'usr-002',
    supervisorName: 'Nguyen Minh Tuan',
    employeeCode: 'FD004',
    employeeName: 'Le Hoang Nam',
    position: 'PG-Inline',
    examId: 'exam-01',
    examName: 'Pre-Shift Quick Test 2026',
    examFromDate: '2026-04-28',
    examToDate: '2026-12-31',
    attemptDateRange: '2026-10-01 - 2026-10-23',
    attemptCount: 2, // Demonstrates multiple attempts
    attempts: [
      // Older attempt (Attempt 1 - lower score)
      {
        attemptId: 'att-001-1',
        submittedAt: '2026-10-01 07:45:10',
        score: 3,
        totalWeight: 6,
        answers: [
          { questionId: 'q01', selectedAnswerId: 'q01-a1' }, // Correct
          { questionId: 'q02', selectedAnswerId: 'q02-a2' }, // Incorrect
          { questionId: 'q03', selectedAnswerId: 'q03-a2' }, // Incorrect
          { questionId: 'q04', selectedAnswerId: 'q04-a1' }, // Correct
          { questionId: 'q05', selectedAnswerId: 'q05-a2' }, // Incorrect
          { questionId: 'q06', selectedAnswerId: 'q06-a1' }, // Correct
        ],
      },
      // Latest attempt (Attempt 2 - higher score, displayed by UI)
      {
        attemptId: 'att-001-2',
        submittedAt: '2026-10-23 07:50:22',
        score: 5,
        totalWeight: 6,
        answers: [
          { questionId: 'q01', selectedAnswerId: 'q01-a1' }, // Correct: Selected & Correct
          { questionId: 'q02', selectedAnswerId: 'q02-a1' }, // Correct: Selected & Correct
          { questionId: 'q03', selectedAnswerId: 'q03-a1' }, // Correct: Selected & Correct
          { questionId: 'q04', selectedAnswerId: 'q04-a1' }, // Correct: Selected & Correct
          { questionId: 'q05', selectedAnswerId: 'q05-a2' }, // Incorrect: Selected Incorrect (q05-a1 is correct)
          { questionId: 'q06', selectedAnswerId: 'q06-a1' }, // Correct: Selected & Correct
        ],
      },
    ],
  },
  {
    id: 'res-002',
    supervisorId: 'usr-002',
    supervisorName: 'Nguyen Minh Tuan',
    employeeCode: 'FD005',
    employeeName: 'Pham Thu Hang',
    position: 'PG-Inline',
    examId: 'exam-01',
    examName: 'Pre-Shift Quick Test 2026',
    examFromDate: '2026-04-28',
    examToDate: '2026-12-31',
    attemptDateRange: '2026-10-15',
    attemptCount: 1,
    attempts: [
      {
        attemptId: 'att-002-1',
        submittedAt: '2026-10-15 08:05:00',
        score: 6,
        totalWeight: 6,
        answers: [
          { questionId: 'q01', selectedAnswerId: 'q01-a1' },
          { questionId: 'q02', selectedAnswerId: 'q02-a1' },
          { questionId: 'q03', selectedAnswerId: 'q03-a1' },
          { questionId: 'q04', selectedAnswerId: 'q04-a1' },
          { questionId: 'q05', selectedAnswerId: 'q05-a1' },
          { questionId: 'q06', selectedAnswerId: 'q06-a1' },
        ],
      },
    ],
  },
  {
    id: 'res-003',
    supervisorId: 'usr-003',
    supervisorName: 'Tran Thi Mai',
    employeeCode: 'FD006',
    employeeName: 'Vu Quang Huy',
    position: 'PG-Inline',
    examId: 'exam-01',
    examName: 'Pre-Shift Quick Test 2026',
    examFromDate: '2026-04-28',
    examToDate: '2026-12-31',
    attemptDateRange: '2026-11-02',
    attemptCount: 1,
    attempts: [
      {
        attemptId: 'att-003-1',
        submittedAt: '2026-11-02 13:52:14',
        score: 4,
        totalWeight: 6,
        answers: [
          { questionId: 'q01', selectedAnswerId: 'q01-a1' },
          { questionId: 'q02', selectedAnswerId: 'q02-a1' },
          { questionId: 'q03', selectedAnswerId: 'q03-a3' }, // Incorrect
          { questionId: 'q04', selectedAnswerId: 'q04-a1' },
          { questionId: 'q05', selectedAnswerId: 'q05-a3' }, // Incorrect
          { questionId: 'q06', selectedAnswerId: 'q06-a1' },
        ],
      },
    ],
  },
  {
    id: 'res-004',
    supervisorId: 'usr-003',
    supervisorName: 'Tran Thi Mai',
    employeeCode: 'FD007',
    employeeName: 'Hoang My Linh',
    position: 'PG-Inline',
    examId: 'exam-02',
    examName: 'New Product Launch Quiz Q4',
    examFromDate: '2026-10-01',
    examToDate: '2026-11-30',
    attemptDateRange: '2026-10-18',
    attemptCount: 1,
    attempts: [
      {
        attemptId: 'att-004-1',
        submittedAt: '2026-10-18 09:12:40',
        score: 2,
        totalWeight: 2,
        answers: [
          { questionId: 'q2-01', selectedAnswerId: 'q2-01-a1' },
          { questionId: 'q2-02', selectedAnswerId: 'q2-02-a1' },
        ],
      },
    ],
  },
];
