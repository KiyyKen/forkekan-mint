# Forkekan-mint Web — Dockerfile (multi-stage)
# Build context: repository root
#
#   Production (Coolify / docker-compose.prod.yml):
#     docker build -f infra/docker/web.Dockerfile --target production \
#       --build-arg VITE_API_URL=/api/v1 --build-arg VITE_GOOGLE_CLIENT_ID=... .
#     Vite menyisipkan VITE_* ke bundle saat build, sehingga nilainya harus
#     tersedia sebagai build arg (bukan hanya environment variable runtime).
#
#   Development (default target — dipakai infra/compose/docker-compose.dev.yml):
#     docker build -f infra/docker/web.Dockerfile .

FROM node:24-alpine AS base

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile --filter @forkekan/web...

COPY apps/web/ apps/web/

# ---------------------------------------------------------------------------
# build (production static bundle)
# ---------------------------------------------------------------------------
FROM base AS build

ARG VITE_API_URL=/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN pnpm --filter @forkekan/web build

# ---------------------------------------------------------------------------
# production (static bundle disajikan Nginx, port 3000 — docs/11)
# ---------------------------------------------------------------------------
FROM nginx:alpine AS production

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/web.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:3000/ || exit 1

# ---------------------------------------------------------------------------
# development (default target — perilaku sebelumnya, jangan diubah)
# ---------------------------------------------------------------------------
FROM base AS development

EXPOSE 3000

CMD ["pnpm", "--filter", "@forkekan/web", "dev"]
