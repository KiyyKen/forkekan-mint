import { useEffect, useState } from 'react';

import { useThemeStore, type Theme } from '@/stores/theme-store';

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
}

/**
 * Tema aktif + tema yang benar-benar diterapkan ke halaman (setelah resolusi
 * "system"). Menerapkan/menghapus class `.dark` pada <html> sebagai side
 * effect, dan mengikuti perubahan preferensi OS secara realtime saat
 * theme === 'system'. Aman dipanggil di banyak komponen sekaligus (App untuk
 * sinkronisasi, ThemeToggle untuk tampilan) karena sumber kebenarannya adalah
 * satu Zustand store yang sama.
 */
export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme));

  useEffect(() => {
    const applied = resolveTheme(theme);
    document.documentElement.classList.toggle('dark', applied === 'dark');
    setResolvedTheme(applied);

    if (theme !== 'system') {
      return;
    }

    const media = window.matchMedia(DARK_MEDIA_QUERY);
    function handleChange() {
      const applied = systemPrefersDark() ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', applied === 'dark');
      setResolvedTheme(applied);
    }

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, resolvedTheme, setTheme };
}
