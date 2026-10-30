# 11 — Video Quality Analysis: Why WhatsApp Story Output May Be Worse Than Competitors

> Scope discipline: this document analyzes **only what the current implementation actually does**, using the exact encode parameters traced in [05-ffmpeg.md](./05-ffmpeg.md). No code was changed to produce this analysis. Where a cause cannot be verified from this codebase alone (e.g. WhatsApp's own undocumented internal transcoding behavior, or a specific competitor's actual pipeline), that is stated explicitly rather than guessed at.

## The exact encode WhatsApp Story videos get today

From [apps/api/prisma/seed.ts](../../apps/api/prisma/seed.ts#L65-L82) + [apps/worker/src/ffmpeg/ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts), when a user does the **default, most common thing** — upload a video, leave WhatsApp Story selected, click "Optimalkan" without touching the AI Fine-Tune toggle (off by default, see [06-ai.md](./06-ai.md) and [07-frontend.md](./07-frontend.md)):

```
ffmpeg -y -v error -i <input>
  -vf scale=720:1280:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=720:1280:(ow-iw)/2:(oh-ih)/2,fps=30
  -c:v libx264 -crf 23 -preset slow
  -pix_fmt yuv420p
  -c:a aac -b:a 128k -ac 2 -ar 44100
  -movflags +faststart
  -progress pipe:1
  <output>
```

Every one of these values is a fixed, code-verified fact, not an inference.

## Ranked causes, highest probability first

### 1. CRF 23 is a "reasonable default," not a "maximize survivability" value — **highest probability**

**Evidence**: `CRF_BASELINE = 23` in both [seed.ts:79](../../apps/api/prisma/seed.ts#L79) (the actual encode value used when AI Fine-Tune is off — the common case) and [recommendation.engine.ts:271](../../apps/api/src/ai/recommendation.engine.ts#L271) (the baseline AI Fine-Tune adjusts from). CRF 23 is literally libx264's own upstream default value for "reasonable quality" — it is not a value chosen with headroom for a second lossy re-compression pass in mind. For a product whose own seed-data description states the goal is "kualitas terbaik yang bertahan setelah kompresi ulang WhatsApp" (best quality that survives WhatsApp's re-compression), shipping the encoder's stock default CRF is a direct contradiction of that stated goal — a lower CRF (16–19 range, "visually near-lossless" territory for x264) would leave far more detail for WhatsApp's own transcoder to work from.

Compounding this: even when a user **does** turn on AI Fine-Tune, the adjustment logic only ever moves CRF by `±CRF_ADJUST_STEP = 2` from the 23 baseline ([recommendation.engine.ts:319-327](../../apps/api/src/ai/recommendation.engine.ts#L319-L327)), and only lowers it at all when source bitrate is ≥1.5× the platform's `targetBitrate` (2000 kbps → needs ≥3000 kbps source). A typical modern phone-shot clip easily exceeds that, so AI Fine-Tune *can* reach CRF 21 — still far from a "maximize quality" value, and the hard clamp `CRF_MIN = 18` ([recommendation.engine.ts:272](../../apps/api/src/ai/recommendation.engine.ts#L272)) is only reachable at all through this narrow ±2 step logic, never directly. **There is no code path anywhere in the system that produces a CRF below 18, and reaching even 21 requires the user to discover and enable an opt-in toggle.**

### 2. Lower-resolution sources get upscaled to 720×1280 by default — **high probability**

**Evidence**: [buildScaleFilter](../../apps/worker/src/ffmpeg/ffmpeg.ts#L76-L90) always emits `scale=720:1280:force_original_aspect_ratio=decrease:force_divisible_by=2`. FFmpeg's `force_original_aspect_ratio=decrease` mode fits the source into the target box while preserving aspect ratio — it does **not** skip scaling when the source is smaller than the box; a 480×854 source is scaled *up* to fit within 720×1280 just as readily as a 4K source is scaled down. The only mechanism in this codebase that prevents this — `suggestTuning`'s scale-down suggestion when `sourcePixels < targetPixels` ([recommendation.engine.ts:297-308](../../apps/api/src/ai/recommendation.engine.ts#L297-L308)) — is **only ever applied if the user turns on AI Fine-Tune**, which is off by default. So the default, most-traveled path for any user uploading a lower-resolution clip (very common for older phone recordings, screen recordings, or anything downloaded/forwarded and already once-compressed) actively **upscales and re-encodes invented pixels**, then hands that softened, artificially-detailed frame to WhatsApp's own re-compression — compounding loss twice instead of once.

### 3. FFmpeg's default scaling algorithm (bicubic) is used, not a sharper resampling filter — **medium probability**

**Evidence**: `buildScaleFilter` never sets `flags=` on the `scale` filter, and `runFfmpeg`/`buildFfmpegArgs` never pass a global `-sws_flags`. FFmpeg's `libswscale` defaults to bicubic when no algorithm is specified. Bicubic is adequate but is known to produce softer results on both upscale and downscale compared to `lanczos`, which is the algorithm most quality-focused encoding tools default to for exactly this kind of resize-before-encode step. This is a small, mechanical, one-line fix candidate (`flags=lanczos` in the filter string) with no architectural cost — see [12-improvement-roadmap.md](./12-improvement-roadmap.md).

### 4. No `-maxrate`/`-bufsize` cap on CRF encodes — **medium probability**

**Evidence**: [buildCrfArgs](../../apps/worker/src/ffmpeg/ffmpeg.ts#L152-L163) emits only `-crf {n} -preset {videoPreset}` — no VBV/rate-cap arguments anywhere in the codebase, for any preset. Pure CRF mode lets the encoder allocate however many bits a given CRF quality target needs, frame by frame, with no ceiling. This cuts both ways: a very complex/high-motion clip could produce a much larger file than `targetBitrate` implies (not itself a *quality* problem, but relevant to WhatsApp's own upload size limits, which aren't modeled anywhere in this app); a very simple/static clip could end up encoded at a much *lower* bitrate than 2000 kbps, which is arguably the more quality-relevant case — low-complexity source content at CRF 23 can land well under what WhatsApp's own re-compression pass would otherwise have left it, again giving that second pass less to preserve. This is a secondary effect of cause #1 rather than fully independent — both point at the same underlying gap (no deliberate floor/ceiling on the output bit budget).

### 5. No two-pass encoding — **low-to-medium probability, more relevant to file-size accuracy than to per-frame quality**

**Evidence**: no `-pass 1`/`-pass 2` invocation anywhere in [ffmpeg.ts](../../apps/worker/src/ffmpeg/ffmpeg.ts); every encode (CRF and CBR alike) is single-pass. For a **CRF** encode specifically, two-pass is *not* the standard lever for improving quality-per-bit the way it is for a target-bitrate/CBR encode — CRF already does its own local rate-distortion optimization per frame in one pass. This is included for completeness and because it's a real, verifiable gap, but it is ranked below causes #1–#4 because the theoretical quality benefit of two-pass specifically *for a CRF-mode encode* is smaller than the other findings.

### 6. No x264 psychovisual/tune flags, no explicit profile/level — **low probability, speculative**

**Evidence**: no `-tune`, `-profile:v`, `-level`, or `-x264-params` flags anywhere in `buildFfmpegArgs`. `-tune film` (or `grain`, depending on source content) can measurably improve perceived quality at a given CRF for certain content types by adjusting psychovisual optimizations (deblocking strength, psy-rd). This is a plausible, low-cost improvement but its impact is generally smaller than CRF value itself (#1), and unverifiable from this codebase whether it would matter for WhatsApp's specific re-compression behavior.

### 7. GOP size / keyframe interval untuned — **low probability**

**Evidence**: no `-g`/`-keyint_min`/`-sc_threshold` flags; libx264's default GOP (~250 frames ≈ 8.3s at 30fps) applies. Given `DURATION_LIMITS_BY_SLUG['whatsapp-story'] = 30` seconds ([recommendation.engine.ts:58-60](../../apps/api/src/ai/recommendation.engine.ts#L58-L60)) caps how long a Story clip is expected to be, a typical clip only contains a handful of keyframes either way; unlikely to be a major visible quality driver for this platform specifically, though it's a real, unaddressed knob.

### 8. Audio settings — **ruled out**

128 kbps AAC stereo at 44.1kHz ([seed.ts DEFAULT_PROFILE_FIELDS](../../apps/api/prisma/seed.ts#L41-L50)) is a perfectly reasonable, unremarkable audio configuration. Nothing here plausibly explains a *visual* quality complaint.

## What cannot be determined from this codebase alone

- **WhatsApp's actual internal re-compression target** (resolution, bitrate, codec/profile, whether it re-encodes at all for a given input that already matches its heuristics) is undocumented and external to this repository. If WhatsApp's real internal target differs from 720×1280, this app's output gets resized *again* by WhatsApp regardless of anything fixed above — this is the single largest potential factor this analysis cannot verify or rule out, because it lives entirely outside the code being reviewed.
- **A specific comparison against "DanzClean"'s actual output** would require encoding the same source file through both pipelines and comparing (e.g. via SSIM/VMAF) — no such comparison exists in this repository, and none was fabricated for this document. Everything above is derived strictly from what this codebase's own parameters would predictably do, not from a measured competitive gap.

## Summary ranking

| Rank | Cause | Confidence | Verified from code? |
|---|---|---|---|
| 1 | CRF 23 default is not tuned for "survive re-compression," and AI Fine-Tune (off by default) only narrows it to 21–25 in common cases | High | Yes |
| 2 | Lower-res sources are upscaled by default (anti-upscale logic is opt-in, off by default) | High | Yes |
| 3 | Default bicubic scaling algorithm instead of a sharper resampler (e.g. lanczos) | Medium | Yes |
| 4 | No `-maxrate`/`-bufsize` — no floor on bits allocated to low-complexity content | Medium | Yes |
| 5 | No two-pass encoding | Low–Medium | Yes (but low quality-relevance for CRF mode specifically) |
| 6 | No `-tune`/profile/level flags | Low | Yes (gap confirmed, impact speculative) |
| 7 | Untuned GOP/keyframe interval | Low | Yes (gap confirmed, low relevance for short clips) |
| — | WhatsApp's actual internal re-compression behavior | Unknown | No — external to this repo |
| — | Direct competitor pipeline comparison | Unknown | No — no comparative data exists in this repo |

See [12-improvement-roadmap.md](./12-improvement-roadmap.md) for concrete, prioritized fixes addressing ranks 1–4.
