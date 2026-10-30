import { BitrateStrategy, PrismaClient } from '@prisma/client';

/**
 * Seed data awal — acuan: docs/08-database-schema.md (Seed Strategy).
 *
 * Platform Presets: 9 preset sesuai dokumentasi. Nama, slug, dan resolusi
 * yang tercantum di docs (WhatsApp Story 720x1280, Instagram Reels 1080x1920,
 * docs/07) dipakai apa adanya; target teknis lain memakai standar encoding
 * umum tiap platform (H.264 + AAC, bitrate dalam kbps).
 *
 * Admin: docs menyebut seed "Admin", tetapi tidak mendefinisikan kredensial
 * apa pun dan login hanya via Google OAuth — user admin pertama akan
 * dipromosikan setelah fitur Authentication tersedia, bukan di-seed dengan
 * data karangan.
 */

const prisma = new PrismaClient();

interface PlatformPresetSeed {
  name: string;
  slug: string;
  description: string;
  targetResolution: string;
  targetCodec: string;
  targetFps: number;
  targetBitrate: number;
  targetAudioCodec: string;
  targetAudioBitrate: number;
  crf: number | null;
  bitrateStrategy: BitrateStrategy;
  pixelFormat: string;
  container: string;
  videoPreset: string;
  optimizationFlags: string[];
  audioChannels: number;
  audioSampleRate: number;
  scalingMode: string;
}

/** Nilai default dipakai oleh semua preset kecuali yang secara eksplisit override. */
const DEFAULT_PROFILE_FIELDS = {
  crf: null,
  bitrateStrategy: BitrateStrategy.CBR,
  pixelFormat: 'yuv420p',
  container: 'mp4',
  videoPreset: 'veryfast',
  optimizationFlags: ['-movflags', '+faststart'],
  audioChannels: 2,
  audioSampleRate: 44100,
  scalingMode: 'pad',
} as const satisfies Omit<
  PlatformPresetSeed,
  | 'name'
  | 'slug'
  | 'description'
  | 'targetResolution'
  | 'targetCodec'
  | 'targetFps'
  | 'targetBitrate'
  | 'targetAudioCodec'
  | 'targetAudioBitrate'
>;

const PLATFORM_PRESETS: PlatformPresetSeed[] = [
  {
    name: 'WhatsApp Story',
    slug: 'whatsapp-story',
    description: 'Platform utama — kualitas terbaik yang bertahan setelah kompresi ulang WhatsApp.',
    targetResolution: '720x1280',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 2000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
    // WhatsApp mengompres ulang setiap Story yang diunggah. Mode CRF menjaga
    // detail secara adaptif per-frame, memberi "bahan" lebih baik untuk
    // kompresi ulang itu dibanding target CBR tetap yang sudah dipangkas duluan.
    crf: 23,
    bitrateStrategy: BitrateStrategy.CRF,
    videoPreset: 'slow',
  },
  {
    name: 'WhatsApp Chat',
    slug: 'whatsapp-chat',
    description: 'Optimasi video untuk dikirim melalui chat WhatsApp dengan ukuran kecil.',
    targetResolution: '854x480',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 1000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 96,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'Instagram Story',
    slug: 'instagram-story',
    description: 'Optimasi video untuk Instagram Story (vertikal 9:16).',
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 4000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'Instagram Reels',
    slug: 'instagram-reels',
    description: 'Optimasi video untuk Instagram Reels (vertikal 9:16).',
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 5000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'TikTok',
    slug: 'tiktok',
    description: 'Optimasi video untuk TikTok (vertikal 9:16).',
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 6000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'Telegram',
    slug: 'telegram',
    description: 'Optimasi video untuk dikirim melalui Telegram.',
    targetResolution: '1280x720',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 2500,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'Discord',
    slug: 'discord',
    description: 'Optimasi video untuk diunggah ke Discord dengan batas ukuran file.',
    targetResolution: '1280x720',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 4000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'Facebook Story',
    slug: 'facebook-story',
    description: 'Optimasi video untuk Facebook Story (vertikal 9:16).',
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 4000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
  {
    name: 'YouTube Shorts',
    slug: 'youtube-shorts',
    description: 'Optimasi video untuk YouTube Shorts (vertikal 9:16, maks 60 detik).',
    targetResolution: '1080x1920',
    targetCodec: 'h264',
    targetFps: 30,
    targetBitrate: 8000,
    targetAudioCodec: 'aac',
    targetAudioBitrate: 128,
    ...DEFAULT_PROFILE_FIELDS,
  },
];

async function seedPlatformPresets(): Promise<void> {
  for (const preset of PLATFORM_PRESETS) {
    await prisma.platformPreset.upsert({
      where: { slug: preset.slug },
      update: preset,
      create: preset,
    });
  }

  console.log(`[seed] ${PLATFORM_PRESETS.length} platform preset tersedia.`);
}

async function main(): Promise<void> {
  console.log('[seed] Mulai seeding...');
  await seedPlatformPresets();
  console.log('[seed] Selesai.');
}

main()
  .catch((error) => {
    console.error('[seed] Gagal:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
