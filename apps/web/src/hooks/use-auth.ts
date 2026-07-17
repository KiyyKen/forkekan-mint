import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import * as authService from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const;

/**
 * Profil user yang sedang login (GET /auth/me).
 * Hanya aktif saat token tersedia.
 */
export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: authService.fetchCurrentUser,
    enabled: token !== null,
  });
}

/**
 * Login Google: tukar ID token dengan JWT lalu simpan sesi.
 */
export function useGoogleLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    },
  });
}

/**
 * Logout: beri tahu server lalu hapus sesi client.
 */
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      navigate('/login', { replace: true });
    },
  });
}
