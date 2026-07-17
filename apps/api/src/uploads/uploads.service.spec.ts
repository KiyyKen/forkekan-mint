import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UploadStatus } from '@prisma/client';

import { UploadsRepository, UploadWithMediaFile } from './uploads.repository';
import { UploadsService, UploadRequestContext } from './uploads.service';

jest.mock('node:fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

import { unlink } from 'node:fs/promises';

describe('UploadsService', () => {
  let uploadsService: UploadsService;

  const uploadsRepository = {
    createUploadedVideo: jest.fn(),
    findById: jest.fn(),
  };

  const context: UploadRequestContext = {
    userId: 'user-1',
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
  };

  const file = {
    originalname: 'video asli.mp4',
    filename: 'abc123.mp4',
    mimetype: 'video/mp4',
    size: 1024,
    destination: 'C:\\storage\\uploads',
    path: 'C:\\storage\\uploads\\abc123.mp4',
  } as Express.Multer.File;

  const storedUpload: UploadWithMediaFile = {
    id: 'upload-1',
    userId: 'user-1',
    status: UploadStatus.UPLOADED,
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    createdAt: new Date('2026-07-17T00:00:00Z'),
    updatedAt: new Date('2026-07-17T00:00:00Z'),
    mediaFile: { id: 'media-1' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [UploadsService, { provide: UploadsRepository, useValue: uploadsRepository }],
    }).compile();

    uploadsService = moduleRef.get(UploadsService);
  });

  describe('createUpload', () => {
    it('menyimpan metadata dan mengembalikan response sesuai kontrak API', async () => {
      uploadsRepository.createUploadedVideo.mockResolvedValue(storedUpload);

      await expect(uploadsService.createUpload(file, context)).resolves.toEqual({
        uploadId: 'upload-1',
        status: 'uploaded',
      });

      expect(uploadsRepository.createUploadedVideo).toHaveBeenCalledWith({
        userId: 'user-1',
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
        originalFilename: 'video asli.mp4',
        storedFilename: 'abc123.mp4',
        mimeType: 'video/mp4',
        fileSize: BigInt(1024),
        bucket: 'uploads',
        objectKey: 'abc123.mp4',
      });
    });

    it('menolak request tanpa file', async () => {
      await expect(uploadsService.createUpload(undefined, context)).rejects.toThrow(
        BadRequestException,
      );
      expect(uploadsRepository.createUploadedVideo).not.toHaveBeenCalled();
    });

    it('menghapus file dari disk bila penyimpanan database gagal', async () => {
      uploadsRepository.createUploadedVideo.mockRejectedValue(new Error('db down'));

      await expect(uploadsService.createUpload(file, context)).rejects.toThrow('db down');
      expect(unlink).toHaveBeenCalledWith(file.path);
    });
  });

  describe('getUpload', () => {
    it('mengembalikan detail sesuai kontrak API', async () => {
      uploadsRepository.findById.mockResolvedValue(storedUpload);

      await expect(uploadsService.getUpload('upload-1')).resolves.toEqual({
        id: 'upload-1',
        status: 'uploaded',
        mediaFileId: 'media-1',
        createdAt: storedUpload.createdAt,
      });
    });

    it('melempar NotFoundException bila upload tidak ada', async () => {
      uploadsRepository.findById.mockResolvedValue(null);

      await expect(uploadsService.getUpload('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
