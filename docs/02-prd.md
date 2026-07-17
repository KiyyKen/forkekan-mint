# Product Requirements Document (PRD)

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Purpose

Dokumen ini menjelaskan seluruh kebutuhan sistem Forkekan-mint yang akan menjadi acuan utama selama proses pengembangan.

Semua fitur, alur, serta kebutuhan teknis harus mengacu pada dokumen ini.

---

# Product Goal

Membantu pengguna mengoptimalkan video agar tetap memiliki kualitas terbaik ketika dibagikan ke berbagai platform media sosial tanpa harus memahami proses encoding video.

---

# Target Platform

Web Application

Responsive

Desktop First

Mobile Friendly

---

# User Roles

## Guest

Guest dapat:

- Upload video
- Memilih platform tujuan
- Melakukan optimasi
- Preview hasil
- Download hasil
- Melihat progress processing

Guest tidak dapat:

- Menyimpan history
- Menyimpan preset
- Melihat riwayat processing

---

## Registered User

Semua fitur Guest ditambah:

- Login
- Upload History
- Favorite Presets
- Saved Result
- Download ulang
- Profile

---

## Administrator

Administrator dapat:

- Melihat seluruh user
- Mengelola processing queue
- Monitoring storage
- Monitoring worker
- Monitoring analytics
- Melihat log sistem

---

# Functional Requirements

## Authentication

Priority: Medium

Features:

- Login Google
- Logout
- Session Management

Future:

- Email Login

---

## Upload Video

Priority: High

Requirements:

- Drag & Drop
- File Picker
- Progress Upload
- Cancel Upload
- Retry Upload

Catatan

Pada versi MVP, pengguna hanya dapat mengunggah satu video dalam satu proses optimasi untuk menjaga alur tetap sederhana dan fokus.

Future Version

- Multiple Upload (Batch Upload)

Supported Format:

- MP4
- MOV
- MKV
- WEBM

Maximum Size

500 MB

---

## Video Validation

System harus melakukan validasi:

- Format
- Size
- Corrupted Video
- Duration

Jika gagal, tampilkan pesan yang jelas kepada pengguna.

---

## Platform Selection

User dapat memilih target platform:

- WhatsApp Story
- WhatsApp Chat
- Instagram Story
- Instagram Reels
- TikTok
- Telegram
- Discord
- Facebook Story
- YouTube Shorts

---

## Video Analysis

System harus membaca metadata video:

- Resolution
- FPS
- Codec
- Bitrate
- Duration
- Audio Codec
- Audio Bitrate

---

## Compatibility Score

System memberikan skor kompatibilitas.

Contoh:

WhatsApp Story

98%

Instagram

83%

TikTok

95%

---

## Smart Recommendation

System memberikan rekomendasi preset terbaik sesuai platform tujuan.

---

## Optimization

System akan:

- Menyesuaikan codec
- Menyesuaikan bitrate
- Menyesuaikan resolution
- Menyesuaikan frame rate
- Mengoptimalkan audio

Menggunakan FFmpeg.

---

## Processing Queue

Semua proses encoding berjalan di background.

User dapat melihat:

- Waiting
- Processing
- Completed
- Failed

---

## Realtime Progress

Progress harus tampil realtime.

Contoh:

Uploading

Encoding

Optimizing

Generating Preview

Done

---

## Preview

User dapat melihat hasil video sebelum didownload.

---

## Compare

User dapat membandingkan:

Original

vs

Optimized

Menggunakan slider comparison.

---

## Download

User dapat mendownload hasil optimasi.

Guest:

Download sekali.

Registered:

Download kapan saja melalui History.

---

## History

Registered User dapat:

- Search
- Filter
- Download ulang
- Delete History

---

## Favorite Preset

Registered User dapat menyimpan preset favorit.

---

## AI Assistant

AI digunakan untuk:

- Menjelaskan penyebab video burik.
- Menjelaskan metadata video.
- Memberikan rekomendasi optimasi.

AI tidak melakukan encoding video.

---

# Non Functional Requirements

## Performance

Upload harus responsif.

Progress realtime.

Processing berjalan pada background worker.

---

## Scalability

System harus mendukung:

- Multiple Worker
- Queue
- Horizontal Scaling

---

## Security

- Rate Limiting
- File Validation
- Secure Upload
- Signed URL
- HTTPS
- CSRF Protection

---

## Reliability

Jika processing gagal:

- Retry otomatis.
- Menampilkan penyebab kegagalan.

---

## Availability

Target uptime:

99%

---

## Storage

Guest:

Hasil processing disimpan maksimal 24 jam.

Registered User:

History disimpan.

File hasil optimasi memiliki masa simpan (misalnya 30 hari) agar storage tetap efisien.

---

# Tech Stack

Frontend

- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Zustand

Backend

- NestJS

Database

- PostgreSQL

ORM

- Prisma

Queue

- BullMQ

Cache

- Redis

Storage

- Cloudflare R2

Video Engine

- FFmpeg

AI

- Gemini 2.5 Flash

Deployment

- Docker

---

# Future Features

- Batch Processing
- Folder Upload
- API
- Team Workspace
- Mobile App
- Desktop App
- Browser Extension
- Premium Queue

---

# Success Criteria

MVP dianggap berhasil apabila pengguna dapat:

✅ Upload video

✅ Memilih platform tujuan

✅ Melihat Compatibility Score

✅ Mengoptimalkan video

✅ Melihat progress realtime

✅ Membandingkan hasil

✅ Mendownload hasil dengan mudah

Tanpa perlu memahami istilah teknis video encoding.

---

# Out of Scope (MVP)

Fitur berikut tidak termasuk pada versi pertama:

- Video Editing
- Subtitle Editor
- AI Video Generation
- Video Template
- Timeline Editing
- Video Effects
- Video Collaboration
- Livestream Processing

---

# Closing Statement

Forkekan-mint dibangun dengan prinsip:

> Sederhana bagi pengguna.

> Kuat di balik layar.

Target utama aplikasi bukan sekadar mengubah video, tetapi memberikan pengalaman optimasi video yang cepat, mudah, dan menyenangkan.

"4K kan min!"