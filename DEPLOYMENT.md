# Deployment Guide

Panduan deployment production Forkekan-mint. Strategi lengkap ada di
[docs/11-deployment.md](docs/11-deployment.md) — dokumen ini adalah
petunjuk operasional langkah demi langkah untuk menjalankannya.

---

## 1. Arsitektur Production

```text
                    Internet
                        │
                        ▼
                  Nginx Reverse Proxy (port 80)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   Web (Nginx static, :3000)     API (NestJS, :4000)
                                       │
                 ┌─────────────────────┼────────────────────┐
                 ▼                     ▼                    ▼
           PostgreSQL              Redis              BullMQ Queue
                                                          │
                                                          ▼
                                                     Worker (FFmpeg)
```

Dua jalur deployment yang didukung:

| Jalur | Kapan dipakai |
| --- | --- |
| **Coolify** (direkomendasikan blueprint) | Setiap service (`web`, `api`, `worker`) di-deploy sebagai aplikasi Docker terpisah lewat dashboard Coolify; Postgres & Redis sebagai managed resource; Traefik bawaan Coolify menangani HTTPS/Let's Encrypt. Lihat [infra/coolify/README.md](infra/coolify/README.md). |
| **Docker Compose mandiri (VPS)** | `infra/compose/docker-compose.prod.yml` menjalankan seluruh service (`web`, `api`, `worker`, `postgres`, `redis`, `nginx`) dalam satu compose project. Cocok untuk VPS tanpa Coolify. TLS **tidak** disertakan — lihat §5. |

---

## 2. Prasyarat

