# API Specification

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini mendefinisikan REST API yang digunakan oleh Forkekan-mint.

Base URL

```
/api/v1
```

Response Format

Seluruh endpoint menggunakan format JSON yang konsisten.

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {}
}
```

---

# Authentication

Authentication menggunakan JWT.

Header

```
Authorization: Bearer <token>
```

Endpoint publik tidak memerlukan token.

---

# Health

## GET /health

Deskripsi

Mengecek status server.

Response

```json
{
  "status": "ok"
}
```

---

# Authentication

## POST /auth/google

Login menggunakan Google OAuth.

Response

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

---

## GET /auth/me

Mengambil informasi user yang sedang login.

Authentication

Required

Response

```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "avatarUrl": "...",
  "role": "USER"
}
```

---

## POST /auth/logout

Logout.

Authentication

Required

Response

```json
{
  "success": true
}
```

---

# Upload

## POST /uploads

Upload video.

Authentication

Optional

Request

multipart/form-data

Fields

- video

Maksimum

500 MB

Response

```json
{
  "uploadId": "...",
  "status": "uploaded"
}
```

---

## GET /uploads/{id}

Melihat detail upload.

Response

```json
{
  "id": "...",
  "status": "uploaded",
  "mediaFileId": "...",
  "createdAt": "2026-07-16T12:00:00Z"
}
```

---

# Video Analysis

## GET /videos/{id}/analysis

Mengambil metadata video.

Response

```json
{
  "duration": 32,
  "resolution": "1920x1080",
  "codec": "H264",
  "fps": 30,
  "bitrate": 4000,
  "audioCodec": "AAC"
}
```

---

# Platform Presets

## GET /presets

Mengambil seluruh preset optimasi.

Response

```json
[
  {
    "id": 1,
    "name": "WhatsApp Story",
    "slug": "whatsapp-story",
    "resolution": "720x1280"
  },
  {
    "id": 2,
    "name": "Instagram Reels",
    "slug": "instagram-reels",
    "resolution": "1080x1920"
  }
]
```

---

# Processing

## POST /processing

Membuat job optimasi.

Request

```json
{
  "uploadId": "...",
  "presetId": 1
}
```

Response

```json
{
  "jobId": "...",
  "status": "waiting"
}
```

---

## GET /processing/{jobId}

Melihat status processing.

Response

```json
{
  "status": "processing",
  "progress": 67,
  "currentStep": "Encoding",
  "estimatedRemaining": "12s"
}
```

Status

- waiting
- processing
- completed
- failed

---

## GET /processing/{jobId}/result

Mengambil hasil optimasi.

Response

```json
{
  "downloadUrl": "...",
  "thumbnail": "...",
  "size": "18 MB",
  "resolution": "1280x720",
  "codec": "H264"
}
```

---

# Download

## GET /downloads/{resultId}

Menghasilkan Signed URL untuk mengunduh hasil optimasi.

Authentication

Optional

Response

```json
{
  "downloadUrl": "...",
  "expiresIn": 300
}
```

---

# History

Authentication

Required

## GET /history

Mengambil riwayat optimasi milik pengguna.

Query Parameters

```
?page=1
?limit=10
?search=
?platform=
?status=
?sort=createdAt
?order=desc
```

Response

```json
[
  {
    "id": "...",
    "preset": "WhatsApp Story",
    "status": "completed",
    "createdAt": "2026-07-16T10:30:00Z"
  }
]
```

---

## DELETE /history/{id}

Menghapus riwayat optimasi.

Response

```json
{
  "success": true
}
```

---

# Favorite Presets

Authentication

Required

## GET /favorites

Mengambil daftar preset favorit pengguna.

Query Parameters

```
?page=1
?limit=10
```

Response

```json
[
  {
    "id": 1,
    "name": "WhatsApp Story"
  }
]
```

---

## POST /favorites

Menambahkan preset ke daftar favorit.

Request

```json
{
  "presetId": 2
}
```

Response

```json
{
  "success": true
}
```

---

## DELETE /favorites/{id}

Menghapus preset dari daftar favorit.

Response

```json
{
  "success": true
}
```

---

# AI Recommendation

## POST /ai/recommendation

Menghasilkan rekomendasi preset berdasarkan metadata video.

Request

```json
{
  "uploadId": "..."
}
```

Response

```json
{
  "compatibilityScore": 92,
  "recommendedPreset": {
    "id": 2,
    "name": "WhatsApp Story"
  },
  "reason": "Bitrate terlalu tinggi untuk WhatsApp."
}
```

---

# Admin

Authentication

Required

Role

```
ADMIN
```

---

## GET /admin/dashboard

Mengambil statistik dashboard admin.

Response

```json
{
  "totalUsers": 120,
  "totalUploads": 985,
  "totalJobs": 963,
  "storageUsed": "128 GB"
}
```

---

## GET /admin/jobs

Mengambil seluruh processing job.

Query Parameters

```
?page=1
?limit=20
?status=
?worker=
?search=
```

Response

```json
[
  {
    "jobId": "...",
    "status": "processing",
    "worker": "worker-1",
    "progress": 67
  }
]
```

---

## GET /admin/storage

Mengambil statistik penggunaan storage.

Response

```json
{
  "used": "128 GB",
  "available": "872 GB"
}
```

---

## GET /admin/users

Mengambil daftar pengguna.

Query Parameters

```
?page=1
?limit=20
?search=
```

Response

```json
[
  {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

# HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 413 | Payload Too Large |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# Validation Rules

## Upload

- Maksimum 500 MB
- Format MP4, MOV, AVI, MKV, WEBM
- File wajib berupa video

---

## Processing

- Preset harus valid
- Upload harus tersedia
- Job tidak boleh diproses dua kali secara bersamaan

---

# API Versioning

Seluruh endpoint menggunakan prefix

```
/api/v1
```

Perubahan besar akan menggunakan

```
/api/v2
```

---

# Security

- JWT Authentication
- HTTPS Only
- Rate Limiting
- File Validation
- Signed Download URL
- Input Validation
- CORS Protection

---

# Design Principles

API dirancang mengikuti prinsip:

- RESTful
- Stateless
- Consistent Response
- Versioned
- Easy to Maintain
- Predictable Error Handling

---

# Closing

Dokumen ini menjadi kontrak resmi antara frontend, backend, dan worker.

Seluruh endpoint, request, response, status code, serta aturan validasi yang didefinisikan pada dokumen ini harus dijadikan acuan implementasi agar integrasi antar komponen tetap konsisten, mudah dipelihara, dan siap dikembangkan pada versi berikutnya.