import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const guard = new JwtAuthGuard(jwtService as unknown as JwtService);

  function createContext(authorization?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = { headers: { authorization } } as AuthenticatedRequest;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('meloloskan request dengan Bearer token valid dan menempelkan payload', async () => {
    const payload: JwtPayload = { sub: 'user-1', email: 'a@b.c', role: UserRole.USER };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(payload);
  });

  it('menolak request tanpa header Authorization', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('menolak token yang tidak valid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

    const { context } = createContext('Bearer broken-token');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
