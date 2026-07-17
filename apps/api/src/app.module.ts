import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

// Feature modules lain (videos, processing, presets, downloads,
// history, admin) akan didaftarkan pada fase berikutnya.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    UploadsModule,
  ],
})
export class AppModule {}
