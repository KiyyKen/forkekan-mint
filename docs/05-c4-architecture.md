# C4 Architecture

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan arsitektur sistem Forkekan-mint menggunakan pendekatan C4 Model.

Tujuan:

- Memudahkan developer memahami sistem.
- Menjelaskan hubungan antar komponen.
- Menjadi acuan implementasi.

---

# Level 1 — System Context

```text
                    +----------------------+
                    |        User          |
                    +----------+-----------+
                               |
                               |
                               v
                   +-------------------------+
                   |     Forkekan-mint       |
                   | Anti Video Burik        |
                   +-----------+-------------+
                               |
      +------------------------+--------------------------+
      |                        |                          |
      v                        v                          v

 Gemini AI             Cloudflare R2               Google OAuth

```

## External Systems

### Google OAuth

Digunakan untuk login.

---

### Gemini AI

Memberikan penjelasan hasil analisis video.

Tidak melakukan encoding.

---

### Cloudflare R2

Menyimpan file video.

---

### Browser

Mengakses aplikasi.

---

# Level 2 — Container Diagram

```text

                +----------------------+
                |    React Frontend    |
                +----------+-----------+
                           |
                    REST API / HTTPS
                           |
                           v
                +----------------------+
                |     NestJS API       |
                +----+-----------+-----+
                     |           |
                     |           |
                     |           |
                     v           v

             PostgreSQL      Redis

                     |
                     |
                     v

                BullMQ Queue

                     |

                     v

             Processing Worker

                     |

                     v

                  FFmpeg

                     |

                     v

             Cloudflare R2

```

---

## Containers

### React

Frontend.

Bertanggung jawab terhadap:

- UI
- Upload
- Dashboard
- History
- Progress

---

### NestJS

Backend API.

Mengelola:

- Authentication
- Upload
- Queue
- History
- Preset
- AI

---

### PostgreSQL

Database utama.

---

### Redis

Queue dan cache.

---

### BullMQ

Mengelola background job.

---

### Worker

Menjalankan proses FFmpeg.

---

### FFmpeg

Melakukan optimasi video.

---

### Cloudflare R2

Media Storage.

---

# Level 3 — Backend Components

```text

NestJS

│

├── Auth Module

├── User Module

├── Upload Module

├── Video Module

├── Processing Module

├── Preset Module

├── AI Module

├── History Module

├── Download Module

├── Admin Module

└── Health Module

```

---

## Auth Module

- Login
- Session
- Authorization

---

## Upload Module

- Upload
- Validation
- Metadata

---

## Video Module

- Video Detail
- Preview
- Compare

---

## Processing Module

- Queue
- Worker
- Progress

---

## Preset Module

- Platform Presets

---

## AI Module

- Video Explanation
- Recommendation

---

## History Module

- Upload History

---

## Download Module

- Download Result

---

## Admin Module

- Analytics
- Queue Monitoring
- Storage

---

## Health Module

Monitoring.

---

# Level 4 — Processing Flow

```text

User

↓

Upload Video

↓

NestJS

↓

Validation

↓

Save Metadata

↓

Upload Storage

↓

Create Queue Job

↓

BullMQ

↓

Worker

↓

FFmpeg

↓

Save Result

↓

Update Database

↓

Realtime Progress

↓

Completed

↓

Download

```

---

# Communication

Frontend

↓

REST API

↓

NestJS

↓

BullMQ

↓

Worker

↓

FFmpeg

↓

Storage

↓

Frontend

---

# Security

- HTTPS
- JWT Session
- Rate Limit
- Secure Upload
- Signed URL
- Validation

---

# Scalability

Semua Worker dapat ditambah tanpa mengubah API.

Misalnya

Worker 1

Worker 2

Worker 3

Worker 4

Semuanya mengambil job dari Queue.

---

# Deployment

```text

Internet

↓

Nginx

↓

React

↓

NestJS

↓

Redis

↓

PostgreSQL

↓

Worker

↓

FFmpeg

↓

Cloudflare R2

```

---

# Design Principles

Forkekan-mint mengikuti prinsip:

- Modular
- Decoupled
- Scalable
- Maintainable
- Observable

---

# Future Architecture

Versi berikutnya dapat menambahkan:

- CDN
- Image Optimization
- Notification Service
- Analytics Service
- API Gateway
- Mobile API

Tanpa mengubah arsitektur utama.

---

# Closing

Forkekan-mint menggunakan arsitektur modern yang memisahkan frontend, backend, processing worker, storage, dan AI service sehingga mudah dikembangkan, dipelihara, dan diskalakan seiring bertambahnya pengguna.