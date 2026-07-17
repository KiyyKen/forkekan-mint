# Deployment

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan strategi deployment Forkekan-mint pada environment production.

Deployment dirancang agar:

- Mudah dideploy
- Mudah di-maintain
- Mudah di-scale
- Mendukung Continuous Deployment

---

# Technology Stack

Hosting

- VPS

Container

- Docker

Container Management

- Coolify

Reverse Proxy

- Nginx

Database

- PostgreSQL

Cache

- Redis

Queue

- BullMQ

Storage

- Cloudflare R2

SSL

- Let's Encrypt

---

# Production Architecture

```text
                    Internet
                        │
                        ▼
                  Nginx Reverse Proxy
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   React Frontend                NestJS API
                                       │
                 ┌─────────────────────┼────────────────────┐
                 ▼                     ▼                    ▼
           PostgreSQL              Redis              BullMQ Queue
                                                          │
                                                          ▼
                                                     Worker Service
                                                          │
                                                          ▼
                                                        FFmpeg
                                                          │
                                                          ▼
                                                   Cloudflare R2
```

---

# Services

## Frontend

Framework

- React
- Vite

Port

```
3000
```

---

## Backend

Framework

- NestJS

Port

```
4000
```

---

## Database

Engine

- PostgreSQL

Port

```
5432
```

---

## Redis

Port

```
6379
```

---

## Worker

Tugas

- Video Encoding
- Thumbnail Generation
- Metadata Extraction

Worker dapat dijalankan lebih dari satu instance.

---

# Environment Variables

Contoh

```env
APP_NAME=Forkekan-mint

NODE_ENV=production

DATABASE_URL=

REDIS_URL=

JWT_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=

R2_ACCOUNT_ID=

R2_ACCESS_KEY=

R2_SECRET_KEY=

R2_BUCKET=
```

---

# Docker Services

```text
docker-compose

frontend

backend

worker

postgres

redis

nginx
```

---

# Persistent Data

Data yang harus dipertahankan

- PostgreSQL
- Redis (opsional)
- Upload sementara (jika menggunakan local storage)

Cloudflare R2 digunakan sebagai penyimpanan utama file video.

---

# Deployment Steps

1. Clone repository
2. Salin `.env.example` menjadi `.env`
3. Isi seluruh environment variable
4. Build Docker image
5. Jalankan migration database
6. Seed data awal
7. Jalankan seluruh service
8. Verifikasi aplikasi dapat diakses

---

# CI/CD

Workflow

```text
Push

↓

GitHub

↓

Build

↓

Test

↓

Deploy

↓

Production
```

---

# Health Check

Endpoint

```
GET /api/v1/health
```

Digunakan untuk memastikan backend berjalan dengan baik.

---

# Backup Strategy

Database

- Backup harian

Storage

- Mengandalkan redundansi Cloudflare R2

Konfigurasi

- Simpan `.env.example`
- Jangan commit file `.env`

---

# Logging

Application

- NestJS Logger

Worker

- Processing Logs

Container

- Docker Logs

---

# Scaling Strategy

Jika jumlah pengguna meningkat:

- Tambah Worker
- Tambah Instance Backend
- Gunakan Load Balancer
- Tingkatkan spesifikasi PostgreSQL
- Optimalkan Redis

Frontend bersifat stateless sehingga mudah diperbanyak.

---

# Security

- HTTPS Only
- Secure Environment Variables
- JWT Authentication
- Rate Limiting
- Reverse Proxy
- File Validation
- Signed Download URL

---

# Monitoring

Hal yang dipantau

- CPU
- Memory
- Disk Usage
- Queue Length
- Worker Status
- Database Connection
- API Response Time

---

# Rollback Strategy

Jika deployment gagal:

- Gunakan image Docker versi sebelumnya
- Jalankan rollback database jika diperlukan
- Verifikasi health check sebelum membuka akses publik

---

# Production Checklist

Sebelum release:

- Semua migration berhasil
- Semua environment variable tersedia
- HTTPS aktif
- Health check berhasil
- Worker berjalan
- Redis aktif
- PostgreSQL aktif
- Cloudflare R2 terhubung
- Google OAuth berfungsi

---

# Future Improvements

- Multi Region Deployment
- CDN
- Auto Scaling
- Blue-Green Deployment
- Zero Downtime Deployment

---

# Closing

Deployment Forkekan-mint menggunakan pendekatan containerized architecture sehingga setiap komponen dapat dikelola secara independen. Dengan memanfaatkan Docker, Coolify, PostgreSQL, Redis, BullMQ, dan Cloudflare R2, aplikasi dapat dijalankan secara konsisten di berbagai environment serta lebih mudah dipelihara dan dikembangkan di masa depan.