- Docker & Docker Compose v2 di server target.
- Domain (opsional, wajib bila ingin HTTPS).
- Kredensial Google OAuth (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`) — tanpa ini, login tetap start tapi endpoint `/auth/google` menolak dengan 401.

---

## 3. Environment Variables

```bash
cp .env.example .env
```

Isi seluruh nilai pada `.env`. Yang **wajib** diisi untuk production (divalidasi saat API start — lihat §7):

| Variable | Keterangan |
| --- | --- |
| `DATABASE_URL` | Diisi otomatis dari `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` oleh `docker-compose.prod.yml`; isi ketiganya, bukan `DATABASE_URL` langsung. |
| `JWT_SECRET` | **Wajib diganti** dari nilai default `.env.example`. API menolak start bila `NODE_ENV=production` dan nilainya masih `change-me-in-production`. |
| `POSTGRES_PASSWORD` | Wajib diisi — compose menolak start bila kosong. |

Variable lain yang relevan untuk production:

| Variable | Keterangan |
| --- | --- |
| `NODE_ENV` | Set `production`. |
| `CORS_ORIGIN` | Domain publik frontend (mis. `https://app.example.com`). Diabaikan bila web & api disajikan lewat satu origin melalui Nginx (lihat `VITE_API_URL`). |
| `API_PUBLIC_URL` | Origin publik API (untuk membangun signed download URL) — mis. `https://app.example.com` bila di belakang Nginx reverse proxy yang sama. |
| `VITE_API_URL` | **Build-time**, bukan runtime (Vite menyisipkannya ke bundle statis saat `docker build`). Default compose: `/api/v1` (relatif, karena Nginx me-routing `/api/` ke API pada origin yang sama — menghindari CORS sepenuhnya). |
| `RATE_LIMIT_TTL_MS` / `RATE_LIMIT_LIMIT` | Opsional — default 120 request/60 detik per IP. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Diperlukan agar login Google berfungsi. |
| `FFMPEG_PATH` / `FFPROBE_PATH` | **Biarkan kosong** untuk Docker — image worker sudah memasang `ffmpeg` via `apk` dan di-PATH otomatis. `docker-compose.prod.yml` memaksa nilai ini kosong pada container worker meski `.env` berisi path lokal developer. |

`R2_*` (Cloudflare R2) belum diimplementasikan pada kode saat ini — storage hasil upload/optimasi memakai disk lokal (`UPLOAD_DIR`/`OUTPUT_DIR`) yang dipetakan ke Docker volume `storage_data` (lihat §6). Isi `R2_*` hanya bila fitur R2 sudah diimplementasikan pada fase berikutnya.

---

## 4. Deployment Steps (Docker Compose mandiri)

Sesuai [docs/11-deployment.md § Deployment Steps](docs/11-deployment.md):

```bash
# 1. Clone repository
git clone <repo-url> forkekan-mint && cd forkekan-mint

# 2–3. Salin & isi environment variable
cp .env.example .env
# edit .env — lihat §3

# 4. Build Docker image
docker compose -f infra/compose/docker-compose.prod.yml build

# 5. Jalankan migration database
docker compose -f infra/compose/docker-compose.prod.yml up -d postgres redis
docker compose -f infra/compose/docker-compose.prod.yml run --rm api \
  pnpm --filter @forkekan/api db:migrate:deploy

# 6. Seed data awal (Platform Presets)
docker compose -f infra/compose/docker-compose.prod.yml run --rm api \
  pnpm --filter @forkekan/api db:seed

# 7. Jalankan seluruh service
docker compose -f infra/compose/docker-compose.prod.yml up -d

# 8. Verifikasi aplikasi dapat diakses
curl -f http://localhost/api/v1/health
curl -f http://localhost/
```

Scaling worker (docs/11 — Scaling Strategy):

```bash
docker compose -f infra/compose/docker-compose.prod.yml up -d --scale worker=3
```

---

## 5. HTTPS / TLS

Blueprint menetapkan Let's Encrypt sebagai penyedia SSL. Dua opsi:

1. **Coolify** (direkomendasikan) — Traefik bawaan Coolify menerbitkan & memperbarui sertifikat otomatis. Tidak perlu konfigurasi tambahan pada `infra/nginx/nginx.prod.conf`.
2. **Docker Compose mandiri** — `infra/nginx/nginx.prod.conf` hanya mendengarkan port 80 (HTTP). Tempatkan reverse proxy TLS lain (mis. Caddy, atau certbot + Nginx `listen 443 ssl`) di depannya. Ini sengaja tidak disertakan agar tidak menerbitkan konfigurasi sertifikat yang tidak bisa diverifikasi tanpa domain nyata.

---

## 6. Persistent Data

| Volume | Isi | Wajib di-backup |
| --- | --- | --- |
| `postgres_data` | Database PostgreSQL | Ya — backup harian (docs/11) |
| `redis_data` | Queue BullMQ (AOF aktif) | Opsional — queue dapat dibangun ulang |
| `storage_data` | File upload & hasil optimasi (dipakai bersama container `api` dan `worker`) | Ya, selama R2 belum aktif |

Contoh backup database:

```bash
docker compose -f infra/compose/docker-compose.prod.yml exec postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-$(date +%F).sql
```

---

## 7. Production Readiness (Phase 10)

Ditambahkan pada fase ini, aktif otomatis saat `NODE_ENV=production`:

- **Environment validation** (`apps/api/src/config/env.validation.ts`) — API menolak start bila `DATABASE_URL`/`JWT_SECRET` kosong, `NODE_ENV` di luar `development|production|test`, atau `JWT_SECRET` masih nilai default `.env.example` saat `NODE_ENV=production`.
- **Health check** — `GET /api/v1/health` (docs/07) tidak berubah kontraknya; dikecualikan dari rate limiting agar tidak mengganggu healthcheck container/orchestrator.
- **Security middleware** — [Helmet](https://helmetjs.github.io/) (HTTP security headers) dan `compression` (gzip response) dipasang global di `main.ts`.
- **Rate limiting** — `@nestjs/throttler`, default 120 request/60 detik per IP (`RATE_LIMIT_TTL_MS`/`RATE_LIMIT_LIMIT`), menghasilkan `429 Too Many Requests` (sudah ada di kontrak docs/07 — HTTP Status Codes).
- **Logging** — `RequestLoggerMiddleware` mencatat setiap request selesai (method, path, status, durasi) lewat NestJS Logger.
- **Trust proxy** — API mempercayai satu hop reverse proxy (`app.set('trust proxy', 1)`) agar IP asli klien terbaca benar di belakang Nginx.

---

## 8. Production Checklist

Sesuai [docs/11-deployment.md § Production Checklist](docs/11-deployment.md):

- [ ] Semua migration berhasil (`db:migrate:deploy`)
- [ ] Semua environment variable terisi (API akan menolak start bila belum — lihat §7)
- [ ] HTTPS aktif (§5)
- [ ] `GET /api/v1/health` mengembalikan `{"status":"ok"}`
- [ ] Worker berjalan (`docker compose ... logs worker` menunjukkan job diproses)
- [ ] Redis aktif (`redis-cli ping` dari container)
- [ ] PostgreSQL aktif
- [ ] Google OAuth berfungsi (login end-to-end)

---

## 9. Rollback

```bash
# Kembali ke image sebelumnya (tag/commit tertentu)
git checkout <commit-sebelumnya>
docker compose -f infra/compose/docker-compose.prod.yml build
docker compose -f infra/compose/docker-compose.prod.yml up -d

# Rollback migration database bila diperlukan
docker compose -f infra/compose/docker-compose.prod.yml run --rm api \
  pnpm --filter @forkekan/api exec prisma migrate resolve --rolled-back <migration-name>
```

Verifikasi `GET /api/v1/health` sebelum membuka akses publik kembali.

---

## 10. Monitoring

Blueprint menetapkan pemantauan CPU, memory, disk usage, queue length, worker status, koneksi database, dan response time API. Tersedia langsung tanpa service tambahan:

- **Container**: `docker stats`, `docker compose ... logs -f`.
- **Aplikasi**: log terstruktur dari `RequestLoggerMiddleware` (§7) via `docker compose ... logs api`.
- **Queue/Worker**: `docker compose ... logs worker`, atau `redis-cli -h <redis-host> llen bull:video-processing:wait` untuk panjang antrian.
- **Admin Panel** (Phase 9) — `GET /admin/dashboard` dan `GET /admin/storage` memberi ringkasan total user/upload/job dan storage terpakai lewat UI.

Integrasi APM/dashboard eksternal (Grafana, Sentry, dll.) belum diimplementasikan — lihat TODO pada laporan Phase 10.
