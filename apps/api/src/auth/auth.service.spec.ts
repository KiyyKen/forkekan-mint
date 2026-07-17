import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User, UserRole } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser: User = {
    id: 'user-1',
    name: 'Rizky',
    email: 'rizky@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    provider: 'google',
    providerId: 'google-sub-1',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const googleAuthService = {
    verifyIdToken: jest.fn(),
  };

  const usersService = {
    findById: jest.fn(),
    upsertGoogleUser: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: GoogleAuthService, useValue: googleAuthService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('loginWithGoogle', () => {
    it('mengembalikan token dan user sesuai kontrak API', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue({
        providerId: 'google-sub-1',
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
      });
      usersService.upsertGoogleUser.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('signed-jwt');

      const result = await authService.loginWithGoogle('google-id-token');

      expect(result).toEqual({
        token: 'signed-jwt',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('meneruskan UnauthorizedException saat ID token tidak valid', async () => {
      googleAuthService.verifyIdToken.mockRejectedValue(
        new UnauthorizedException('Token Google tidak valid'),
      );

      await expect(authService.loginWithGoogle('invalid')).rejects.toThrow(UnauthorizedException);
      expect(usersService.upsertGoogleUser).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('mengembalikan profil sesuai kontrak API', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      await expect(authService.getMe(mockUser.id)).resolves.toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatarUrl: mockUser.avatarUrl,
        role: mockUser.role,
      });
    });

    it('melempar UnauthorizedException saat user tidak ditemukan', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(authService.getMe('missing')).rejects.toThrow(UnauthorizedException);
    });
  });
});
