// Core Data Models & TypeScript Interfaces for User domain (SPEC-01)

export type Gender = 'Male' | 'Female' | 'Other';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export type Region = 'North' | 'Central' | 'South';

export type IdentityDocType = 'CMND' | 'CCCD';

export type AccountStatus = 'Active' | 'Inactive';

export type EmploymentStatus = 'Official' | 'Probation' | 'Resigned';

export type UserPosition = 'PG-Inline' | 'Customer' | 'Supervisor' | 'Admin';

export interface UserPositionHistory {
  id: string;
  position: UserPosition | string;
  fromDate: string; // ISO format: YYYY-MM-DD
  toDate?: string;  // ISO format: YYYY-MM-DD (optional if ongoing)
}

export interface UserSupervisorHistory {
  id: string;
  supervisorId: string;
  supervisorName: string;
  fromDate: string; // ISO format: YYYY-MM-DD
  toDate?: string;  // ISO format: YYYY-MM-DD (optional if ongoing)
}

export interface UserStatusHistory {
  id: string;
  status: EmploymentStatus;
  fromDate: string;   // ISO format: YYYY-MM-DD
  toDate?: string;     // ISO format: YYYY-MM-DD
  actualDate?: string; // ISO format: YYYY-MM-DD
  reason?: string;
  note?: string;
}

export interface User {
  // Primary Identifier
  id: string;

  // 1. Personal Information
  avatarUrl?: string;
  lastName: string;
  firstName: string;
  fullName: string;
  gender?: Gender;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
  maritalStatus?: MaritalStatus;
  email?: string;
  phoneNumber: string;
  region: Region;
  workProvince: string;
  newWorkProvince?: string;
  permanentAddress?: string;
  temporaryAddress?: string;

  // 2. Work & Assignment Information
  employeeCode: string; // e.g., "FD001"
  currentPosition: UserPosition | string;
  currentSupervisorId?: string;
  currentSupervisorName?: string;
  joinDate: string; // ISO format: YYYY-MM-DD
  positionHistory: UserPositionHistory[];
  supervisorHistory: UserSupervisorHistory[];

  // 3. Identity Document Information
  identityDocType: IdentityDocType;
  identityNumber: string;
  identityIssueDate?: string; // ISO format: YYYY-MM-DD
  identityIssuePlace?: string;
  identityFrontImageUrl?: string;
  identityBackImageUrl?: string;

  // 4. Account Information
  username: string;
  password: string;
  accountStatus: AccountStatus;

  // 5. Employment Status & History
  employmentStatus: EmploymentStatus;
  statusHistory: UserStatusHistory[];
}

export interface UserFilterParams {
  position?: string;
  supervisorId?: string;
  employeeCode?: string;
  fullName?: string;
  username?: string;
  phoneNumber?: string;
  identityNumber?: string;
  accountStatus?: AccountStatus | '';
  employmentStatus?: EmploymentStatus | '';
  region?: Region | '';
  workProvince?: string;
  newWorkProvince?: string;
}
