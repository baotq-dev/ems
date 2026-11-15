import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UserListPage } from '@/pages/operation-config/UserListPage';
import { ExamListPage } from '@/pages/operation-config/ExamListPage';
import { WorkSchedulePage } from '@/pages/planning/WorkSchedulePage';
import { AttendantReportPage } from '@/pages/report/AttendantReportPage';
import { SellOutPaReportPage } from '@/pages/report/SellOutPaReportPage';
import { NotificationPage } from '@/pages/system/NotificationPage';
import { useAuth } from '@/context/AuthContext';

const CatchAllRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/operation-config/user-list' : '/login'} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Only Route */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes inside MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/operation-config/user-list" replace />} />
          <Route path="/operation-config/user-list" element={<UserListPage />} />
          <Route path="/operation-config/exam-list" element={<ExamListPage />} />
          <Route path="/planning/work-schedule" element={<WorkSchedulePage />} />
          <Route path="/report/attendant" element={<AttendantReportPage />} />
          <Route path="/report/sell-out-pa" element={<SellOutPaReportPage />} />
          <Route path="/system/notification" element={<NotificationPage />} />
        </Route>
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
