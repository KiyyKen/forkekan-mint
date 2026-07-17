import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MediaFile } from '@prisma/client';

import { AiRepository } from './ai.repository';
import { rankPresets, VideoAnalysis } from './recommendation.engine';

/**
 * Response POST /ai/recommendation — docs/07-api-specification.md.
 * `alternatives` adalah tambahan aditif (kontrak inti tidak berubah).
 */
export interface RecommendationResult {
  compatibilityScore: number;
  recommendedPreset: {
    id: string;
    name: string;
  };
  reason: string;
  alternatives: {
    id: string;
    name: string;
    compatibilityScore: number;
  }[];
}

const ALTERNATIVES_COUNT = 2;
const REASON_SENTENCES = 2;

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  /**
   * Rekomendasi preset berdasarkan metadata video (deterministik, tanpa LLM).
   */
  async recommend(uploadId: string): Promise<RecommendationResult> {
    const upload = await this.aiRepository.findUploadWithMedia(uploadId);
    if (!upload) {
      throw new NotFoundException('Upload tidak ditemukan');
    }
    if (!upload.mediaFile) {
      throw new BadRequestException('Upload belum memiliki media file');
    }
    if (!this.isMetadataReady(upload.mediaFile)) {
      throw new BadRequestException('Metadata video belum tersedia, coba lagi sebentar');
    }

    const presets = await this.aiRepository.findAllPresets();
    if (presets.length === 0) {
      throw new NotFoundException('Belum ada preset yang tersedia');
    }

    const analysis: VideoAnalysis = {
      width: upload.mediaFile.width,
      height: upload.mediaFile.height,
      duration: upload.mediaFile.duration,
      fps: upload.mediaFile.fps,
      bitrate: upload.mediaFile.bitrate,
      codec: upload.mediaFile.codec,
      fileSize: Number(upload.mediaFile.fileSize),
    };

    const ranked = rankPresets(analysis, presets);
    const [best, ...rest] = ranked;

    return {
      compatibilityScore: best.score,
      recommendedPreset: {
        id: best.presetId,
        name: best.name,
      },
      reason: this.buildReason(best.reasons, best.name),
      alternatives: rest.slice(0, ALTERNATIVES_COUNT).map((candidate) => ({
        id: candidate.presetId,
        name: candidate.name,
        compatibilityScore: candidate.score,
      })),
    };
  }

  /** Metadata dianggap siap setelah worker mengisi dimensi video. */
  private isMetadataReady(mediaFile: MediaFile): boolean {
    return mediaFile.width > 0 && mediaFile.height > 0;
  }

  private buildReason(reasons: string[], presetName: string): string {
    if (reasons.length === 0) {
      return `Video sudah sangat sesuai dengan ${presetName}.`;
    }
    return `${reasons.slice(0, REASON_SENTENCES).join('. ')}.`;
  }
}
