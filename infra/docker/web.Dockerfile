# Forkekan-mint Web — Development Dockerfile
# Build context: repository root
#   docker build -f infra/docker/web.Dockerfile .

FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/

RUN pnpm install --frozen-lockfile --filter @forkekan/web...

COPY apps/web/ apps/web/

EXPOSE 3000

CMD ["pnpm", "--filter", "@forkekan/web", "dev"]
