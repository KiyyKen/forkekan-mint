import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import {
  OptionalJwtAuthGuard,
  OptionallyAuthenticatedRequest,
} from '../auth/guards/optional-jwt-auth.guard';
import { DownloadsService, SignedDownload } from './downloads.service';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get(':resultId')
  @UseGuards(OptionalJwtAuthGuard)
  createSignedDownload(
    @Param('resultId') resultId: string,
    @Req() request: OptionallyAuthenticatedRequest,
  ): Promise<SignedDownload> {
    return this.downloadsService.createSignedDownload(resultId, request.user?.sub ?? null);
  }

  /** Target signed URL — memverifikasi token lalu menyajikan file. */
  @Get(':resultId/file')
  async downloadFile(
    @Param('resultId') resultId: string,
    @Query('token') token: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { file, filename } = await this.downloadsService.streamResultFile(resultId, token);
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return file;
  }
}
