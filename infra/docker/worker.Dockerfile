# Forkekan-mint Worker — Dockerfile (multi-stage)
# Build context: repository root
#
#   Production (Coolify / docker-compose.prod.yml):
#     docker build -f infra/docker/worker.Dockerfile --target production .
#
#   Development (default target — dipakai infra/compose/docker-compose.dev.yml):
#     docker build -f infra/docker/worker.Dockerfile .

FROM node:24-alpine AS base

WORKDIR /app

RUN apk add --no-cache ffmpeg \
  && npm install -g pnpm@10

# ---------------------------------------------------------------------------
# production
#
# Prisma Client adalah dependency worker (apps/worker/package.json), tetapi
# `prisma generate` membutuhkan schema yang hanya ada di apps/api/prisma.
# Install workspace penuh (bukan --filter worker) meniru alur `pnpm db:generate`
# yang sudah terverifikasi di development, agar Prisma Client ter-generate
# secara konsisten sebelum worker dibangun.
# ---------------------------------------------------------------------------
FROM base AS production

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile

COPY apps/api/prisma/ apps/api/prisma/
COPY apps/worker/ apps/worker/

RUN pnpm --filter @forkekan/api db:generate \
  && pnpm --filter @forkekan/worker build

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@forkekan/worker", "start"]

# ---------------------------------------------------------------------------
# development (default target — perilaku sebelumnya, jangan diubah)
# ---------------------------------------------------------------------------
FROM base AS development

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/worker/package.json apps/worker/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile --filter @forkekan/worker...

COPY apps/worker/ apps/worker/

CMD ["pnpm", "--filter", "@forkekan/worker", "dev"]
