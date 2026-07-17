import { Link, Navigate } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { useGoogleLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const login = useGoogleLogin();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="text-balance text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-pretty mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>

        <div className="mt-8 flex flex-col items-center gap-4">
          {login.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              Memproses login...
            </p>
          ) : (
            <GoogleSignInButton onCredential={(idToken) => login.mutate(idToken)} />
          )}

          {login.isError && (
            <p role="alert" className="text-pretty text-sm text-destructive">
              Login gagal. Silakan coba lagi.
            </p>
          )}
        </div>

        <p className="text-pretty mt-8 text-center text-sm text-muted-foreground">
          Hanya ingin optimasi cepat?{' '}
          <Link
            to="/"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Lanjutkan tanpa login
          </Link>
        </p>
      </div>
    </main>
  );
}
