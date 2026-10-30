import { describe, expect, it } from 'vitest';

import {
  buildFfmpegArgs,
  FfmpegError,
  parseProgressPercent,
  parseResolution,
  type EncodePreset,
} from './ffmpeg';

const cbrPreset: EncodePreset = {
  targetResolution: '720x1280',
  targetCodec: 'h264',
  targetFps: 30,
  targetBitrate: 2000,
  targetAudioCodec: 'aac',
  targetAudioBitrate: 128,
  crf: null,
  bitrateStrategy: 'CBR',
  pixelFormat: 'yuv420p',
  container: 'mp4',
  videoPreset: 'veryfast',
  optimizationFlags: ['-movflags', '+faststart'],
  audioChannels: 2,
  audioSampleRate: 44100,
  scalingMode: 'pad',
};

const crfPreset: EncodePreset = {
  ...cbrPreset,
  crf: 23,
  bitrateStrategy: 'CRF',
  videoPreset: 'slow',
};

describe('parseResolution', () => {
  it('mem-parse resolusi WxH', () => {
    expect(parseResolution('1080x1920')).toEqual({ width: 1080, height: 1920 });
  });

  it('melempar FfmpegError untuk format tidak valid', () => {
    expect(() => parseResolution('1080p')).toThrow(FfmpegError);
  });
});

describe('buildFfmpegArgs — mode CBR (default)', () => {
  it('menyusun argumen resize, fps, codec, dan bitrate sesuai preset', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', cbrPreset);

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
    expect(args[args.indexOf('-pix_fmt') + 1]).toBe('yuv420p');
    expect(args[args.indexOf('-ac') + 1]).toBe('2');
    expect(args[args.indexOf('-ar') + 1]).toBe('44100');
    expect(args).toContain('-movflags');
    expect(args).toContain('+faststart');
    expect(args).toContain('-progress');
    expect(args).not.toContain('-crf');
  });

  it('melempar FfmpegError untuk codec video yang tidak didukung', () => {
    expect(() =>
      buildFfmpegArgs('in.mp4', 'out.mp4', { ...cbrPreset, targetCodec: 'av2' }),
    ).toThrow(FfmpegError);
  });

  it('melempar FfmpegError untuk codec audio yang tidak didukung', () => {
    expect(() =>
      buildFfmpegArgs('in.mp4', 'out.mp4', { ...cbrPreset, targetAudioCodec: 'flac9' }),
    ).toThrow(FfmpegError);
  });
});

describe('buildFfmpegArgs — mode CRF (Platform Profile)', () => {
  it('memakai -crf dan -preset, bukan -b:v, saat bitrateStrategy = CRF', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', crfPreset);

    expect(args[args.indexOf('-crf') + 1]).toBe('23');
    expect(args[args.indexOf('-preset') + 1]).toBe('slow');
    expect(args).not.toContain('-b:v');
  });

  it('menambahkan -b:v 0 untuk encoder vp9 pada mode CRF', () => {
    const vp9Preset: EncodePreset = { ...crfPreset, targetCodec: 'vp9' };
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', vp9Preset);

    expect(args[args.indexOf('-crf') + 1]).toBe('23');
    expect(args[args.indexOf('-b:v') + 1]).toBe('0');
    expect(args).not.toContain('-preset');
  });
});

describe('buildFfmpegArgs — scalingMode crop', () => {
  it('memakai scale increase + crop, bukan pad', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', { ...cbrPreset, scalingMode: 'crop' });

    const filter = args[args.indexOf('-vf') + 1];
    expect(filter).toContain('scale=720:1280:force_original_aspect_ratio=increase');
    expect(filter).toContain('crop=720:1280');
    expect(filter).not.toContain('pad=');
  });
});

describe('buildFfmpegArgs — AI Fine-Tune override', () => {
  it('memakai fps/scale dari tuning saat disediakan', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', cbrPreset, { fps: 24, scale: '480x854' });

    const filter = args[args.indexOf('-vf') + 1];
    expect(filter).toContain('scale=480:854');
    expect(filter).toContain('fps=24');
  });

  it('memakai bitrate dari tuning saat preset tetap CBR', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', cbrPreset, { bitrate: 1500 });

    expect(args[args.indexOf('-b:v') + 1]).toBe('1500k');
    expect(args).not.toContain('-crf');
  });

  it('tuning.crf memaksa mode CRF walau profil defaultnya CBR', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', cbrPreset, { crf: 20 });

    expect(args[args.indexOf('-crf') + 1]).toBe('20');
    expect(args[args.indexOf('-preset') + 1]).toBe('veryfast');
    expect(args).not.toContain('-b:v');
  });

  it('tuning.crf tetap dipakai walau preset.crf null (fallback tidak dipakai)', () => {
    const args = buildFfmpegArgs('in.mp4', 'out.mp4', { ...cbrPreset, crf: null }, { crf: 27 });

    expect(args[args.indexOf('-crf') + 1]).toBe('27');
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
