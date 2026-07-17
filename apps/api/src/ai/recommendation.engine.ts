/**
 * Recommendation engine deterministik — menilai kecocokan metadata video
 * (hasil ekstraksi ffprobe) terhadap setiap PlatformPreset.
 *
 * Tanpa LLM/layanan eksternal: skor dihitung dari 7 faktor berbobot,
 * input yang sama selalu menghasilkan rekomendasi yang sama.
 */

export interface VideoAnalysis {
  width: number;
  height: number;
  /** Detik. */
  duration: number;
  fps: number;
  /** kbps. */
  bitrate: number;
  codec: string;
  /** Bytes. */
  fileSize: number;
}

export interface PresetCandidate {
  id: string;
  name: string;
  slug: string;
  targetResolution: string;
  targetCodec: string;
  targetFps: number;
  targetBitrate: number;
  targetAudioBitrate: number;
}

export interface PresetScore {
  presetId: string;
  name: string;
  slug: string;
  /** 0–100. */
  score: number;
  reasons: string[];
}

/** Bobot faktor (total 100). Rasio aspek paling menentukan hasil visual. */
const WEIGHTS = {
  aspectRatio: 30,
  resolution: 20,
  bitrate: 20,
  fps: 10,
  codec: 10,
  duration: 5,
  fileSize: 5,
} as const;

/**
 * Batas durasi platform (detik) yang terdokumentasi pada deskripsi preset.
 * Preset tanpa batas dinilai netral.
 */
const DURATION_LIMITS_BY_SLUG: Record<string, number> = {
  'whatsapp-story': 30,
  'youtube-shorts': 60,
};

/** Toleransi selisih rasio aspek yang dianggap cocok sempurna. */
const ASPECT_RATIO_PERFECT_TOLERANCE = 0.02;
/** Selisih relatif rasio aspek yang membuat skor faktor menjadi 0. */
const ASPECT_RATIO_ZERO_AT = 0.7;

/** Skor codec berbeda: tetap dapat ditranscode, hanya kurang efisien. */
const CODEC_MISMATCH_SCORE = 70;

/** Skor netral saat nilai sumber tidak diketahui (metadata 0). */
const UNKNOWN_NEUTRAL_SCORE = 50;

