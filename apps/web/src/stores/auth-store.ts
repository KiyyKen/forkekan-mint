import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthUser } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const AUTH_STORAGE_KEY = 'forkekan-auth';

/**
 * Session management sisi client (JWT disimpan di localStorage).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
);
