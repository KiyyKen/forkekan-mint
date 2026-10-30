-- CreateEnum
CREATE TYPE "BitrateStrategy" AS ENUM ('CBR', 'CRF');

-- AlterTable
ALTER TABLE "PlatformPreset" ADD COLUMN     "audioChannels" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "audioSampleRate" INTEGER NOT NULL DEFAULT 44100,
ADD COLUMN     "bitrateStrategy" "BitrateStrategy" NOT NULL DEFAULT 'CBR',
ADD COLUMN     "container" TEXT NOT NULL DEFAULT 'mp4',
ADD COLUMN     "crf" INTEGER,
ADD COLUMN     "optimizationFlags" TEXT[] DEFAULT ARRAY['-movflags', '+faststart']::TEXT[],
ADD COLUMN     "pixelFormat" TEXT NOT NULL DEFAULT 'yuv420p',
ADD COLUMN     "scalingMode" TEXT NOT NULL DEFAULT 'pad',
ADD COLUMN     "videoPreset" TEXT NOT NULL DEFAULT 'veryfast';

-- AlterTable
ALTER TABLE "ProcessingJob" ADD COLUMN     "aiTuning" JSONB;
