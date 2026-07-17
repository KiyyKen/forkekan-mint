import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Memvalidasi header `Authorization: Bearer <token>` dan menempelkan
 * payload JWT pada request sebagai `request.user`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token tidak valid atau kedaluwarsa');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      return null;
    }

    return header.slice(BEARER_PREFIX.length);
  }
}
