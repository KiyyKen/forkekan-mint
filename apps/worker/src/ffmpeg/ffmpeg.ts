import { spawn } from 'node:child_process';

/**
 * Encoding video dengan FFmpeg sesuai Platform Profile (docs/08: PlatformPreset
 * — targetResolution/targetCodec/targetFps/targetBitrate/targetAudioCodec/
 * targetAudioBitrate/crf/bitrateStrategy/pixelFormat/container/videoPreset/
 * optimizationFlags/audioChannels/audioSampleRate/scalingMode). AI Fine-Tune
 * hanya boleh mengoverride crf/bitrate/fps/scale lewat parameter `tuning`,
 * tidak pernah menggantikan profil itu sendiri.
 */
export interface EncodePreset {
  targetResolution: string;
  targetCodec: string;
  targetFps: number;
  targetBitrate: number;
  targetAudioCodec: string;
  targetAudioBitrate: number;
  crf: number | null;
  bitrateStrategy: 'CBR' | 'CRF';
  pixelFormat: string;
  container: string;
  videoPreset: string;
  optimizationFlags: string[];
  audioChannels: number;
  audioSampleRate: number;
  /** "pad" (letterbox, default) atau "crop" (scale-to-fill lalu crop kelebihan). */
  scalingMode: string;
}

/** Override opsional AI Fine-Tune — hanya 4 parameter ini yang boleh disentuh. */
export interface AiTuning {
  crf?: number;
  bitrate?: number;
  fps?: number;
  scale?: string;
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

/** Encoder yang mendukung flag `-preset` (speed-vs-quality x264/x265). */
const PRESET_FLAG_ENCODERS = new Set(['libx264', 'libx265']);

/** CRF fallback bila tuning memaksa mode CRF tapi preset tidak punya baseline CRF sendiri. */
const DEFAULT_CRF = 23;

const MICROSECONDS_PER_SECOND = 1_000_000;
const MAX_RUNNING_PERCENT = 99;

export function parseResolution(resolution: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/.exec(resolution);
  if (!match) {
    throw new FfmpegError(`Target resolution tidak valid: "${resolution}"`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function buildScaleFilter(width: number, height: number, fps: number, scalingMode: string): string {
  if (scalingMode === 'crop') {
    return (
      `scale=${width}:${height}:force_original_aspect_ratio=increase:force_divisible_by=2,` +
      `crop=${width}:${height},` +
      `fps=${fps}`
    );
  }

  return (
    `scale=${width}:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,` +
    `fps=${fps}`
  );
}

/**
 * Menyusun argumen FFmpeg dari Platform Profile, dengan override opsional
 * AI Fine-Tune (`tuning`) untuk crf/bitrate/fps/scale saja. Kehadiran
 * `tuning.crf` selalu memaksa mode CRF untuk job ini, walau profil
 * defaultnya CBR — saran eksplisit AI menang untuk job tersebut.
 */
export function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  preset: EncodePreset,
  tuning?: AiTuning | null,
): string[] {
  const { width, height } = parseResolution(tuning?.scale ?? preset.targetResolution);
  const fps = tuning?.fps ?? preset.targetFps;

  const videoEncoder = VIDEO_ENCODERS[preset.targetCodec];
  if (!videoEncoder) {
    throw new FfmpegError(`Codec video tidak didukung: "${preset.targetCodec}"`);
  }

  const audioEncoder = AUDIO_ENCODERS[preset.targetAudioCodec];
  if (!audioEncoder) {
    throw new FfmpegError(`Codec audio tidak didukung: "${preset.targetAudioCodec}"`);
  }

  const scaleFilter = buildScaleFilter(width, height, fps, preset.scalingMode);

  const useCrf = tuning?.crf !== undefined || preset.bitrateStrategy === 'CRF';
  const videoRateArgs = useCrf
    ? buildCrfArgs(tuning?.crf ?? preset.crf ?? DEFAULT_CRF, preset.videoPreset, videoEncoder)
    : ['-b:v', `${tuning?.bitrate ?? preset.targetBitrate}k`];

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
    ...videoRateArgs,
    '-pix_fmt',
    preset.pixelFormat,
    '-c:a',
    audioEncoder,
    '-b:a',
    `${preset.targetAudioBitrate}k`,
    '-ac',
    `${preset.audioChannels}`,
    '-ar',
    `${preset.audioSampleRate}`,
    ...preset.optimizationFlags,
    '-progress',
    'pipe:1',
    outputPath,
  ];
}

function buildCrfArgs(crf: number, videoPreset: string, videoEncoder: string): string[] {
  const args = ['-crf', `${crf}`];

  if (PRESET_FLAG_ENCODERS.has(videoEncoder)) {
    args.push('-preset', videoPreset);
  } else if (videoEncoder === 'libvpx-vp9') {
    // libvpx-vp9 constant-quality mode membutuhkan -b:v 0 berdampingan dengan -crf.
    args.push('-b:v', '0');
  }

  return args;
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
  tuning?: AiTuning | null,
): Promise<void> {
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const args = buildFfmpegArgs(inputPath, outputPath, preset, tuning);

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
