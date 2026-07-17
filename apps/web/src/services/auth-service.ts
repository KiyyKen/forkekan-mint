import { apiRequest } from '@/services/api';
import type { CurrentUser, LoginResponse } from '@/types/auth';

/**
 * Endpoint authentication — docs/07-api-specification.md.
 */
export function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/auth/me');
}

export function logout(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
}
