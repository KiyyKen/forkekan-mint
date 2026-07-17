# Forkekan-mint API — Development Dockerfile
# Build context: repository root
#   docker build -f infra/docker/api.Dockerfile .

FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile --filter @forkekan/api...

COPY apps/api/ apps/api/

RUN pnpm --filter @forkekan/api db:generate

EXPOSE 4000

CMD ["pnpm", "--filter", "@forkekan/api", "dev"]
