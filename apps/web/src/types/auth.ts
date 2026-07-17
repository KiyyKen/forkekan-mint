export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface CurrentUser extends AuthUser {
  avatarUrl: string | null;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
