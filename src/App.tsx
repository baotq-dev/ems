import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/context/I18nContext';
import { AppRoutes } from '@/routes';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
