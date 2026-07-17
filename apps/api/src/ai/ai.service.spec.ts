import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';

describe('AiService', () => {
  let aiService: AiService;

  const aiRepository = {
    findUploadWithMedia: jest.fn(),
    findAllPresets: jest.fn(),
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

    const result = await aiService.recommend('upload-1');

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
});
