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
      existing.addEventListener('error', () => reject(new Error('Gagal memuat script Google')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat script Google'));
    document.head.appendChild(script);
  });
}

/**
 * Tombol "Sign in with Google" (Google Identity Services).
 * Callback menerima Google ID token untuk ditukar dengan JWT backend.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID belum dikonfigurasi. Isi VITE_GOOGLE_CLIENT_ID pada file .env.');
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
      .catch((loadError: Error) => {
        if (!cancelled) {
          setError(loadError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (error) {
    return (
      <p role="alert" className="text-pretty text-sm text-destructive">
        {error}
      </p>
    );
  }

  return <div ref={containerRef} aria-label="Masuk dengan Google" />;
}
