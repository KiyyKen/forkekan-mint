import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AiRepository } from './ai.repository';
import { AiService, RecommendationResult } from './ai.service';

describe('AiService', () => {
  let aiService: AiService;

  const aiRepository = {
    findUploadWithMedia: jest.fn(),
    findAllPresets: jest.fn(),
    findPresetById: jest.fn(),
  };

  const readyMediaFile = {
    id: 'media-1',
    width: 1080,
    height: 1920,
    duration: 15,
    fps: 30,
    bitrate: 8000,
    codec: 'h264',
    fileSize: BigInt(15_000_000),
  };

  const presets = [
    {
      id: 'p-story',
      name: 'Instagram Story',
      slug: 'instagram-story',
      targetResolution: '1080x1920',
      targetCodec: 'h264',
      targetFps: 30,
      targetBitrate: 4000,
      targetAudioBitrate: 128,
    },
    {
      id: 'p-telegram',
      name: 'Telegram',
      slug: 'telegram',
      targetResolution: '1280x720',
      targetCodec: 'h264',
      targetFps: 30,
      targetBitrate: 2500,
      targetAudioBitrate: 128,
    },
    {
      id: 'p-tiktok',
      name: 'TikTok',
      slug: 'tiktok',
      targetResolution: '1080x1920',
      targetCodec: 'h264',
      targetFps: 30,
      targetBitrate: 6000,
      targetAudioBitrate: 128,
    },
  ];

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [AiService, { provide: AiRepository, useValue: aiRepository }],
    }).compile();

    aiService = moduleRef.get(AiService);
  });

  it('mengembalikan rekomendasi sesuai kontrak API dengan alternatif', async () => {
    aiRepository.findUploadWithMedia.mockResolvedValue({
      id: 'upload-1',
      mediaFile: readyMediaFile,
    });
    aiRepository.findAllPresets.mockResolvedValue(presets);

    const result = (await aiService.recommend('upload-1')) as RecommendationResult;

    expect(result.recommendedPreset).toHaveProperty('id');
    expect(result.recommendedPreset).toHaveProperty('name');
    expect(typeof result.compatibilityScore).toBe('number');
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
    expect(result.alternatives).toHaveLength(2);
    // Video vertikal 9:16 → preset vertikal harus menang atas Telegram (16:9).
    expect(['p-story', 'p-tiktok']).toContain(result.recommendedPreset.id);
  });

  it('melempar NotFoundException bila upload tidak ada', async () => {
    aiRepository.findUploadWithMedia.mockResolvedValue(null);

    await expect(aiService.recommend('missing')).rejects.toThrow(NotFoundException);
  });

  it('melempar BadRequestException bila metadata belum siap', async () => {
    aiRepository.findUploadWithMedia.mockResolvedValue({
      id: 'upload-1',
      mediaFile: { ...readyMediaFile, width: 0, height: 0 },
    });

    await expect(aiService.recommend('upload-1')).rejects.toThrow(BadRequestException);
  });

  it('melempar BadRequestException bila upload tanpa media file', async () => {
    aiRepository.findUploadWithMedia.mockResolvedValue({ id: 'upload-1', mediaFile: null });

    await expect(aiService.recommend('upload-1')).rejects.toThrow(BadRequestException);
  });

  describe('mode AI Fine-Tune (presetId disertakan)', () => {
    const whatsappStoryProfile = {
      id: 'p-wa',
      name: 'WhatsApp Story',
      slug: 'whatsapp-story',
      targetResolution: '720x1280',
      targetCodec: 'h264',
      targetFps: 30,
      targetBitrate: 2000,
      targetAudioBitrate: 128,
      crf: 23,
      bitrateStrategy: 'CRF',
    };

    it('mengembalikan saran tuning untuk preset yang sudah dipilih, bukan ranking', async () => {
      aiRepository.findUploadWithMedia.mockResolvedValue({
        id: 'upload-1',
        mediaFile: { ...readyMediaFile, fps: 24 },
      });
      aiRepository.findPresetById.mockResolvedValue(whatsappStoryProfile);

      const result = await aiService.recommend('upload-1', 'p-wa');

      expect(result).toHaveProperty('presetId', 'p-wa');
      expect(result).not.toHaveProperty('recommendedPreset');
      expect(result).not.toHaveProperty('alternatives');
      expect(aiRepository.findAllPresets).not.toHaveBeenCalled();
    });

    it('melempar NotFoundException bila preset yang diminta tidak ada', async () => {
      aiRepository.findUploadWithMedia.mockResolvedValue({
        id: 'upload-1',
        mediaFile: readyMediaFile,
      });
      aiRepository.findPresetById.mockResolvedValue(null);

      await expect(aiService.recommend('upload-1', 'missing-preset')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
