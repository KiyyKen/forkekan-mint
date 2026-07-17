import { Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Sign-In tidak bisa dimuat. Periksa koneksi internet Anda dan coba lagi.')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Sign-In tidak bisa dimuat. Periksa koneksi internet Anda dan coba lagi.'));
    document.head.appendChild(script);
  });
}

/**
 * Tombol "Sign in with Google" (Google Identity Services).
 * Callback menerima Google ID token untuk ditukar dengan JWT backend.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isConfigMissing = !GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isConfigMissing) {
      return;
    }

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'signin_with',
        });
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setLoadError(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential, isConfigMissing]);

  // Konfigurasi hilang adalah masalah developer, bukan kegagalan yang dialami
  // pengguna — tampilkan sebagai notice kecil, bukan error yang mendominasi UI.
  if (isConfigMissing) {
    return (
      <div
        role="status"
        className="flex w-full max-w-70 items-start gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5 text-left text-xs text-muted-foreground"
      >
        <Settings aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Login Google belum dikonfigurasi. Developer: isi{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">VITE_GOOGLE_CLIENT_ID</code>{' '}
          pada file .env.
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <p role="alert" className="text-pretty text-sm text-destructive">
        {loadError}
      </p>
    );
  }

  return <div ref={containerRef} aria-label="Masuk dengan Google" />;
}
