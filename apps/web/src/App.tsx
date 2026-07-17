import { Route, Routes } from 'react-router-dom';

import { AdminRoute } from '@/components/admin-route';
import { ProtectedRoute } from '@/components/protected-route';
import { useTheme } from '@/hooks/use-theme';
import { AdminLayout } from '@/layouts/admin-layout';
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page';
import { AdminJobsPage } from '@/pages/admin/admin-jobs-page';
import { AdminPresetsPage } from '@/pages/admin/admin-presets-page';
import { AdminUsersPage } from '@/pages/admin/admin-users-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { HistoryPage } from '@/pages/history-page';
import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/login-page';
import { UploadPage } from '@/pages/upload-page';

export default function App() {
  // Dipanggil sekali di root agar class .dark pada <html> tetap sinkron
  // dengan preferensi tema tersimpan/OS di semua route, termasuk sebelum
  // AppHeader (yang tidak dipasang di LoginPage) sempat mount.
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="presets" element={<AdminPresetsPage />} />
      </Route>
    </Routes>
  );
}
