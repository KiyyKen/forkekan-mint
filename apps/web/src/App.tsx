import { Link, Route, Routes } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

import { AdminRoute } from '@/components/admin-route';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/layouts/admin-layout';
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page';
import { AdminJobsPage } from '@/pages/admin/admin-jobs-page';
import { AdminPresetsPage } from '@/pages/admin/admin-presets-page';
import { AdminUsersPage } from '@/pages/admin/admin-users-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { HistoryPage } from '@/pages/history-page';
import { LoginPage } from '@/pages/login-page';
import { UploadPage } from '@/pages/upload-page';

// Landing page lengkap (hero, features, dst.) dibangun pada fase berikutnya.
function LandingPlaceholder() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background p-6 text-foreground">
      <h1 className="text-balance text-4xl font-bold">{APP_NAME}</h1>
      <p className="text-pretty text-muted-foreground">{APP_TAGLINE}</p>
      <div className="mt-4 flex items-center gap-6">
        <Link
          to="/upload"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Upload video
        </Link>
        <Link
          to="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Masuk dengan Google
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPlaceholder />} />
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
