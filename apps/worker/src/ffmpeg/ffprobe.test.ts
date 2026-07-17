import { describe, expect, it } from 'vitest';

import { FfprobeError, NO_AUDIO_CODEC, parseFfprobeOutput } from './ffprobe';

function ffprobeJson(overrides: {
  streams?: unknown[];
  format?: Record<string, string>;
}): string {
  return JSON.stringify({
    streams: overrides.streams ?? [],
    format: overrides.format ?? {},
  });
}

const videoStream = {
  codec_type: 'video',
  codec_name: 'h264',
  width: 1920,
  height: 1080,
  avg_frame_rate: '30/1',
};

const audioStream = {
  codec_type: 'audio',
  codec_name: 'aac',
  bit_rate: '128000',
};

describe('parseFfprobeOutput', () => {
  it('mengekstrak seluruh field metadata dari output lengkap', () => {
    const raw = ffprobeJson({
      streams: [videoStream, audioStream],
      format: { duration: '32.5', bit_rate: '4000000' },
    });

    expect(parseFfprobeOutput(raw)).toEqual({
      width: 1920,
      height: 1080,
      duration: 32.5,
      fps: 30,
      bitrate: 4000,
      codec: 'h264',
      audioCodec: 'aac',
      audioBitrate: 128,
    });
  });

  it('menghitung fps pecahan NTSC dengan pembulatan dua desimal', () => {
    const raw = ffprobeJson({
      streams: [{ ...videoStream, avg_frame_rate: '30000/1001' }],
      format: { duration: '10' },
    });

    expect(parseFfprobeOutput(raw).fps).toBe(29.97);
  });

  it('menandai video tanpa audio dengan codec "none"', () => {
    const raw = ffprobeJson({
      streams: [videoStream],
      format: { duration: '5', bit_rate: '1000000' },
    });

    const metadata = parseFfprobeOutput(raw);
    expect(metadata.audioCodec).toBe(NO_AUDIO_CODEC);
    expect(metadata.audioBitrate).toBe(0);
  });

  it('memakai duration stream saat format tidak memilikinya', () => {
    const raw = ffprobeJson({
      streams: [{ ...videoStream, duration: '7.25' }],
    });

    expect(parseFfprobeOutput(raw).duration).toBe(7.25);
  });

  it('melempar FfprobeError bila tidak ada stream video', () => {
    const raw = ffprobeJson({ streams: [audioStream] });

    expect(() => parseFfprobeOutput(raw)).toThrow(FfprobeError);
  });

  it('melempar FfprobeError bila output bukan JSON', () => {
    expect(() => parseFfprobeOutput('bukan json')).toThrow(FfprobeError);
  });
});
