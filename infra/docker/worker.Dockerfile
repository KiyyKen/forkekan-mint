# Forkekan-mint Worker — Development Dockerfile
# Build context: repository root
#   docker build -f infra/docker/worker.Dockerfile .

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg \
  && npm install -g pnpm@10

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/worker/package.json apps/worker/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile --filter @forkekan/worker...

COPY apps/worker/ apps/worker/

CMD ["pnpm", "--filter", "@forkekan/worker", "dev"]
