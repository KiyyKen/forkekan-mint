import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_METADATA_KEY = 'roles';

/**
 * Membatasi controller/handler untuk role tertentu.
 * Wajib dipasang bersama JwtAuthGuard + RolesGuard (urutan: Jwt dulu).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_METADATA_KEY, roles);
