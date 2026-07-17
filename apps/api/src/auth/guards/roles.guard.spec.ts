import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const rolesGuard = new RolesGuard(reflector as unknown as Reflector);

  function contextWithRole(role?: UserRole): ExecutionContext {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { sub: 'user-1', email: 'a@b.c', role } : undefined }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengizinkan request bila handler tidak memakai @Roles()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(rolesGuard.canActivate(contextWithRole(UserRole.USER))).toBe(true);
  });

  it('mengizinkan user dengan role yang disyaratkan', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(rolesGuard.canActivate(contextWithRole(UserRole.ADMIN))).toBe(true);
  });

  it('menolak (403) user dengan role di luar syarat', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => rolesGuard.canActivate(contextWithRole(UserRole.USER))).toThrow(
      ForbiddenException,
    );
  });

  it('menolak (403) request tanpa payload user', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => rolesGuard.canActivate(contextWithRole(undefined))).toThrow(ForbiddenException);
  });
});
