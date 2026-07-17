import {
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';

import { DEFAULT_OUTPUT_DIR } from '../processing/processing.constants';
import {
  DOWNLOAD_TOKEN_PURPOSE,
  DOWNLOAD_URL_EXPIRES_IN_SECONDS,
} from './downloads.constants';
import { DownloadsRepository } from './downloads.repository';

export interface SignedDownload {
  downloadUrl: string;
  expiresIn: number;
}

interface DownloadTokenPayload {
  sub: string;
  purpose: string;
}

const DEFAULT_API_PUBLIC_URL = 'http://localhost:4000';

@Injectable()
export class DownloadsService {
  private readonly logger = new Logger(DownloadsService.name);
  private readonly outputDir: string;
  private readonly apiPublicUrl: string;

  constructor(
    private readonly downloadsRepository: DownloadsRepository,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.outputDir = path.resolve(configService.get<string>('OUTPUT_DIR', DEFAULT_OUTPUT_DIR));
    this.apiPublicUrl = configService
      .get<string>('API_PUBLIC_URL', DEFAULT_API_PUBLIC_URL)
      .replace(/\/$/, '');
  }

  /**
   * Menerbitkan Signed URL berumur pendek (GET /downloads/{resultId}).
   * Riwayat download dicatat bila user login (docs/08: Download).
   */
  async createSignedDownload(resultId: string, userId: string | null): Promise<SignedDownload> {
    const result = await this.downloadsRepository.findResultById(resultId);
    if (!result) {
      throw new NotFoundException('Hasil optimasi tidak ditemukan');
    }

    const token = await this.jwtService.signAsync(
      { sub: resultId, purpose: DOWNLOAD_TOKEN_PURPOSE } satisfies DownloadTokenPayload,
      { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
    );

    if (userId) {
      await this.downloadsRepository.recordDownload(userId, resultId).catch((error: Error) => {
        this.logger.warn(`Gagal mencatat riwayat download: ${error.message}`);
      });
    }

    return {
      downloadUrl: `${this.apiPublicUrl}/api/v1/downloads/${resultId}/file?token=${token}`,
      expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS,
    };
  }

  /**
   * Menyajikan file hasil optimasi untuk signed URL yang valid.
   */
  async streamResultFile(
    resultId: string,
    token: string | undefined,
  ): Promise<{ file: StreamableFile; filename: string }> {
    if (!token) {
      throw new UnauthorizedException('Token download tidak ditemukan');
    }

    let payload: DownloadTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<DownloadTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Token download tidak valid atau kedaluwarsa');
    }

    if (payload.purpose !== DOWNLOAD_TOKEN_PURPOSE || payload.sub !== resultId) {
      throw new UnauthorizedException('Token download tidak valid untuk file ini');
    }

    const result = await this.downloadsRepository.findResultById(resultId);
    if (!result) {
      throw new NotFoundException('Hasil optimasi tidak ditemukan');
    }

    const filePath = path.join(this.outputDir, result.outputFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File hasil optimasi sudah tidak tersedia');
    }

    return {
      file: new StreamableFile(createReadStream(filePath), { type: 'video/mp4' }),
      filename: result.outputFilename,
    };
  }
}
