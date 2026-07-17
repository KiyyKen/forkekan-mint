import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  OptionalJwtAuthGuard,
  OptionallyAuthenticatedRequest,
} from '../auth/guards/optional-jwt-auth.guard';
import { UPLOAD_FIELD_NAME } from './uploads.constants';
import { CreateUploadResult, UploadDetailResult, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FileInterceptor(UPLOAD_FIELD_NAME))
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: OptionallyAuthenticatedRequest,
  ): Promise<CreateUploadResult> {
    return this.uploadsService.createUpload(file, {
      userId: request.user?.sub ?? null,
      ipAddress: request.ip ?? null,
      userAgent: request.headers['user-agent'] ?? null,
    });
  }

  @Get(':id')
  detail(@Param('id') id: string): Promise<UploadDetailResult> {
    return this.uploadsService.getUpload(id);
  }
}
