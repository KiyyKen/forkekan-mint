import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import { GoogleProfile } from '../users/users.repository';

/**
 * Memverifikasi Google ID Token (Google Identity Services) dan
 * mengubahnya menjadi profil user.
 */
@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(configService: ConfigService) {
    this.clientId = configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!this.clientId) {
      throw new UnauthorizedException('Google OAuth belum dikonfigurasi');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException('Token Google tidak valid');
      }

      return {
        providerId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        avatarUrl: payload.picture ?? null,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token Google tidak valid');
    }
  }
}
