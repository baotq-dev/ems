// Types for Quick Test Module (SPEC-07)

export type TargetExamRole =
  | 'Customer'
  | 'GS'
  | 'TL'
  | 'PG-D'
  | 'PG-Inline'
  | 'PG-G'
  | 'SUP-D'
  | 'SUP-G'
  | 'TBHV';

export interface ExamAnswerOption {
  answerId: string;
  answerText: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  questionId: string;
  orderNo: number;
  questionText: string;
  weight: number;
  options: ExamAnswerOption[];
}

export interface ExamItem {
  id: string;
  examName: string;
  fromDate: string; // YYYY-MM-DD
  toDate?: string;  // YYYY-MM-DD
  assignedRoles: TargetExamRole[];
  questions: ExamQuestion[];
}

export interface EmployeeQuestionAnswer {
  questionId: string;
  selectedAnswerId: string;
}

export interface ExamAttemptRecord {
  attemptId: string;
  submittedAt: string; // Format: "YYYY-MM-DD HH:mm:ss"
  score: number;
  totalWeight: number;
  answers: EmployeeQuestionAnswer[];
}

export interface EmployeeExamResultSummary {
  id: string;
  supervisorId: string;
  supervisorName: string;
  employeeCode: string;
  employeeName: string;
  position: TargetExamRole | string;
  examId: string;
  examName: string;
  examFromDate: string;
  examToDate?: string;
  attemptDateRange: string; // e.g., "2026-10-01 - 2026-10-23"
  attemptCount: number;     // Total times employee took the exam
  attempts: ExamAttemptRecord[]; // Full history; UI renders ONLY latest attempt
}
