import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { GoogleAuthService } from './google-auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MeResult {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login via Google: verifikasi ID token, upsert user, terbitkan JWT.
   * Bentuk response mengikuti docs/07-api-specification.md (POST /auth/google).
   */
  async loginWithGoogle(idToken: string): Promise<LoginResult> {
    const profile = await this.googleAuthService.verifyIdToken(idToken);
    const user = await this.usersService.upsertGoogleUser(profile);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Profil user yang sedang login (GET /auth/me).
   */
  async getMe(userId: string): Promise<MeResult> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }
}
