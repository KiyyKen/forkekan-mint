# 12 — Improvement Roadmap

Derived from [10-quality-review.md](./10-quality-review.md) and [11-video-quality-analysis.md](./11-video-quality-analysis.md). This is documentation only — no code here has been changed. Per `CLAUDE.md`, any of these would need explicit approval before implementation, and anything touching `docs/07-api-specification.md`/`docs/08-database-schema.md` contracts would need the documentation-first process that governs this repo.

---

## Critical

### C1. Lower the default CRF and stop upscaling low-resolution sources by default
**Why**: [11-video-quality-analysis.md](./11-video-quality-analysis.md) ranks these as the two highest-probability causes of WhatsApp Story output looking worse than a quality-focused competitor — both are the *default, most-traveled path* (AI Fine-Tune is off by default), not an edge case.
**Expected impact**: Directly addresses the product's own stated goal ("kualitas terbaik yang bertahan setelah kompresi ulang WhatsApp") for the majority of users who never touch the AI Fine-Tune toggle.
**Difficulty**: Low (config value changes) for the CRF number itself; Low-Medium for the anti-upscale change since it changes default *behavior*, not just a constant.
**Files involved**: [apps/api/prisma/seed.ts](../../apps/api/prisma/seed.ts) (`crf: 23` → a lower value, e.g. 18–19, for the `whatsapp-story` entry, then re-seed), [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts) (`buildScaleFilter` — needs a source-vs-target dimension comparison to conditionally skip upscaling, independent of whether AI Fine-Tune is on).

