# 09 — API Reference

Base path: `/api/v1` (global prefix, [main.ts:26](../../apps/api/src/main.ts#L26)). This document reflects the **actual implemented routes** — where `docs/07-api-specification.md` documents something with no matching code, it's marked **NOT IMPLEMENTED**.

Response envelope note: `docs/07-api-specification.md` specifies a `{ success, message, data }` / `{ success, message, code, errors }` envelope. **No code implements this envelope.** Every controller returns its DTO/interface directly as the JSON body (NestJS's default serialization), and errors are NestJS's default `{ statusCode, message, error }` shape from thrown `HttpException` subclasses. This is a global, consistent deviation from the spec — see [10-quality-review.md](./10-quality-review.md).

## Health

### `GET /health`
No auth. `HealthService.check()` — pings `PrismaService.isHealthy()`; throws `503 ServiceUnavailableException` if the DB is unreachable, otherwise `{ status: 'ok' }`.

## Auth

### `POST /auth/google`
No auth. Body: `{ idToken: string }` (`GoogleLoginDto`, both `@IsString()` and `@IsNotEmpty()`). → `googleAuthService.verifyIdToken` → upsert user → sign session JWT. Response: `{ token, user: { id, name, email } }`.

### `GET /auth/me`
`JwtAuthGuard` required. Response: `{ id, name, email, avatarUrl, role }`. Note `role` is additive vs. the doc's example, which omits it — but the doc's example response for `/auth/me` **does** show `role`, so this one matches.

### `POST /auth/logout`
`JwtAuthGuard` required. Always returns `{ success: true }`; does nothing server-side (JWT is stateless, no blocklist).

## Uploads

### `POST /uploads`
`OptionalJwtAuthGuard`. `multipart/form-data`, field name `video` (`UPLOAD_FIELD_NAME`). Validation happens in the Multer config, not the controller: extension+mimetype must be in the allow-list (mp4/mov/avi/mkv/webm), max 500 MB — a rejected file surfaces as a `400 BadRequestException` from the `fileFilter` callback, a too-large file as Multer's own limit error. Response: `{ uploadId, status: 'uploaded' }`.

### `GET /uploads/:id`
No auth (public — matches the doc). Response: `{ id, status, mediaFileId, createdAt }`. `mediaFileId` is `null` only in a theoretical race where the nested create partially failed (in practice always present, since it's created atomically with the `Upload` row).

## Video Analysis

### `GET /videos/{id}/analysis` — **NOT IMPLEMENTED**
Documented in `docs/07-api-specification.md`; no `videos` module exists anywhere in `apps/api/src/`. Metadata that this endpoint would presumably expose is available today only indirectly — through the AI Fine-Tune response's `reason` text, or not at all from the frontend's perspective.

## Platform Presets

### `GET /presets`
No auth. No params. Response: array of `{ id, name, slug, resolution, description }`, ordered by `name asc`. `resolution` is `PlatformPreset.targetResolution` — the encode-shaping fields (crf, bitrateStrategy, container, etc.) are intentionally never exposed here.

## Processing

### `POST /processing`
No auth guard at all (**neither** `JwtAuthGuard` nor `OptionalJwtAuthGuard` is applied — this is a fully public endpoint, matching the "Optimize" step being available to guests). Body (`CreateProcessingDto`):
```ts
{
  uploadId: string;       // required, non-empty
  presetId: string;       // required, non-empty
  aiTuning?: {             // optional, nested-validated
    crf?: number;          // int, 0–51
    bitrate?: number;      // int, ≥1
    fps?: number;          // number, ≥1
    scale?: string;        // must match /^\d+x\d+$/
  }
}
```
Flow: 404 if `uploadId` doesn't resolve to an upload with a `MediaFile`; 400 if the upload has no `MediaFile`; 404 if `presetId` doesn't exist; **409 `ConflictException`** if a `WAITING`/`PROCESSING` job already exists for this exact `(mediaFileId, presetId)` pair; **503** if the queue can't be reached at enqueue time (and the job is marked `FAILED` before returning). Success response: `{ jobId, status: 'waiting' }`.

Note: this endpoint does **not** check `MediaFile` metadata readiness (`width > 0 && height > 0`) the way `AiService` does — a `POST /processing` sent while metadata is still pending sentinel values will succeed and enqueue a job; the worker will then attempt to encode using `MediaFile.duration = 0`, which `parseProgressPercent` explicitly handles (`durationSeconds <= 0` → always returns `null`, so progress simply never advances past `0%` in the UI even though the encode is actually running) — the encode itself is unaffected since ffmpeg reads the real file, only the DB-cached duration used for progress percentage is at hand.

### `GET /processing/:jobId`
No auth guard. Response: `{ status, progress, currentStep, estimatedRemaining }`. `status` ∈ `waiting|processing|completed|failed`. `currentStep` ∈ `Waiting|Preparing|Encoding|Finalizing|Completed|Failed` — **not** the `Optimizing`/`Generating Preview` steps `docs/03-user-flow.md` describes (see [10-quality-review.md](./10-quality-review.md)). `estimatedRemaining` is `null` until progress has advanced past 0% for a `processing` job, `"0s"` once `completed`.

### `GET /processing/:jobId/result`
No auth guard. 404 if the job or its result doesn't exist. Response: `{ downloadUrl, thumbnail, size, resolution, codec }`. `thumbnail` is always `null` in practice (never generated — see [04-worker.md](./04-worker.md)). `downloadUrl` is a freshly-signed 300s URL generated on every call to this endpoint (calling it twice yields two different valid tokens for the same result).

## Downloads

### `GET /downloads/:resultId`
`OptionalJwtAuthGuard`. Response: `{ downloadUrl, expiresIn: 300 }`. If the caller is authenticated, a `Download` history row is recorded (best-effort — failure doesn't fail the request).

### `GET /downloads/:resultId/file?token=...`
`token` is the JWT minted by the endpoint above. 401 if missing/invalid/expired/mismatched purpose or subject; 404 if the result row or the underlying file on disk is gone. Streams the file with `Content-Disposition: attachment; filename="<outputFilename>"`. **`Content-Type` is hardcoded `video/mp4`** regardless of the actual container.

## History

All routes: `JwtAuthGuard` required (not optional — guests have no history).

### `GET /history`
Query (`HistoryQueryDto`, all optional except defaults): `page` (default 1), `limit` (default 10, max 50), `search`, `platform` (preset slug), `status` (one of `JOB_STATUS_FILTERS`), `sort` (only `'createdAt'` is a valid value — the query param exists but there is no second sortable field), `order` (`asc`/`desc`, default `desc`). Response: array of `{ id, preset, status, createdAt, resultId }`. Scoped to the authenticated user's own jobs via `mediaFile.upload.userId`.

### `DELETE /history/:id`
404 (not 403) if the job doesn't belong to the caller. Cascades `ProcessingResult`/`ProcessingLog` in the DB and best-effort deletes the output file from disk. Response: `{ success: true }`.

## Favorite Presets — **NOT IMPLEMENTED**

`docs/07-api-specification.md` documents `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id`. No `favorites` module, controller, service, or repository exists in `apps/api/src/`, despite the `FavoritePreset` Prisma model being fully defined and migrated (see [08-database.md](./08-database.md)).

## AI Recommendation

### `POST /ai/recommendation`
No auth guard. Body: `{ uploadId: string, presetId?: string }`. See [06-ai.md](./06-ai.md) for the full dual-mode algorithm.
- Without `presetId` → `RecommendationResult`: `{ compatibilityScore, recommendedPreset: { id, name }, reason, alternatives: [{ id, name, compatibilityScore }] }` (exactly 2 alternatives, or fewer if fewer than 3 presets exist).
- With `presetId` → `TuningSuggestionResult`: `{ presetId, suggestedCrf?, suggestedBitrate?, suggestedFps?, suggestedScale?, reason }`.
- 404 if the upload doesn't exist, 400 if it has no media file or metadata isn't ready yet (`width/height` still `0`), 404 if a supplied `presetId` doesn't resolve to a real preset.

## Admin

All routes: `JwtAuthGuard` + `RolesGuard` + `@Roles(ADMIN)`.

### `GET /admin/dashboard`
`{ totalUsers, totalUploads, totalJobs, storageUsed }` — `storageUsed` sums `MediaFile.fileSize` + `ProcessingResult.outputSize` across the entire DB (source + output bytes combined), formatted human-readable.

### `GET /admin/jobs`
Query: `page` (default 1), `limit` (default 20, max 50), `status`, `worker` (exact `workerName` match), `search` (preset name / original filename / exact job id). Response: `{ jobId, status, worker, progress, preset, createdAt }[]`, cross-user, newest first.

### `GET /admin/storage`
`{ used, available }` — `used` is the same DB-derived sum as the dashboard; `available` is real free disk space via `statfs` on the upload directory (`"unknown"` if `statfs` fails, e.g. non-POSIX filesystem or permission issue).

### `GET /admin/users`
Query: `page`, `limit` (max 50), `search` (name/email, case-insensitive). Response: `{ id, name, email, role, createdAt }[]`.

## HTTP status codes actually used in code

`200` (default success), `400` `BadRequestException`, `401` `UnauthorizedException`, `403` `ForbiddenException` (role check failure), `404` `NotFoundException`, `409` `ConflictException` (duplicate active job), `422` (validation failures from `class-validator`, NestJS default), `429` (`ThrottlerGuard`), `503` `ServiceUnavailableException` (queue/DB unreachable). `413` (payload too large) would come from Multer/Express itself on an oversized upload, not from application code.

## Validation summary by DTO

| DTO | Fields |
|---|---|
| `GoogleLoginDto` | `idToken: string` (required, non-empty) |
| `CreateProcessingDto` | `uploadId`, `presetId` (required, non-empty strings) + optional nested `AiTuningDto` |
| `AiTuningDto` | `crf?: int 0–51`, `bitrate?: int ≥1`, `fps?: number ≥1`, `scale?: string /^\d+x\d+$/` |
| `CreateRecommendationDto` | `uploadId: string` (required), `presetId?: string` |
| `HistoryQueryDto` | `page`/`limit` (int, coerced from query string via `@Type(() => Number)`), `search`/`platform` (string), `status` (must be in `JOB_STATUS_FILTERS`), `sort` (only `'createdAt'` accepted), `order` (`asc`/`desc`) |
| `AdminJobsQueryDto` | `page`/`limit`, `status`, `worker` (string), `search` (string) |
| `AdminUsersQueryDto` | `page`/`limit`, `search` (string) |

Every query-param DTO caps `limit` at 50 (`MAX_LIMIT`) — there is no way for a client to request more than 50 rows per page on any listing endpoint.
