import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface OptionallyAuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Untuk endpoint dengan Authentication: Optional (docs/07).
 * Tanpa header Authorization request tetap lolos sebagai guest;
 * token yang dikirim tetapi tidak valid ditolak.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OptionallyAuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      return true;
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(
        header.slice(BEARER_PREFIX.length),
      );
    } catch {
      throw new UnauthorizedException('Token tidak valid atau kedaluwarsa');
    }

    return true;
  }
}
