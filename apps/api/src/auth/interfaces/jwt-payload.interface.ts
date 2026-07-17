import { UserRole } from '@prisma/client';

export interface JwtPayload {
  /** User id (cuid). */
  sub: string;
  email: string;
  role: UserRole;
}
