import { Video } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useGoogleLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const login = useGoogleLogin();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-96 w-full max-w-3xl rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-sm sm:p-12">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Video aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-balance mt-5 text-2xl font-bold tracking-tight">
            Masuk ke {APP_NAME}
          </h1>
          <p className="text-pretty mt-2 text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {login.isPending ? (
            <div
              role="status"
              className="flex h-11 w-full max-w-70 items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
              />
              Memproses login...
            </div>
          ) : (
            <GoogleSignInButton onCredential={(idToken) => login.mutate(idToken)} />
          )}

          {login.isError && (
            <p role="alert" className="text-pretty text-center text-sm text-destructive">
              Login gagal. Coba lagi.
            </p>
          )}
        </div>

        <div aria-hidden="true" className="mt-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">atau</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="text-pretty mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/"
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Lanjutkan tanpa login
          </Link>{' '}
          untuk optimasi cepat sebagai tamu.
        </p>
      </div>
    </main>
  );
}
