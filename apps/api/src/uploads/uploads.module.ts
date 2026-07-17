import { BadRequestException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { diskStorage } from 'multer';

import { AuthModule } from '../auth/auth.module';
import { MetadataQueueService } from './metadata-queue.service';
import { UploadsController } from './uploads.controller';
import { UploadsRepository } from './uploads.repository';
import { UploadsService } from './uploads.service';
import {
  ALLOWED_VIDEO_TYPES,
  DEFAULT_UPLOAD_DIR,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
} from './uploads.constants';

function isAllowedVideo(originalname: string, mimetype: string): boolean {
  const extension = path.extname(originalname).toLowerCase();
  const allowedMimeTypes = ALLOWED_VIDEO_TYPES.get(extension);
  return allowedMimeTypes !== undefined && allowedMimeTypes.includes(mimetype);
}

@Module({
  imports: [
    AuthModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = path.resolve(
          configService.get<string>('UPLOAD_DIR', DEFAULT_UPLOAD_DIR),
        );
        mkdirSync(uploadDir, { recursive: true });

        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (_request, file, callback) => {
              const extension = path.extname(file.originalname).toLowerCase();
              callback(null, `${randomUUID()}${extension}`);
            },
          }),
          limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
          fileFilter: (_request, file, callback) => {
            if (isAllowedVideo(file.originalname, file.mimetype)) {
              callback(null, true);
              return;
            }
            callback(
              new BadRequestException(
                `Format file tidak didukung. Gunakan MP4, MOV, AVI, MKV, atau WEBM (maks ${MAX_UPLOAD_SIZE_MB} MB).`,
              ),
              false,
            );
          },
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsRepository, MetadataQueueService],
})
export class UploadsModule {}
