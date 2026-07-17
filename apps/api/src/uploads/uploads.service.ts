import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

import { UploadsRepository, UploadWithMediaFile } from './uploads.repository';

export interface UploadRequestContext {
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateUploadResult {
  uploadId: string;
  status: string;
}

export interface UploadDetailResult {
  id: string;
  status: string;
  mediaFileId: string | null;
  createdAt: Date;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly uploadsRepository: UploadsRepository) {}

  /**
   * Mencatat file yang sudah tersimpan di disk (via Multer) ke database.
   * Response mengikuti docs/07 (POST /uploads).
   */
  async createUpload(
    file: Express.Multer.File | undefined,
    context: UploadRequestContext,
  ): Promise<CreateUploadResult> {
    if (!file) {
      throw new BadRequestException('File video wajib diunggah pada field "video"');
    }

    try {
      const upload = await this.uploadsRepository.createUploadedVideo({
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        bucket: path.basename(file.destination),
        objectKey: file.filename,
      });

      return {
        uploadId: upload.id,
        status: this.toApiStatus(upload.status),
      };
    } catch (error) {
      // File yatim tanpa record database tidak boleh tertinggal.
      await unlink(file.path).catch((cleanupError: Error) => {
        this.logger.error(`Gagal menghapus file yatim ${file.path}: ${cleanupError.message}`);
      });
      throw error;
    }
  }

  /**
   * Detail upload (GET /uploads/{id}).
   */
  async getUpload(id: string): Promise<UploadDetailResult> {
    const upload = await this.uploadsRepository.findById(id);

    if (!upload) {
      throw new NotFoundException('Upload tidak ditemukan');
    }

    return this.toDetail(upload);
  }

  private toDetail(upload: UploadWithMediaFile): UploadDetailResult {
    return {
      id: upload.id,
      status: this.toApiStatus(upload.status),
      mediaFileId: upload.mediaFile?.id ?? null,
      createdAt: upload.createdAt,
    };
  }

  /** Kontrak API memakai status lowercase ("uploaded"), enum Prisma uppercase. */
  private toApiStatus(status: string): string {
    return status.toLowerCase();
  }
}
