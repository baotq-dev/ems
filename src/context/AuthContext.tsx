import React, { createContext, useContext, useState } from 'react';
import { AuthSession } from '@/types/auth';
import { MOCK_USERS } from '@/mocks/users';

const AUTH_STORAGE_KEY = 'fe_mock_auth_session';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole?: (role: 'Admin' | 'Supervisor' | 'Employee') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREDEFINED_ACCOUNTS: Record<string, { role: 'Admin' | 'Supervisor' | 'Employee'; fullName: string }> = {
  admin: { role: 'Admin', fullName: 'System Admin' },
  sup01: { role: 'Supervisor', fullName: 'Nguyen Minh Tuan' },
  namlh: { role: 'Employee', fullName: 'Le Hoang Nam' },
};

function getInitialSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed && parsed.isAuthenticated) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(getInitialSession);

  const login = (usernameInput: string, passwordInput: string) => {
    const username = usernameInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!username || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // Check predefined accounts or matching user from mock data
    const predefined = PREDEFINED_ACCOUNTS[username];
    const mockUser = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username && u.password === password
    );

    if (predefined && password === '123456') {
      const newSession: AuthSession = {
        userId: mockUser ? mockUser.id : `user-${username}`,
        username,
        fullName: mockUser ? mockUser.fullName : predefined.fullName,
        role: predefined.role,
        isAuthenticated: true,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return { success: true };
    }

    if (mockUser) {
      let role: 'Admin' | 'Supervisor' | 'Employee' = 'Employee';
      if (mockUser.currentPosition === 'Admin') role = 'Admin';
      else if (mockUser.currentPosition === 'Supervisor') role = 'Supervisor';

      const newSession: AuthSession = {
        userId: mockUser.id,
        username: mockUser.username,
        fullName: mockUser.fullName,
        role,
        isAuthenticated: true,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password.' };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  };

  const switchRole = (role: 'Admin' | 'Supervisor' | 'Employee') => {
    if (!session) return;
    const updated: AuthSession = {
      ...session,
      role,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    setSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session?.isAuthenticated),
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
