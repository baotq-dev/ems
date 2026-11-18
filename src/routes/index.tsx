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
import { TimesheetPage } from '@/pages/report/TimesheetPage';
import { ExamResultPage } from '@/pages/report/ExamResultPage';
import { NotificationPage } from '@/pages/system/NotificationPage';
import { useAuth } from '@/context/AuthContext';
import DashboardSummaryPage from '@/pages/dashboard/DashboardSummaryPage';
import { AttendantSummaryPage } from '@/pages/dashboard/AttendantSummaryPage';
import { InventorySummaryPage } from '@/pages/dashboard/InventorySummaryPage';
import { OutOfStockSummaryPage } from '@/pages/dashboard/OutOfStockSummaryPage';

const CatchAllRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard/summary' : '/login'} replace />;
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
          <Route path="/" element={<Navigate to="/dashboard/summary" replace />} />
          <Route path="/dashboard/summary" element={<DashboardSummaryPage />} />
          <Route path="/dashboard/attendant-summary" element={<AttendantSummaryPage />} />
          <Route path="/dashboard/inventory-summary" element={<InventorySummaryPage />} />
          <Route path="/dashboard/out-of-stock-summary" element={<OutOfStockSummaryPage />} />
          <Route path="/operation-config/user-list" element={<UserListPage />} />
          <Route path="/operation-config/exam-list" element={<ExamListPage />} />
          <Route path="/planning/work-schedule" element={<WorkSchedulePage />} />
          <Route path="/report/attendant" element={<AttendantReportPage />} />
          <Route path="/report/sell-out-pa" element={<SellOutPaReportPage />} />
          <Route path="/report/timesheet" element={<TimesheetPage />} />
          <Route path="/report/exam-result" element={<ExamResultPage />} />
          <Route path="/system/notification" element={<NotificationPage />} />
        </Route>
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
