import { Injectable } from '@nestjs/common';
import { Upload, UploadStatus } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import {
  LOCAL_STORAGE_DISK,
  METADATA_PENDING_CODEC,
  METADATA_PENDING_NUMBER,
} from './uploads.constants';

export interface CreateUploadData {
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: bigint;
  bucket: string;
  objectKey: string;
}

export type UploadWithMediaFile = Upload & { mediaFile: { id: string } | null };

@Injectable()
export class UploadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mencatat satu aktivitas upload: Upload + MediaFile + StorageObject
   * dalam satu transaksi (docs/08: Upload ─ MediaFile ─ StorageObject).
   *
   * Field metadata hasil ffprobe (width, height, duration, fps, bitrate,
   * codec, audio) diisi sentinel dan akan dilengkapi oleh worker pada
   * fase Metadata Extraction.
   */
  createUploadedVideo(data: CreateUploadData): Promise<UploadWithMediaFile> {
    return this.prisma.upload.create({
      data: {
        userId: data.userId,
        status: UploadStatus.UPLOADED,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        mediaFile: {
          create: {
            originalFilename: data.originalFilename,
            storedFilename: data.storedFilename,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            width: METADATA_PENDING_NUMBER,
            height: METADATA_PENDING_NUMBER,
            duration: METADATA_PENDING_NUMBER,
            fps: METADATA_PENDING_NUMBER,
            bitrate: METADATA_PENDING_NUMBER,
            codec: METADATA_PENDING_CODEC,
            audioCodec: METADATA_PENDING_CODEC,
            audioBitrate: METADATA_PENDING_NUMBER,
            storageObject: {
              create: {
                disk: LOCAL_STORAGE_DISK,
                bucket: data.bucket,
                objectKey: data.objectKey,
                visibility: 'private',
              },
            },
          },
        },
      },
      include: { mediaFile: { select: { id: true } } },
    });
  }

  findById(id: string): Promise<UploadWithMediaFile | null> {
    return this.prisma.upload.findUnique({
      where: { id },
      include: { mediaFile: { select: { id: true } } },
    });
  }
}
