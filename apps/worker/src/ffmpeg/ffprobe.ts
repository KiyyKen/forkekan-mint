import { spawn } from 'node:child_process';

/**
 * Metadata video hasil ffprobe — mengisi field MediaFile
 * (docs/08-database-schema.md). Bitrate dalam kbps (selaras contoh
 * docs/07 Video Analysis), duration dalam detik.
 */
export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
  audioBitrate: number;
}

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  bit_rate?: string;
  duration?: string;
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: {
    duration?: string;
    bit_rate?: string;
  };
}

/** Codec audio untuk video tanpa stream audio. */
export const NO_AUDIO_CODEC = 'none';

const BITS_PER_KILOBIT = 1000;

const FFPROBE_ARGS = ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams'];

export class FfprobeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FfprobeError';
  }
}

/** Mengubah pecahan ffprobe ("30000/1001") menjadi angka desimal. */
function parseFrameRate(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const [numerator, denominator] = value.split('/').map(Number);

  if (!Number.isFinite(numerator)) {
    return 0;
  }
  if (denominator === undefined) {
    return numerator;
  }
  if (!Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100) / 100;
}

function parseBitrateKbps(value: string | undefined): number {
  const bps = Number(value);
  return Number.isFinite(bps) && bps > 0 ? Math.round(bps / BITS_PER_KILOBIT) : 0;
}

function parseDurationSeconds(...candidates: (string | undefined)[]): number {
  for (const candidate of candidates) {
    const seconds = Number(candidate);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.round(seconds * 100) / 100;
    }
  }
  return 0;
}

/**
 * Mem-parse output JSON ffprobe menjadi VideoMetadata.
 * Melempar FfprobeError bila file tidak memiliki stream video.
 */
export function parseFfprobeOutput(raw: string): VideoMetadata {
  let output: FfprobeOutput;
  try {
    output = JSON.parse(raw) as FfprobeOutput;
  } catch {
    throw new FfprobeError('Output ffprobe bukan JSON yang valid');
  }

  const streams = output.streams ?? [];
  const videoStream = streams.find((stream) => stream.codec_type === 'video');
  const audioStream = streams.find((stream) => stream.codec_type === 'audio');

  if (!videoStream || !videoStream.width || !videoStream.height) {
    throw new FfprobeError('File tidak memiliki stream video yang dapat dibaca');
  }

  return {
    width: videoStream.width,
    height: videoStream.height,
    duration: parseDurationSeconds(output.format?.duration, videoStream.duration),
    fps: parseFrameRate(videoStream.avg_frame_rate ?? videoStream.r_frame_rate),
    bitrate: parseBitrateKbps(output.format?.bit_rate ?? videoStream.bit_rate),
    codec: videoStream.codec_name ?? 'unknown',
    audioCodec: audioStream?.codec_name ?? NO_AUDIO_CODEC,
    audioBitrate: parseBitrateKbps(audioStream?.bit_rate),
  };
}

/**
 * Menjalankan ffprobe terhadap file video.
 * Path binary dari env FFPROBE_PATH, fallback "ffprobe" pada PATH.
 */
export function runFfprobe(filePath: string): Promise<VideoMetadata> {
  const ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';

  return new Promise((resolve, reject) => {
    const child = spawn(ffprobePath, [...FFPROBE_ARGS, filePath], { windowsHide: true });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(new FfprobeError(`Tidak dapat menjalankan ffprobe (${ffprobePath}): ${error.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new FfprobeError(`ffprobe keluar dengan kode ${code}: ${stderr.trim()}`));
        return;
      }

      try {
        resolve(parseFfprobeOutput(stdout));
      } catch (error) {
        reject(error);
      }
    });
  });
}
