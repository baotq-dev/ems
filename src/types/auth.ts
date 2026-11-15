// Mock Authentication & Session Schema (SPEC-02)

export interface AuthSession {
  userId: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Supervisor' | 'Employee';
  isAuthenticated: boolean;
}
