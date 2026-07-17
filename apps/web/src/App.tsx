import { Link, Route, Routes } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardPage } from '@/pages/dashboard-page';
import { LoginPage } from '@/pages/login-page';

// Landing page lengkap (hero, features, dst.) dibangun pada fase berikutnya.
function LandingPlaceholder() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background p-6 text-foreground">
      <h1 className="text-balance text-4xl font-bold">{APP_NAME}</h1>
      <p className="text-pretty text-muted-foreground">{APP_TAGLINE}</p>
      <Link
        to="/login"
        className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Masuk dengan Google
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPlaceholder />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
