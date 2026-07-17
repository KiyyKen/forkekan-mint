import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { DownloadsModule } from './downloads/downloads.module';
import { HealthModule } from './health/health.module';
import { HistoryModule } from './history/history.module';
import { PresetsModule } from './presets/presets.module';
import { ProcessingModule } from './processing/processing.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

const DEFAULT_THROTTLE_TTL_MS = 60_000;
const DEFAULT_THROTTLE_LIMIT = 120;

// Feature modules lain (videos) akan didaftarkan pada fase berikutnya.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('RATE_LIMIT_TTL_MS', DEFAULT_THROTTLE_TTL_MS),
          limit: configService.get<number>('RATE_LIMIT_LIMIT', DEFAULT_THROTTLE_LIMIT),
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    UploadsModule,
    ProcessingModule,
    PresetsModule,
    AiModule,
    DownloadsModule,
    HistoryModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
