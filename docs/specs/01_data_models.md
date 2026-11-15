# 01 - Core Data Models & TypeScript Interfaces
**Spec ID:** `SPEC-01`

## 1. Strict Scope & Anti-Hallucination Rules
- **Single Source of Truth:** Implement ONLY the TypeScript interfaces, types, and enums explicitly defined in this document.
- **Incremental Scope:** Currently, this specification covers **ONLY the `User` domain model** (and its nested sub-records for Position History, Supervisor History, and Employment Status History). Do NOT invent or pre-create interfaces for other modules (`WorkSchedule`, `Exam`, `Attendant`, `SellOutPA`, `Notification`) until their respective specs are added.
- **No Unrequested Fields:** Do NOT add arbitrary metadata fields unless explicitly defined below.
- **Language Consistency:** All interface names, property keys, enum values, and comments MUST be in **English**.

---

## 2. User Domain Model (`src/types/user.ts`)

### 2.1. Enumerations & Union Types
```typescript
export type Gender = 'Male' | 'Female' | 'Other';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export type Region = 'North' | 'Central' | 'South';

export type IdentityDocType = 'CMND' | 'CCCD';

export type AccountStatus = 'Active' | 'Inactive';

export type EmploymentStatus = 'Official' | 'Probation' | 'Resigned';

export type UserPosition = 'PG-Inline' | 'Customer' | 'Supervisor' | 'Admin';
```

### 2.2. Nested History Sub-Interfaces
These sub-interfaces represent the historical assignment and status tracking tables within a User record:

```typescript
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
```

### 2.3. Primary `User` Interface
Covers all personal, employment, identity document, account, and status tracking fields required across both the User List view and User Detail/Form view:

```typescript
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
```

---

## 3. Filter & Query Parameter Types (`src/types/user.ts`)
Used strictly for the collapsible search filter bar and column-level quick filters in the `User List` module:

```typescript
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
```

---

## 4. Field Mapping & Integrity Rules
1. **`fullName` Consistency:** `fullName` must match `${lastName}${firstName}` (or the full formatted name in mock records) so both table search and form inputs remain synchronized.
2. **Active Assignment Sync:** `currentPosition`, `currentSupervisorId`, `currentSupervisorName`, and `employmentStatus` represent the active/latest state displayed in the `User List` table and must align with the latest entry in `positionHistory`, `supervisorHistory`, and `statusHistory` respectively.
3. **Unique Identifiers:** `id`, `employeeCode`, `username`, and `identityNumber` must be unique across all mock `User` records.
