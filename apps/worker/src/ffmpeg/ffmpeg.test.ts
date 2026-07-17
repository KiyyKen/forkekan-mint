import { describe, expect, it } from 'vitest';

import {
  buildFfmpegArgs,
  FfmpegError,
  parseProgressPercent,
  parseResolution,
  type EncodePreset,
} from './ffmpeg';

const preset: EncodePreset = {
  targetResolution: '720x1280',
  targetCodec: 'h264',
  targetFps: 30,
  targetBitrate: 2000,
  targetAudioCodec: 'aac',
  targetAudioBitrate: 128,
};

describe('parseResolution', () => {
  it('mem-parse resolusi WxH', () => {
    expect(parseResolution('1080x1920')).toEqual({ width: 1080, height: 1920 });
  });

  it('melempar FfmpegError untuk format tidak valid', () => {
    expect(() => parseResolution('1080p')).toThrow(FfmpegError);
  });
});

describe('buildFfmpegArgs', () => {
  it('menyusun argumen resize, fps, codec, dan bitrate sesuai preset', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', preset);

    expect(args).toContain('in.mp4');
    expect(args[args.length - 1]).toBe('out.mp4');

    const filter = args[args.indexOf('-vf') + 1];
    expect(filter).toContain('scale=720:1280:force_original_aspect_ratio=decrease');
    expect(filter).toContain('pad=720:1280');
    expect(filter).toContain('fps=30');

    expect(args[args.indexOf('-c:v') + 1]).toBe('libx264');
    expect(args[args.indexOf('-b:v') + 1]).toBe('2000k');
    expect(args[args.indexOf('-c:a') + 1]).toBe('aac');
    expect(args[args.indexOf('-b:a') + 1]).toBe('128k');
    expect(args).toContain('-progress');
  });

  it('melempar FfmpegError untuk codec video yang tidak didukung', () => {
    expect(() => buildFfmpegArgs('in.mp4', 'out.mp4', { ...preset, targetCodec: 'av2' })).toThrow(
      FfmpegError,
    );
  });

  it('melempar FfmpegError untuk codec audio yang tidak didukung', () => {
    expect(() =>
      buildFfmpegArgs('in.mp4', 'out.mp4', { ...preset, targetAudioCodec: 'flac9' }),
    ).toThrow(FfmpegError);
  });
});

describe('parseProgressPercent', () => {
  it('menghitung persen dari out_time_us terhadap durasi', () => {
    // 5 detik dari 10 detik → 50%.
    expect(parseProgressPercent('out_time_us=5000000', 10)).toBe(50);
  });

  it('membatasi progress berjalan maksimal 99%', () => {
    expect(parseProgressPercent('out_time_us=99000000', 10)).toBe(99);
  });

  it('mengembalikan 100 saat progress=end', () => {
    expect(parseProgressPercent('progress=end', 10)).toBe(100);
  });

  it('mengabaikan baris non-progress', () => {
    expect(parseProgressPercent('fps=30.1', 10)).toBeNull();
  });

  it('mengabaikan out_time_us bila durasi tidak diketahui', () => {
    expect(parseProgressPercent('out_time_us=5000000', 0)).toBeNull();
  });
});
