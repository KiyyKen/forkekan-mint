import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

export interface HealthStatus {
  status: 'ok';
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Status server sesuai docs/07-api-specification.md (GET /health).
   * Konektivitas database ikut diperiksa; bila database tidak dapat
   * dihubungi, server dianggap tidak sehat (503).
   */
  async check(): Promise<HealthStatus> {
    const databaseHealthy = await this.prisma.isHealthy();

    if (!databaseHealthy) {
      throw new ServiceUnavailableException('Database tidak dapat dihubungi');
    }

    return { status: 'ok' };
  }
}
