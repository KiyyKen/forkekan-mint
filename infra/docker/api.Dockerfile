# Forkekan-mint API — Dockerfile (multi-stage)
# Build context: repository root
#
#   Production (Coolify / docker-compose.prod.yml):
#     docker build -f infra/docker/api.Dockerfile --target production .
#
#   Development (default target — dipakai infra/compose/docker-compose.dev.yml):
#     docker build -f infra/docker/api.Dockerfile .

FROM node:24-alpine AS base

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# ---------------------------------------------------------------------------
# production
# ---------------------------------------------------------------------------
FROM base AS production

RUN pnpm install --frozen-lockfile --filter @forkekan/api...

COPY apps/api/ apps/api/

RUN pnpm --filter @forkekan/api db:generate \
  && pnpm --filter @forkekan/api build

ENV NODE_ENV=production

EXPOSE 4000

# docs/11-deployment.md — Health Check: GET /api/v1/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --spider -q http://localhost:4000/api/v1/health || exit 1

CMD ["pnpm", "--filter", "@forkekan/api", "start:prod"]

# ---------------------------------------------------------------------------
# development (default target — perilaku sebelumnya, jangan diubah)
# ---------------------------------------------------------------------------
FROM base AS development

RUN pnpm install --frozen-lockfile --filter @forkekan/api...

COPY apps/api/ apps/api/

RUN pnpm --filter @forkekan/api db:generate

EXPOSE 4000

CMD ["pnpm", "--filter", "@forkekan/api", "dev"]
