import { Route, Routes } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

// Placeholder root — halaman aplikasi akan dibangun mulai Phase 2.
export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background text-foreground">
            <h1 className="text-4xl font-bold">{APP_NAME}</h1>
            <p className="text-muted-foreground">{APP_TAGLINE}</p>
          </main>
        }
      />
    </Routes>
  );
}
