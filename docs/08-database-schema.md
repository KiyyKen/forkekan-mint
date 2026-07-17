# Database Schema

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan implementasi skema database menggunakan Prisma ORM.

Database

- PostgreSQL

ORM

- Prisma ORM

Tujuan

- Menjadi acuan implementasi `schema.prisma`
- Menjaga konsistensi struktur database
- Mempermudah migration dan maintenance

---

# Prisma Generator

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

# Model Overview

```text
User
│
├── Upload
│      │
│      └── MediaFile
│              │
│              ├── StorageObject
│              │
│              └── ProcessingJob
│                        │
│                        ├── ProcessingResult
│                        └── ProcessingLog
│
├── FavoritePreset
│
└── Download

PlatformPreset
```

---

# UUID Strategy

Semua Primary Key menggunakan

```prisma
id String @id @default(cuid())
```

Alasan

- Aman digunakan pada URL
- Sulit ditebak
- Cocok untuk distributed system

---

# Timestamp Strategy

Semua model memiliki

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# Models

> **Catatan**
>
> Model berikut merupakan blueprint implementasi `schema.prisma`.
> Implementasi akhir dapat mengalami penyesuaian kecil selama pengembangan, namun struktur inti, relasi, dan prinsip desain harus tetap konsisten dengan ERD.

---

## User

```prisma
model User {
  id          String             @id @default(cuid())

  name        String
  email       String             @unique

  avatarUrl   String?

  provider    String
  providerId  String             @unique

  role        UserRole           @default(USER)

  uploads     Upload[]
  downloads   Download[]
  favorites   FavoritePreset[]

  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}
```

Menyimpan akun pengguna.

Relasi

- Upload
- Download
- FavoritePreset

---

## Upload

