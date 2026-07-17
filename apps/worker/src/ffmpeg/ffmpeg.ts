import { spawn } from 'node:child_process';

/**
 * Encoding video dengan FFmpeg sesuai target PlatformPreset
 * (docs/08: targetResolution, targetCodec, targetFps, targetBitrate,
 * targetAudioCodec, targetAudioBitrate — bitrate dalam kbps).
 */
export interface EncodePreset {
  targetResolution: string;
  targetCodec: string;
  targetFps: number;
  targetBitrate: number;
  targetAudioCodec: string;
  targetAudioBitrate: number;
}

export class FfmpegError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FfmpegError';
  }
}

/** Codec preset → encoder FFmpeg. */
const VIDEO_ENCODERS: Record<string, string> = {
  h264: 'libx264',
  h265: 'libx265',
  hevc: 'libx265',
  vp9: 'libvpx-vp9',
};

const AUDIO_ENCODERS: Record<string, string> = {
  aac: 'aac',
  opus: 'libopus',
  mp3: 'libmp3lame',
};

const MICROSECONDS_PER_SECOND = 1_000_000;
const MAX_RUNNING_PERCENT = 99;

export function parseResolution(resolution: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/.exec(resolution);
  if (!match) {
    throw new FfmpegError(`Target resolution tidak valid: "${resolution}"`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Menyusun argumen FFmpeg: resize ke resolusi target dengan aspect ratio
 * dipertahankan (pad hitam bila perlu), fps, codec, dan bitrate preset.
 */
export function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  preset: EncodePreset,
): string[] {
  const { width, height } = parseResolution(preset.targetResolution);

  const videoEncoder = VIDEO_ENCODERS[preset.targetCodec];
  if (!videoEncoder) {
    throw new FfmpegError(`Codec video tidak didukung: "${preset.targetCodec}"`);
  }

  const audioEncoder = AUDIO_ENCODERS[preset.targetAudioCodec];
  if (!audioEncoder) {
    throw new FfmpegError(`Codec audio tidak didukung: "${preset.targetAudioCodec}"`);
  }

  const scaleFilter =
    `scale=${width}:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,` +
    `fps=${preset.targetFps}`;

  return [
    '-y',
    '-v',
    'error',
    '-i',
    inputPath,
    '-vf',
    scaleFilter,
    '-c:v',
    videoEncoder,
    '-b:v',
    `${preset.targetBitrate}k`,
    '-c:a',
    audioEncoder,
    '-b:a',
    `${preset.targetAudioBitrate}k`,
    '-movflags',
    '+faststart',
    '-progress',
    'pipe:1',
    outputPath,
  ];
}

/**
 * Menghitung persen progress dari satu baris output `-progress pipe:1`.
 * Mengembalikan null bila baris bukan informasi progress yang bisa dipakai.
 */
export function parseProgressPercent(line: string, durationSeconds: number): number | null {
  const trimmed = line.trim();

  if (trimmed === 'progress=end') {
    return 100;
  }

  if (durationSeconds <= 0) {
    return null;
  }

  const match = /^out_time_us=(\d+)$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const processedSeconds = Number(match[1]) / MICROSECONDS_PER_SECOND;
  const percent = Math.floor((processedSeconds / durationSeconds) * 100);
  return Math.min(MAX_RUNNING_PERCENT, Math.max(0, percent));
}

/**
 * Menjalankan FFmpeg. Path binary dari env FFMPEG_PATH, fallback "ffmpeg".
 * onProgress dipanggil dengan persen 0–100.
 */
export function runFfmpeg(
  inputPath: string,
  outputPath: string,
  preset: EncodePreset,
  durationSeconds: number,
  onProgress: (percent: number) => void,
): Promise<void> {
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const args = buildFfmpegArgs(inputPath, outputPath, preset);

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });

    let stdoutRemainder = '';
    let stderrTail = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutRemainder += chunk.toString();
      const lines = stdoutRemainder.split('\n');
      stdoutRemainder = lines.pop() ?? '';

      for (const line of lines) {
        const percent = parseProgressPercent(line, durationSeconds);
        if (percent !== null) {
          onProgress(percent);
        }
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderrTail = (stderrTail + chunk.toString()).slice(-1000);
    });

    child.on('error', (error) => {
      reject(new FfmpegError(`Tidak dapat menjalankan ffmpeg (${ffmpegPath}): ${error.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new FfmpegError(`ffmpeg keluar dengan kode ${code}: ${stderrTail.trim()}`));
        return;
      }
      resolve();
    });
  });
}
