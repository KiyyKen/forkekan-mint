import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';

// Feature modules (auth, users, uploads, videos, processing, presets,
// downloads, history, admin) akan didaftarkan mulai fase Authentication.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
