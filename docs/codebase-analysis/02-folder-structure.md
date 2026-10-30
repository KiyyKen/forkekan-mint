# 02 — Folder Structure

## `apps/api/` — NestJS backend

### `src/<feature-module>/` pattern

Every feature module follows the same four-file shape: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`, plus a `dto/` folder. This is consistent across all 10 modules with no exceptions.

| Folder | Purpose | Main files | Depends on |
|---|---|---|---|
| `src/auth/` | Google OAuth login, JWT issuing/verification, route guards | `auth.service.ts`, `google-auth.service.ts`, `auth.controller.ts`, `guards/jwt-auth.guard.ts`, `guards/optional-jwt-auth.guard.ts`, `guards/roles.guard.ts`, `decorators/roles.decorator.ts`, `decorators/current-user.decorator.ts` | `users` module, `@nestjs/jwt`, `google-auth-library` |
| `src/users/` | User upsert-on-login, lookup by id | `users.service.ts`, `users.repository.ts` | Prisma |
| `src/uploads/` | Multer-backed file intake, kicks off metadata extraction | `uploads.controller.ts`, `uploads.service.ts`, `uploads.repository.ts`, `metadata-queue.service.ts`, `uploads.constants.ts` (validation rules shared conceptually with the frontend's copy) | `auth` (optional guard), `common/queue` |
| `src/processing/` | Creates encode jobs, reports status/result | `processing.controller.ts`, `processing.service.ts`, `processing.repository.ts`, `dto/create-processing.dto.ts`, `dto/ai-tuning.dto.ts` | `common/queue`, `downloads` (for signed result URL) |
| `src/presets/` | Read-only list of Platform Profiles | `presets.controller.ts`, `presets.service.ts`, `presets.repository.ts` | Prisma only |
| `src/ai/` | Deterministic recommendation/fine-tune engine | `ai.controller.ts`, `ai.service.ts`, `ai.repository.ts`, `recommendation.engine.ts` (pure functions, no NestJS decorators) | Prisma only |
| `src/downloads/` | Signed URL issuing + file streaming | `downloads.controller.ts`, `downloads.service.ts`, `downloads.repository.ts` | `@nestjs/jwt` (separate short-lived token, not the session JWT) |
| `src/history/` | Per-user job history, search/filter/delete | `history.controller.ts`, `history.service.ts`, `history.repository.ts`, `dto/history-query.dto.ts` | `auth` (required guard) |
| `src/admin/` | Cross-user dashboards, role-gated | `admin.controller.ts`, `admin.service.ts`, `admin.repository.ts`, `dto/admin-jobs-query.dto.ts`, `dto/admin-users-query.dto.ts` | `auth` (Jwt + Roles guard) |
| `src/health/` | Liveness check | `health.service.ts` | none |

### Cross-cutting folders

| Folder | Purpose | Main files |
|---|---|---|
| `src/common/queue/` | Single BullMQ producer wrapper shared by `uploads` and `processing` | `video-processing-queue.service.ts`, `queue.constants.ts`, `queue.module.ts` |
| `src/common/utils/` | Small pure helpers | `human-file-size.ts` |
| `src/common/constants/` | Shared enums-as-constants | `job-status.constants.ts` |
| `src/common/middleware/` | Express middleware registered globally | `request-logger.middleware.ts` |
| `src/database/` | Prisma client lifecycle | `prisma.service.ts`, `prisma.module.ts` |
| `src/config/` | Fail-fast env validation | `env.validation.ts` |
| `prisma/` | Schema, migrations, seed | `schema.prisma`, `migrations/`, `seed.ts` |

`app.module.ts` wires all feature modules together and applies `ThrottlerGuard` globally plus `RequestLoggerMiddleware` on every route ([apps/api/src/app.module.ts](../../apps/api/src/app.module.ts)).

## `apps/worker/` — plain Node.js BullMQ consumer

No NestJS here — a flat, minimal structure.

| Folder/file | Purpose | Main files |
|---|---|---|
| `src/main.ts` | Process entrypoint: Redis connection, BullMQ `Worker`, job-name switch, graceful shutdown | — |
| `src/jobs/` | Job name constants + payload type contracts (duplicated from `apps/api`, not shared via a package) | `job-names.ts`, `queue-names.ts` |
| `src/processors/` | One function per job type, each does DB read → do work → DB write | `extract-metadata.processor.ts`, `process-video.processor.ts` |
| `src/ffmpeg/` | ffprobe/ffmpeg process-spawning + pure argument-building/parsing logic (the latter is what's unit-tested) | `ffprobe.ts`, `ffmpeg.ts`, `ffprobe.test.ts`, `ffmpeg.test.ts` |
| `src/services/` | Worker-local Prisma client singleton, processing-log writer | `prisma.ts`, `processing-log.ts` |

The worker has **no HTTP server, no UI, no API** — it only reads/writes the shared PostgreSQL database and shared local disk. This matches the `CLAUDE.md` "Worker Rules" constraint (queue processing / FFmpeg / metadata / AI processing only).

## `apps/web/` — React SPA

| Folder | Purpose | Main files | Depends on |
|---|---|---|---|
| `src/pages/` | Route-level components, one per `App.tsx` route | `landing-page.tsx`, `upload-page.tsx`, `login-page.tsx`, `dashboard-page.tsx`, `history-page.tsx`, `admin/admin-*-page.tsx` | `components/`, `hooks/` |
| `src/components/` | Reusable, feature-level UI (not full pages) | `optimize-panel.tsx` (step orchestrator), `platform-picker.tsx`, `ai-fine-tune-toggle.tsx`, `upload-dropzone.tsx`, `processing-stepper.tsx`, `optimization-result.tsx`, `app-header.tsx`, `theme-toggle.tsx`, `history-detail-dialog.tsx`, `confirm-delete-dialog.tsx`, `google-sign-in-button.tsx`, `protected-route.tsx`, `admin-route.tsx`, `landing/*` | `components/ui/`, `hooks/` |
| `src/components/ui/` | Design-system primitives (shadcn-style) | `button.tsx`, `dialog.tsx`, `progress.tsx`, `badge.tsx`, `status-badge.tsx`, `avatar.tsx`, `stat-card.tsx` | `utils/cn.ts` |
| `src/hooks/` | TanStack Query wrappers + small state machines | `use-upload.ts`, `use-presets.ts`, `use-processing.ts`, `use-ai-fine-tune.ts`, `use-history.ts`, `use-admin.ts`, `use-auth.ts`, `use-theme.ts` | `services/` |
| `src/services/` | Thin fetch wrappers, one per API resource | `api.ts` (shared `apiRequest`/`ApiError`), `upload-service.ts` (raw `XMLHttpRequest` for progress events), `processing-service.ts`, `recommendation-service.ts`, `preset-service.ts`, `history-service.ts`, `admin-service.ts`, `auth-service.ts` | `stores/auth-store.ts` |
| `src/types/` | Response/request TypeScript shapes, one file per resource | `processing.ts`, `recommendation.ts`, `preset.ts`, `history.ts`, `admin.ts`, `auth.ts` | — |
| `src/stores/` | Zustand + `persist` global client state | `auth-store.ts` (JWT + user in `localStorage`), `theme-store.ts` (light/dark/system preference) | — |
| `src/layouts/` | Route-group shells | `admin-layout.tsx` | — |
| `src/utils/` | Pure helpers | `cn.ts`, `validate-video-file.ts`, `format-file-size.ts`, `format-date.ts` | — |

`App.tsx` is the single router root; it calls `useTheme()` once so `.dark` on `<html>` is applied before any page mounts (including `login-page.tsx`, which has no `AppHeader`).

## `packages/` — shared workspace packages

| Folder | Purpose | Status |
|---|---|---|
| `packages/shared/` | `APP_NAME`, `APP_TAGLINE` string constants | Used (imported by web) |
| `packages/types/` | Meant to hold shared TS types (`User`, `Video`, `ProcessingJob`, `PlatformPreset`) per its own doc-comment | **Empty** — `export {}` only. Every type is currently redefined independently in `apps/api` (Prisma-generated) and `apps/web/src/types/*` by hand, with no compiler-enforced link between them |
| `packages/ui/` | Meant to hold shared UI components | Placeholder, not consumed — `apps/web/src/components/ui/*` are local, not imported from this package |
| `packages/config/` | Placeholder | Not consumed |
| `packages/tsconfig/` | Shared `tsconfig` bases | Used (`extends` in each app's `tsconfig.json`) |
| `packages/eslint/` | Shared eslint flat config | Used (`@forkekan/eslint-config`) |

## `docs/` — the blueprint

Numbered product/architecture spec documents (`01-product-overview.md` through `12-testing-strategy.md`) that `CLAUDE.md` designates as the source of truth the implementation must follow. This `docs/codebase-analysis/` folder (this document included) is a separate, code-derived companion — it documents what the code *actually does*, and calls out where that diverges from the blueprint (see [10-quality-review.md](./10-quality-review.md)).

## Storage folders (runtime, not checked in)

`storage/uploads/` and `storage/outputs/` (relative to `apps/api`'s working directory by default, overridable via `UPLOAD_DIR`/`OUTPUT_DIR` env vars) hold the actual video bytes. Filenames are random UUIDs with the original/target extension — see [apps/api/src/uploads/uploads.module.ts](../../apps/api/src/uploads/uploads.module.ts#L41-L47) for upload naming and [apps/worker/src/processors/process-video.processor.ts](../../apps/worker/src/processors/process-video.processor.ts#L58) for output naming. Both `apps/api` and `apps/worker` must resolve these to the *same absolute path* for the pipeline to work — currently guaranteed only by convention (both default to the same relative string, both processes are expected to run with `apps/api` as the working directory), not by a shared config value.