```prisma
model Upload {
  id          String        @id @default(cuid())

  userId      String?
  user        User?         @relation(fields: [userId], references: [id], onDelete: Cascade)

  status      UploadStatus

  ipAddress   String?

  userAgent   String?

  mediaFile   MediaFile?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

Representasi aktivitas upload.

Satu upload memiliki satu media file.

---

## MediaFile

```prisma
model MediaFile {
  id                String      @id @default(cuid())

  uploadId          String      @unique
  upload            Upload      @relation(fields: [uploadId], references: [id], onDelete: Cascade)

  originalFilename  String

  storedFilename    String

  mimeType          String

  fileSize          BigInt

  width             Int

  height            Int

  duration          Float

  fps               Float

  bitrate           Int

  codec             String

  audioCodec        String

  audioBitrate      Int

  thumbnailPath     String?

  storageObject     StorageObject?

  processingJobs    ProcessingJob[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Menyimpan metadata video.

Tidak menyimpan file fisik.

---

## StorageObject

```prisma
model StorageObject {
  id            String      @id @default(cuid())

  mediaFileId   String      @unique
  mediaFile     MediaFile   @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)

  disk          String

  bucket        String

  objectKey     String

  checksum      String?

  visibility    String

  expiresAt     DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

Representasi file pada Cloudflare R2.

---

## PlatformPreset

```prisma
model PlatformPreset {
  id                   String      @id @default(cuid())

  name                 String

  slug                 String      @unique

  description          String?

  targetResolution     String

  targetCodec          String

  targetFps            Float

  targetBitrate        Int

  targetAudioCodec     String

  targetAudioBitrate   Int

  processingJobs       ProcessingJob[]

  favorites            FavoritePreset[]

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

Preset optimasi.

Contoh

- WhatsApp Story
- Instagram Story
- TikTok
- Telegram

---

## ProcessingJob

```prisma
model ProcessingJob {
  id              String      @id @default(cuid())

  mediaFileId     String
  mediaFile       MediaFile   @relation(fields: [mediaFileId], references: [id], onDelete: Cascade)

  presetId        String
  preset          PlatformPreset @relation(fields: [presetId], references: [id])

  queueName       String

  workerName      String?

  status          JobStatus

  progress        Int

  startedAt       DateTime?

  finishedAt      DateTime?

  failedReason    String?

  result          ProcessingResult?

  logs            ProcessingLog[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, createdAt])
}
```

Queue encoding.

Status

- waiting
- processing
- completed
- failed

---

## ProcessingResult

```prisma
model ProcessingResult {
  id                  String      @id @default(cuid())

  processingJobId     String      @unique
  processingJob       ProcessingJob @relation(fields: [processingJobId], references: [id], onDelete: Cascade)

  outputFilename      String

  outputSize          BigInt

  outputResolution    String

  outputCodec         String

  outputBitrate       Int

  processingTime      Int

  previewThumbnail    String?

  downloads           Download[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

Hasil encoding.

Satu ProcessingJob menghasilkan satu ProcessingResult.

---

## ProcessingLog

```prisma
model ProcessingLog {
  id               String      @id @default(cuid())

  processingJobId  String
  processingJob    ProcessingJob @relation(fields: [processingJobId], references: [id], onDelete: Cascade)

  level            LogLevel

  message          String

  createdAt        DateTime @default(now())
}
```

Log yang dihasilkan worker selama proses encoding.

---

## Download

```prisma
model Download {
  id                   String      @id @default(cuid())

  userId               String
  user                 User @relation(fields: [userId], references: [id], onDelete: Cascade)

  processingResultId   String
  processingResult     ProcessingResult @relation(fields: [processingResultId], references: [id], onDelete: Cascade)

  downloadedAt         DateTime @default(now())
}
```

Riwayat download hasil optimasi.

---

## FavoritePreset

```prisma
model FavoritePreset {
  id          String @id @default(cuid())

  userId      String
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

  presetId    String
  preset      PlatformPreset @relation(fields: [presetId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@unique([userId, presetId])
}
```

Preset favorit milik pengguna.

---

# Enum

## UserRole

```prisma
enum UserRole {
  USER
  ADMIN
}
```

---

## UploadStatus

```prisma
enum UploadStatus {
  UPLOADING
  UPLOADED
  FAILED
}
```

---

## JobStatus

```prisma
enum JobStatus {
  WAITING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## LogLevel

```prisma
enum LogLevel {
  INFO
  WARNING
  ERROR
}
```

---

# Index Strategy

Unique

- User.email
- User.providerId
- PlatformPreset.slug
- Upload.id
- MediaFile.uploadId
- StorageObject.mediaFileId
- ProcessingResult.processingJobId

Index

- Upload.userId
- MediaFile.uploadId
- ProcessingJob.mediaFileId
- ProcessingJob.status
- ProcessingJob.presetId
- Download.userId
- FavoritePreset.userId

Composite Index

```prisma
@@index([status, createdAt])
```

Digunakan pada `ProcessingJob` untuk mempercepat monitoring queue.

---

# Cascade Rules

Apabila User dihapus

↓

Upload ikut dihapus

↓

MediaFile ikut dihapus

↓

StorageObject ikut dihapus

↓

ProcessingJob ikut dihapus

↓

ProcessingResult ikut dihapus

↓

ProcessingLog ikut dihapus

↓

Riwayat Download ikut dihapus.

---

# Soft Delete

Saat ini

Tidak digunakan.

File yang telah melewati masa retensi akan dihapus menggunakan scheduled cleanup job.

---

# Migration Strategy

Perubahan struktur database dilakukan menggunakan Prisma Migration.

Development

```bash
pnpm prisma migrate dev
```

Production

```bash
pnpm prisma migrate deploy
```

---

# Seed Strategy

Data awal yang perlu disediakan

- Admin
- Platform Presets

Contoh Platform Preset

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

# Design Principles

- Normalize First
- Explicit Relations
- UUID Primary Keys
- Enum for Status
- Consistent Naming
- No Business Logic di Database
- Referential Integrity
- Keep Database Simple

---

# Future Models

Apabila fitur berkembang, model berikut dapat ditambahkan tanpa mengubah struktur inti.

- Notification
- Subscription
- AuditLog
- AnalyticsEvent
- ApiKey
- Team
- TeamMember

---

# Closing

Dokumen ini menjadi acuan implementasi `schema.prisma`.

Seluruh model, relasi, enum, dan strategi migrasi yang didefinisikan di dalam dokumen ini bertujuan menjaga konsistensi struktur database selama proses pengembangan. Implementasi akhir dapat berkembang sesuai kebutuhan produk, namun perubahan harus tetap dilakukan melalui Prisma Migration agar riwayat perubahan terdokumentasi dengan baik dan seluruh environment tetap sinkron.