### C2. Add an automated integration test that runs a real ffmpeg encode
**Why**: [10-quality-review.md](./10-quality-review.md) found that `ffmpeg.test.ts`/`ffprobe.test.ts` only test pure argument-building/parsing — no test in the repository actually spawns ffmpeg and confirms the generated argv is valid, executable ffmpeg syntax. The only time this was verified was manually, once, outside of CI (per this project's history). A future change to `buildFfmpegArgs` could produce syntactically-plausible-but-broken argv (e.g. an encoder/flag incompatibility like the VP9 `-preset` case already special-cased in code) and no test would catch it.
**Expected impact**: Closes the single largest correctness gap between "tests pass" and "the product actually works," directly matching `docs/12-testing-strategy.md`'s E2E intent.
**Difficulty**: Medium — needs ffmpeg available in the CI environment and a tiny fixture video checked into the repo (or generated on the fly with `ffmpeg -f lavfi`).
**Files involved**: new test file under `apps/worker/src/ffmpeg/` (e.g. `ffmpeg.integration.test.ts`), CI workflow config (not read as part of this analysis — verify what CI environment is available).

---

## High

### H1. Clean up orphaned output files from failed/retried encode attempts
**Why**: [04-worker.md](./04-worker.md) — every BullMQ retry attempt generates a new random UUID output filename; a failed or killed mid-write attempt's partial file is never deleted. This grows `storage/outputs/` unboundedly over the life of any deployment with a nonzero failure rate.
**Expected impact**: Prevents unbounded disk growth in production; directly relevant given storage is local-disk-only (see [10-quality-review.md](./10-quality-review.md) scalability notes).
**Difficulty**: Low — wrap the ffmpeg call in a try/catch that unlinks `outputPath` on failure before re-throwing.
**Files involved**: [apps/worker/src/processors/process-video.processor.ts](../../apps/worker/src/processors/process-video.processor.ts).

### H2. Give `extract-metadata` a recovery path after exhausting retries
**Why**: [04-worker.md](./04-worker.md) — after 3 failed BullMQ attempts, `MediaFile` is stuck at sentinel values forever with no alert and no way for the user to recover other than contacting a developer. This directly blocks the AI Fine-Tune feature (which requires `width/height > 0`) and silently degrades the product for any video ffprobe struggles with.
**Expected impact**: Prevents a class of silent, permanent per-upload failures.
**Difficulty**: Medium — requires either a `MediaFile.metadataStatus` field (or reusing existing sentinel-detection) plus a re-extraction trigger (manual admin action, or a scheduled sweep), and/or surfacing the failure state to the frontend so the user knows to re-upload instead of waiting indefinitely.
**Files involved**: [apps/worker/src/processors/extract-metadata.processor.ts](../../apps/worker/src/processors/extract-metadata.processor.ts), `apps/api/src/uploads/*`, `apps/web/src/pages/upload-page.tsx` / `apps/web/src/components/optimize-panel.tsx`.

### H3. Add `-maxrate`/`-bufsize` (or otherwise bound) CRF-mode encodes
**Why**: [11-video-quality-analysis.md](./11-video-quality-analysis.md) rank 4 — CRF mode currently has no bit-budget floor or ceiling, which can under-allocate bits to low-complexity content right before WhatsApp's own re-compression pass, and over-allocate on high-complexity content with no size predictability.
**Expected impact**: More consistent output quality and file size across varied source content; addresses a concrete, code-verified gap in the primary product path (WhatsApp Story is CRF-mode).
**Difficulty**: Low — a data-driven addition to `buildCrfArgs`, gated by new optional `PlatformPreset` fields (or a fixed multiplier off `targetBitrate`).
**Files involved**: [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts), possibly `apps/api/prisma/schema.prisma` if exposed per-preset rather than hardcoded.

### H4. Reconcile `docs/07-api-specification.md` with actual implemented routes
**Why**: [09-api.md](./09-api.md) and [10-quality-review.md](./10-quality-review.md) found the documented response envelope (`{success, message, data}`) doesn't exist anywhere in code, and two entire documented feature areas (`/videos/{id}/analysis`, `/favorites`) have zero implementation. `CLAUDE.md` designates `docs/` as the source of truth developers are told to build against — this drift actively misleads anyone reading the spec before the code.
**Expected impact**: Removes a recurring source of confusion for anyone (including future AI-assisted work, per `CLAUDE.md`'s own instruction to read `docs/` first) onboarding onto this codebase.
**Difficulty**: Low (it's a documentation-only fix) but requires a product decision first: either implement the missing envelope/endpoints, or update the spec to match reality — this is exactly the kind of architecture-affecting choice `CLAUDE.md` says needs explicit approval before either doc or code changes.
**Files involved**: `docs/07-api-specification.md`, `docs/03-user-flow.md` (Processing Flow step list), and either new `favorites`/`videos` modules or their removal from the spec.

---

## Medium

### M1. Use a sharper resampling algorithm for the scale filter
**Why**: [11-video-quality-analysis.md](./11-video-quality-analysis.md) rank 3 — FFmpeg defaults to bicubic scaling when no `flags=` is specified; lanczos is generally sharper for both the pad-mode downscale (all current presets) and the crop-mode case.
**Expected impact**: Small but real, low-risk quality improvement across every preset, not just WhatsApp Story.
**Difficulty**: Very low — a one-line addition to the filter string.
**Files involved**: [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts) `buildScaleFilter`.

### M2. Record `Download` history for the path the frontend actually uses
**Why**: [07-frontend.md](./07-frontend.md)/[10-quality-review.md](./10-quality-review.md) — the `Download` table is realistically always empty because the frontend's actual download buttons call `GET /processing/:jobId/result` (which hardcodes `userId: null`), not `GET /downloads/:resultId` (the endpoint that does record history). Either the frontend should call the recording endpoint, or `getResult` should pass the real user id when available.
**Expected impact**: Makes a fully-built, tested feature (download history) actually functional rather than silently inert.
**Difficulty**: Low — `ProcessingService.getResult` needs the caller's `userId` threaded through from the controller (currently discarded — `JwtAuthGuard`/`OptionalJwtAuthGuard` isn't even applied to `GET /processing/:jobId/result` today, so this also requires deciding whether to add one).
**Files involved**: [apps/api/src/processing/processing.controller.ts](../../apps/api/src/processing/processing.controller.ts), [apps/api/src/processing/processing.service.ts](../../apps/api/src/processing/processing.service.ts).

### M3. Delete uploaded source files once no longer needed
**Why**: [10-quality-review.md](./10-quality-review.md) — uploaded originals are never deleted by any code path, so `storage/uploads/` grows forever regardless of history deletion or job completion.
**Expected impact**: Bounds disk usage; relevant to the same local-disk scalability constraint noted throughout.
**Difficulty**: Medium — needs a policy decision (delete immediately after the last successful job for that upload? after N days? only on explicit history deletion?) since a source file may still be needed for a second processing job with a different preset.
**Files involved**: `apps/api/src/uploads/`, `apps/api/src/history/history.service.ts`, possibly a new scheduled cleanup job in `apps/worker`.

### M4. Deduplicate cross-app constants via `packages/types`/`packages/shared`
**Why**: [10-quality-review.md](./10-quality-review.md) — queue/job name strings, upload validation rules, and the `AiTuning`/`ProcessVideoJobData` shapes are all hand-duplicated between `apps/api` and `apps/worker` (or `apps/web`) with "keep in sync" comments as the only enforcement, despite `packages/types` and `packages/shared` existing specifically for this.
**Expected impact**: Removes an entire class of "forgot to update the other copy" bugs; makes the existing shared packages actually earn their place in the monorepo.
**Difficulty**: Medium — mechanical but touches many files across all three apps; needs care not to introduce a circular workspace dependency.
**Files involved**: `packages/types/src/index.ts`, `packages/shared/src/*`, `apps/api/src/common/queue/queue.constants.ts`, `apps/worker/src/jobs/*`, `apps/api/src/uploads/uploads.constants.ts`, `apps/web/src/utils/validate-video-file.ts`.

### M5. Surface worker job-failure and retry-exhaustion as an actionable signal
**Why**: [04-worker.md](./04-worker.md)/[10-quality-review.md](./10-quality-review.md) — `worker.on('failed', ...)` and unrecognized job names are log-only; there's no alert, metric, or dead-letter handling when a job exhausts retries.
**Expected impact**: Operational visibility — currently the only way to know encoding is systematically failing is to read worker stdout or query the DB directly.
**Difficulty**: Medium — depends on what's available in the deployment environment (a metrics/alerting stack isn't part of this codebase today).
**Files involved**: [apps/worker/src/main.ts](../../apps/worker/src/main.ts).

---

## Low

### L1. Add `-tune film` (or content-appropriate tune) and consider explicit `-profile:v`/`-level`
**Why**: [11-video-quality-analysis.md](./11-video-quality-analysis.md) rank 6 — a plausible but lower-confidence, low-cost quality lever.
**Expected impact**: Speculative, likely small; worth an A/B or before/after comparison rather than blind adoption.
**Difficulty**: Very low to add; medium to validate the impact is actually positive.
**Files involved**: [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts) `buildCrfArgs`/`buildFfmpegArgs`.

### L2. Tune GOP size / keyframe interval for short-form content
**Why**: [11-video-quality-analysis.md](./11-video-quality-analysis.md) rank 7 — low relevance for clips already capped at 30–60s by `DURATION_LIMITS_BY_SLUG`, but a real, unaddressed gap.
**Expected impact**: Likely marginal; more relevant if seek/scrubbing behavior in-app becomes a requirement than for raw quality.
**Difficulty**: Low.
**Files involved**: [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts).

### L3. Fix hardcoded `video/mp4` Content-Type on downloads
**Why**: [03-backend.md](./03-backend.md)/[10-quality-review.md](./10-quality-review.md) — currently harmless since every seeded preset uses `container: mp4`, but silently wrong the moment any preset's container changes.
**Expected impact**: Low today, prevents a future silent bug.
**Difficulty**: Very low — derive from `result.outputFilename`'s extension or store the container on `ProcessingResult`.
**Files involved**: [apps/api/src/downloads/downloads.service.ts](../../apps/api/src/downloads/downloads.service.ts).

### L4. Decide the fate of `StorageObject` and `FavoritePreset`
**Why**: [08-database.md](./08-database.md)/[10-quality-review.md](./10-quality-review.md) — both are fully-modeled schema with no (`StorageObject`) or effectively no (`FavoritePreset`) consuming code. Either finish the feature or acknowledge the schema is aspirational.
**Expected impact**: Reduces schema/code drift and confusion for future contributors reading `schema.prisma` expecting these to be live features.
**Difficulty**: High if implementing (`FavoritePreset` needs a full module; `StorageObject` needs an actual storage abstraction layer, e.g. real R2 support) — Low if just documenting the current state clearly. This is a product decision, not a pure engineering one — needs the explicit-approval process `CLAUDE.md` requires before either building the feature or removing the schema.
**Files involved**: `apps/api/prisma/schema.prisma`, potentially new `apps/api/src/favorites/` module, potentially a real storage-backend implementation.

### L5. First-admin bootstrap mechanism
**Why**: [03-backend.md](./03-backend.md) — currently requires manual DB manipulation to promote the first `ADMIN` user, with no CLI or endpoint for it.
**Expected impact**: Low-frequency but real operational friction on every fresh deployment.
**Difficulty**: Low — e.g. a seed-time env var (`ADMIN_EMAIL`) that promotes a matching user on login, or a one-time CLI script.
**Files involved**: `apps/api/src/auth/auth.service.ts` or a new script under `apps/api/prisma/` or `apps/api/scripts/`.