const BITS_PER_KILOBIT = 1000;
const BITS_PER_BYTE = 8;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function parseTargetResolution(resolution: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/.exec(resolution);
  if (!match) {
    return { width: 0, height: 0 };
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

interface FactorResult {
  score: number;
  reason?: string;
}

function scoreAspectRatio(video: VideoAnalysis, target: { width: number; height: number }): FactorResult {
  if (video.width <= 0 || video.height <= 0 || target.width <= 0 || target.height <= 0) {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }

  const videoRatio = video.width / video.height;
  const targetRatio = target.width / target.height;
  const relativeDiff = Math.abs(videoRatio - targetRatio) / targetRatio;

  if (relativeDiff <= ASPECT_RATIO_PERFECT_TOLERANCE) {
    return { score: 100, reason: 'Rasio aspek video sudah sesuai target platform' };
  }

  const score = clampScore((1 - relativeDiff / ASPECT_RATIO_ZERO_AT) * 100);
  return {
    score,
    reason:
      score === 0
        ? 'Orientasi video berbeda jauh dari target sehingga butuh padding besar'
        : 'Rasio aspek sedikit berbeda, video akan diberi padding',
  };
}

function scoreResolution(video: VideoAnalysis, target: { width: number; height: number }): FactorResult {
  if (video.width <= 0 || video.height <= 0 || target.width <= 0 || target.height <= 0) {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }

  const pixelRatio = (video.width * video.height) / (target.width * target.height);
  if (pixelRatio >= 1) {
    return { score: 100 };
  }

  return {
    score: clampScore(Math.sqrt(pixelRatio) * 100),
    reason: 'Resolusi sumber di bawah target, hasil dapat kurang tajam',
  };
}

function scoreBitrate(video: VideoAnalysis, preset: PresetCandidate): FactorResult {
  if (video.bitrate <= 0) {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }

  if (video.bitrate >= preset.targetBitrate) {
    return {
      score: 100,
      reason: `Bitrate ${video.bitrate} kbps akan dioptimalkan ke ${preset.targetBitrate} kbps`,
    };
  }

  return {
    score: clampScore((video.bitrate / preset.targetBitrate) * 100),
    reason: 'Bitrate sumber lebih rendah dari target platform',
  };
}

function scoreFps(video: VideoAnalysis, preset: PresetCandidate): FactorResult {
  if (video.fps <= 0) {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }
  if (video.fps >= preset.targetFps) {
    return { score: 100 };
  }
  return {
    score: clampScore((video.fps / preset.targetFps) * 100),
    reason: 'Frame rate sumber di bawah target platform',
  };
}

function scoreCodec(video: VideoAnalysis, preset: PresetCandidate): FactorResult {
  if (!video.codec || video.codec === 'unknown') {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }
  if (video.codec === preset.targetCodec) {
    return { score: 100 };
  }
  return {
    score: CODEC_MISMATCH_SCORE,
    reason: `Codec ${video.codec} akan ditranscode ke ${preset.targetCodec}`,
  };
}

function scoreDuration(video: VideoAnalysis, preset: PresetCandidate): FactorResult {
  const limit = DURATION_LIMITS_BY_SLUG[preset.slug];
  if (!limit || video.duration <= 0 || video.duration <= limit) {
    return { score: 100 };
  }

  const overshoot = (video.duration - limit) / limit;
  return {
    score: clampScore((1 - overshoot) * 100),
    reason: `Durasi ${Math.round(video.duration)}s melebihi batas ${limit}s platform ini`,
  };
}

function scoreFileSize(video: VideoAnalysis, preset: PresetCandidate): FactorResult {
  if (video.fileSize <= 0 || video.duration <= 0) {
    return { score: UNKNOWN_NEUTRAL_SCORE };
  }

  const targetKbps = preset.targetBitrate + preset.targetAudioBitrate;
  const estimatedOutputBytes = (targetKbps * BITS_PER_KILOBIT * video.duration) / BITS_PER_BYTE;

  if (estimatedOutputBytes <= video.fileSize) {
    return { score: 100, reason: 'Ukuran file akan mengecil setelah optimasi' };
  }

  return { score: clampScore((video.fileSize / estimatedOutputBytes) * 100) };
}

/** Menilai satu preset terhadap metadata video. */
export function scorePreset(video: VideoAnalysis, preset: PresetCandidate): PresetScore {
  const target = parseTargetResolution(preset.targetResolution);

  const factors = {
    aspectRatio: scoreAspectRatio(video, target),
    resolution: scoreResolution(video, target),
    bitrate: scoreBitrate(video, preset),
    fps: scoreFps(video, preset),
    codec: scoreCodec(video, preset),
    duration: scoreDuration(video, preset),
    fileSize: scoreFileSize(video, preset),
  };

  const totalWeight = Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const weighted = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce(
    (sum, key) => sum + factors[key].score * WEIGHTS[key],
    0,
  );

  const reasons = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[])
    .map((key) => factors[key].reason)
    .filter((reason): reason is string => reason !== undefined);

  return {
    presetId: preset.id,
    name: preset.name,
    slug: preset.slug,
    score: Math.round(weighted / totalWeight),
    reasons,
  };
}

/**
 * Mengurutkan seluruh preset dari yang paling cocok.
 * Deterministik: skor sama diurutkan berdasarkan slug.
 */
export function rankPresets(video: VideoAnalysis, presets: PresetCandidate[]): PresetScore[] {
  return presets
    .map((preset) => scorePreset(video, preset))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}
