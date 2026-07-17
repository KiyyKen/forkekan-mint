# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Monorepo untuk Forkekan-mint — aplikasi optimasi video agar tidak "burik" saat diunggah ke berbagai platform.

## Tech Stack

| Layer    | Teknologi                                                              |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, React Router |
| Backend  | NestJS, Prisma, PostgreSQL, JWT Authentication                          |
| Worker   | BullMQ, Redis, FFmpeg                                                   |
| Storage  | Cloudflare R2                                                           |
| Tooling  | pnpm workspace, Turborepo, ESLint, Prettier, Husky, Commitlint          |

## Struktur Workspace

```text
forkekan-mint/
├── apps/
│   ├── web/        # Frontend (React + Vite)
│   ├── api/        # Backend (NestJS + Prisma)
│   └── worker/     # Background processing (BullMQ + FFmpeg)
├── packages/
│   ├── ui/         # Shared UI components
│   ├── types/      # Shared TypeScript types
│   ├── config/     # Shared configuration
│   ├── eslint/     # Shared ESLint config
│   ├── tsconfig/   # Shared tsconfig presets
│   └── shared/     # Shared utilities (formatter, validator, constants)
├── docs/           # Dokumentasi proyek
├── infra/          # Docker, Nginx, Coolify, Compose
├── scripts/        # Automation scripts
└── .github/        # CI/CD workflows & templates
```

## Prasyarat

- Node.js `>= 20.19`
- pnpm `>= 10`
- Docker (untuk PostgreSQL & Redis lokal)
- FFmpeg (untuk worker, mulai Phase 4)

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Siapkan environment
cp .env.example .env

# 3. Jalankan PostgreSQL & Redis (opsional untuk Phase 1)
docker compose up -d

# 4. Generate Prisma Client
pnpm db:generate

# 5. Jalankan seluruh aplikasi (web + api + worker)
pnpm dev
```

| Service | URL                          |
| ------- | ---------------------------- |
| Web     | http://localhost:3000        |
| API     | http://localhost:4000/api/v1 |

## Scripts

| Perintah            | Deskripsi                                  |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | Jalankan semua app dalam mode development  |
| `pnpm build`        | Build semua app                            |
| `pnpm lint`         | Lint semua workspace                       |
| `pnpm typecheck`    | Type-check semua workspace                 |
| `pnpm test`         | Jalankan test semua workspace              |
| `pnpm format`       | Format kode dengan Prettier                |
| `pnpm db:generate`  | Generate Prisma Client                     |
| `pnpm db:migrate`   | Jalankan migrasi database (development)    |

## Dokumentasi

Seluruh blueprint proyek ada di folder [docs/](docs/), mulai dari product overview hingga testing strategy.

## Konvensi

- Commit mengikuti [Conventional Commits](https://www.conventionalcommits.org/) (divalidasi commitlint + husky).
- Folder `lowercase`, file `kebab-case`, komponen `PascalCase`.
- Gunakan absolute import (`@/...`), hindari relative import yang panjang.

## License

[MIT](LICENSE)
