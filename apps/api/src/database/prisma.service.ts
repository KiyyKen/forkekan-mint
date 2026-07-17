import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client untuk seluruh aplikasi.
 *
 * Koneksi dibuka saat modul init dan ditutup saat aplikasi shutdown
 * (lihat app.enableShutdownHooks pada main.ts).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database terhubung');
    } catch (error) {
      // Jangan matikan aplikasi saat database belum tersedia (mis. Postgres
      // belum dijalankan di environment dev). Prisma akan mencoba reconnect
      // secara otomatis pada query pertama; status dapat dipantau via /health.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database tidak dapat dihubungi saat startup: ${message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Cek konektivitas database. Mengembalikan true bila query berhasil.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
