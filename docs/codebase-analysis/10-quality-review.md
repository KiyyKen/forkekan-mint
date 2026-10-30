# 10 — Quality Review

Whole-project review based on the code as read for this analysis (not a lint/test run — see `docs/12-testing-strategy.md` and the project's own `pnpm lint`/`typecheck`/`test` for that).

## Strengths

- **Consistent architecture.** Every backend module, without exception, follows Controller → Service → Repository with no business logic leaking into controllers or Prisma calls leaking into services. This held true across all 10 modules read for this analysis.
- **Deterministic AI by design.** The "AI" is genuinely deterministic pure functions with unit tests covering every branch (`recommendation.engine.spec.ts`). No flakiness, no cost, no external dependency, no prompt-injection surface.
- **The AI/Platform-Profile boundary is enforced at three independent layers** (DTO whitelist, engine return type, ffmpeg arg builder) — see [06-ai.md](./06-ai.md). A change to any single layer alone can't accidentally let AI touch codec/container/audio.
- **Signed, short-lived, single-purpose download tokens.** The `purpose: 'download'` claim check ([downloads.service.ts:94](../../apps/api/src/downloads/downloads.service.ts#L94)) specifically prevents a session JWT from being replayed as a download token and vice versa — an easy mistake this code avoids.
- **Fail-fast env validation** ([env.validation.ts](../../apps/api/src/config/env.validation.ts)) catches missing `DATABASE_URL`/`JWT_SECRET` and the insecure-default-in-production case at boot, not mid-request.
- **Orphan-file cleanup on upload failure** ([uploads.service.ts:71-77](../../apps/api/src/uploads/uploads.service.ts#L71-L77)) is a specific, deliberate piece of defensive code — most CRUD codebases at this maturity level miss this.
- **Migrations are additive and backward-compatible.** The `platform_profile_and_ai_tuning` migration added 10 columns, all defaulted, zero data loss, zero breaking change to existing rows.
- **Test coverage on the parts that matter most for correctness**: `ffmpeg.ts`'s pure argument-building/parsing functions are fully unit tested (CBR, CRF, VP9's `-b:v 0` special case, pad vs crop, all four tuning-override interactions) without needing a real ffmpeg binary in CI.

## Weaknesses / technical debt

### Documentation drift (docs vs. code)
- `docs/07-api-specification.md` documents `GET /videos/{id}/analysis` and the entire `Favorite Presets` section (`GET/POST/DELETE /favorites`) — **neither is implemented**. `FavoritePreset` exists in the schema with zero API surface.
- The documented response envelope (`{ success, message, data }` / `{ success, message, code, errors }`) is not implemented anywhere — every endpoint returns its raw DTO, errors are NestJS's default shape. This is a total mismatch between spec and reality across every single endpoint.
- `docs/03-user-flow.md`'s "Processing Flow" lists `Waiting → Preparing → Encoding → Optimizing → Generating Preview → Finalizing → Completed`. The real `currentStep` values are only `Waiting|Preparing|Encoding|Finalizing|Completed|Failed` — `Optimizing` and `Generating Preview` don't exist (no preview/thumbnail is ever generated at all).
- Example JSON payloads throughout `docs/07-api-specification.md` use numeric IDs (`"id": 1`); actual IDs are `cuid()` strings.

### Dead / unused code and schema
- `StorageObject` is written once at upload time and never read again by any repository — the abstraction it's building toward (multi-backend storage) has no consumer yet.
- `FavoritePreset` — full schema, zero code using it.
- `Download` table is realistically always empty: the one frontend code path that could populate it (`GET /downloads/:resultId` called with a logged-in user) is never invoked by the shipped UI — the UI always goes through `GET /processing/:jobId/result`, which hardcodes `userId: null`.
- `ProcessingResult.previewThumbnail` — column, type, and frontend prop all exist; nothing ever writes to it.
- `UploadStatus.UPLOADING` / `UploadStatus.FAILED` enum values are never assigned by any code path.
- `packages/types` and `packages/ui` are empty placeholders that suggest more sharing than actually exists — `apps/api` and `apps/worker` hand-duplicate the `PROCESS_VIDEO_JOB`/`EXTRACT_METADATA_JOB`/queue-name string constants and the `ProcessVideoJobData`/`AiTuning` shapes independently instead of importing from a shared package built for exactly this.
- `PresetSummary`/`AiTuning`/etc. types are hand-duplicated between `apps/api` (derived from Prisma types) and `apps/web/src/types/*` (hand-written) with no compiler link enforcing they stay in sync — a backend field rename would silently desync the frontend type until someone notices a runtime mismatch.

### Reliability gaps
- **No cleanup of partially-written ffmpeg output on failure/retry.** Each BullMQ retry attempt generates a new random output filename; a failed or killed attempt's partial file is never deleted. Over the life of a deployment with any nonzero failure rate, `storage/outputs/` accumulates orphaned partial files indefinitely.
- **Uploaded source files are never deleted**, ever — not on job completion, not on history deletion (`HistoryService.remove` only unlinks the output file). `storage/uploads/` grows forever.
- **`extract-metadata` has no recovery path after 3 failed BullMQ attempts.** The `MediaFile` row is stuck at sentinel values permanently; nothing re-triggers extraction, nothing surfaces this to the user beyond an indefinitely-retrying 400 from the AI endpoint.
- **`POST /processing` doesn't check metadata readiness** the way `POST /ai/recommendation` does — a job can be created and queued while `MediaFile.duration` is still `0`, resulting in a real encode whose progress percentage in the UI never advances past 0% (though the encode itself completes correctly) — a confusing but not corruption-causing gap.
- **Worker silently drops unrecognized job names** (`default` case in the `switch`, [main.ts:47-48](../../apps/worker/src/main.ts#L47-L48)) with only a `console.log` — no dead-letter queue, no alert.
- **`worker.on('failed', ...)` is log-only** — exhausting all retry attempts on a job produces no alert, metric, or notification of any kind; an operator only finds out by reading worker stdout or querying `FAILED` rows directly.

### Consistency / correctness nits
- `ProcessingResult.outputBitrate` stores the *configured target*, not a measured value — for every CRF-mode encode (i.e. the primary WhatsApp Story path), this number is not what the file actually contains.
- `downloads.service.ts` hardcodes `Content-Type: video/mp4` regardless of `preset.container` — currently harmless (every seeded preset uses `mp4`) but silently wrong the moment any preset's `container` field is changed to `webm`/`mov`.
- Two independent, hand-maintained copies of upload validation rules (`apps/api/src/uploads/uploads.constants.ts` and `apps/web/src/utils/validate-video-file.ts`) with a comment in each acknowledging the duplication and asking future editors to keep them in sync manually — no shared source of truth.
- `queue.constants.ts`/`job-names.ts` duplicated between `apps/api` and `apps/worker` with the same "keep in sync" comment pattern.
- `ProcessingService.createJob`'s enqueue-failure path leaves a `FAILED` `ProcessingJob` row with no corresponding queue job ever having existed; a client retry after a transient Redis blip creates a *second* row rather than reusing/clearing the first, so job history can accumulate silent-failure rows that don't represent a real attempt.

### Architecture / scalability concerns
- **Local disk storage only**, with no shared filesystem story — `apps/api` (upload write) and `apps/worker` (encode read/write) must run with matching relative-path resolution against the same physical disk. This works for one API instance + one worker instance on one machine; it does not horizontally scale API or worker replicas without a shared volume or migrating to real object storage (the `StorageObject` model suggests this was the plan, but nothing consumes it yet).
- **Single BullMQ queue for two very different workloads** (fast metadata extraction vs. slow video encoding) — a burst of uploads can queue many `extract-metadata` jobs behind a long-running `process-video` job (or vice versa) since there's no priority or separate-queue isolation between the two job types sharing one `Worker` concurrency setting (which itself is never explicitly configured — BullMQ's default concurrency of 1 applies, meaning **the worker processes exactly one job at a time, period**, whether metadata or encode).
- **No retry/backoff visibility to the end user.** A job that fails and retries 3 times shows the same generic "Optimasi gagal" only after all 3 attempts exhaust — no incremental feedback during retries.
- **First-admin bootstrap has no mechanism** other than direct DB manipulation.

### Security observations (not exploits found, but worth noting)
- Session JWT and download-token JWT are signed with the **same `JWT_SECRET`**, differentiated only by an application-level `purpose` claim rather than distinct keys/audiences — defense-in-depth would prefer a separate signing secret for short-lived resource tokens, though the current `purpose`+`sub` check does correctly prevent cross-use as implemented.
- `ThrottlerGuard` is applied globally with one flat limit (120 req/60s by default) — no per-endpoint tuning (e.g. `POST /uploads` and `POST /processing` arguably deserve tighter limits than `GET /presets`).
- `DownloadsController.downloadFile`'s `token` query param will end up in access logs / browser history / potentially CDN/proxy logs given it's a GET request — standard tradeoff for signed-URL patterns, but worth being aware of since the token is short-lived (300s) rather than one-time-use.

## Performance concerns

- Every ffmpeg encode is single-pass with no `-maxrate`/`-bufsize`, no GOP tuning, and (per [11-video-quality-analysis.md](./11-video-quality-analysis.md)) may be the dominant quality lever left unexplored.
- `AdminService.sumStorageBytes` runs a full-table `aggregate` over `MediaFile` and `ProcessingResult` on every dashboard/storage page load — fine at current scale, will need caching or a materialized counter once row counts grow substantially.
- `usePresets()` on the frontend uses `staleTime: Infinity` — correct call for a rarely-changing 9-row list, but means a preset added via direct DB seed won't be visible to an already-open browser tab without a full reload (no cache invalidation trigger exists).

## Maintainability concerns

- The "keep these two files in sync manually" comment pattern (queue names, job names, upload validation rules) is a recurring maintenance hazard given `packages/types`/`packages/shared` already exist as the intended home for exactly this kind of cross-app contract.
- No shared runtime type for `ProcessingJob.aiTuning`'s JSON contents beyond the write-side DTO — the worker's read-side cast (`record.aiTuning as AiTuning | null`) is unchecked; a future schema change to `AiTuningDto` without updating the worker's `AiTuning` interface in lockstep would fail silently (wrong fields, `undefined` where a value was expected) rather than loudly.

## Scalability concerns

Covered above under Architecture — the two load-bearing constraints are (1) local-disk-only storage tying API and worker to co-located filesystems, and (2) BullMQ's default concurrency of 1 on the single worker process meaning **all encoding across all users is fully serial** system-wide today.

## Testing quality

- Backend: strong coverage on services with mocked repositories (`ai.service.spec.ts`, `processing.service.spec.ts`, `admin.service.spec.ts`, `history.service.spec.ts`, `downloads.service.spec.ts`, `auth.service.spec.ts`, `roles.guard.spec.ts`) and on the pure scoring/tuning engine (`recommendation.engine.spec.ts`).
- Worker: `ffmpeg.test.ts` and `ffprobe.test.ts` both test only the **pure** argument-building/output-parsing functions, never `runFfmpeg`/`runFfprobe` themselves (which spawn real processes) — appropriate for unit tests, but means there is **no automated test anywhere that actually invokes a real ffmpeg binary** to confirm the built argv is valid ffmpeg syntax; that validation happened manually during the architecture-pivot session (per prior conversation context) rather than being captured as a CI-running integration/E2E test.
- No end-to-end test suite exercises the full upload → process → download loop against a real API+worker+DB+Redis stack (`docs/12-testing-strategy.md` calls for E2E tests; none were found under `apps/*/src` in this reading pass — worth confirming against a dedicated e2e test directory if one exists outside the paths read here).
- Frontend: `validate-video-file.test.ts` and `admin-service.test.ts` are the only test files found in `apps/web/src` — component-level and hook-level behavior (e.g. `OptimizePanel`'s state machine, `AiFineTuneToggle`'s retry logic) has no automated coverage.
