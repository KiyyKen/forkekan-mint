import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { DownloadsRepository } from './downloads.repository';
import { DownloadsService } from './downloads.service';

describe('DownloadsService', () => {
  let downloadsService: DownloadsService;

  const downloadsRepository = {
    findResultById: jest.fn(),
    recordDownload: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const result = { id: 'result-1', outputFilename: 'out.mp4' };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DownloadsService,
        { provide: DownloadsRepository, useValue: downloadsRepository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: (_key: string, fallback: string) => fallback },
        },
      ],
    }).compile();

    downloadsService = moduleRef.get(DownloadsService);
  });

  describe('createSignedDownload', () => {
    it('menerbitkan signed URL dengan expiresIn 300 sesuai kontrak API', async () => {
      downloadsRepository.findResultById.mockResolvedValue(result);
      jwtService.signAsync.mockResolvedValue('signed-token');

      await expect(downloadsService.createSignedDownload('result-1', null)).resolves.toEqual({
        downloadUrl: 'http://localhost:4000/api/v1/downloads/result-1/file?token=signed-token',
        expiresIn: 300,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'result-1', purpose: 'download' },
        { expiresIn: 300 },
      );
      expect(downloadsRepository.recordDownload).not.toHaveBeenCalled();
    });

    it('mencatat riwayat download untuk user login', async () => {
      downloadsRepository.findResultById.mockResolvedValue(result);
      downloadsRepository.recordDownload.mockResolvedValue({});
      jwtService.signAsync.mockResolvedValue('signed-token');

      await downloadsService.createSignedDownload('result-1', 'user-1');

      expect(downloadsRepository.recordDownload).toHaveBeenCalledWith('user-1', 'result-1');
    });

    it('melempar NotFoundException bila hasil tidak ada', async () => {
      downloadsRepository.findResultById.mockResolvedValue(null);

      await expect(downloadsService.createSignedDownload('missing', null)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('streamResultFile', () => {
    it('menolak request tanpa token', async () => {
      await expect(downloadsService.streamResultFile('result-1', undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('menolak token yang tidak valid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(downloadsService.streamResultFile('result-1', 'rusak')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('menolak token milik hasil lain atau tanpa purpose download', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'result-2', purpose: 'download' });

      await expect(downloadsService.streamResultFile('result-1', 'token')).rejects.toThrow(
        UnauthorizedException,
      );

      jwtService.verifyAsync.mockResolvedValue({ sub: 'result-1', purpose: 'session' });

      await expect(downloadsService.streamResultFile('result-1', 'token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
