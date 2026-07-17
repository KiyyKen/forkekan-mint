# User Flow

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan seluruh alur interaksi pengguna ketika menggunakan Forkekan-mint.

User Flow dibuat agar pengalaman pengguna tetap sederhana meskipun proses optimasi video di belakang layar cukup kompleks.

---

# User Journey

Pengguna memiliki tujuan utama:

> Mengoptimalkan video agar tidak burik ketika diupload ke platform tertentu.

Alur pengguna dibuat sesingkat mungkin.

Target maksimal:

Upload → Optimize → Download

---

# Guest User Flow

```
Landing Page

↓

Klik Upload

↓

Pilih Video

↓

Video Validation

↓

Video Analysis

↓

Compatibility Score

↓

Pilih Platform

↓

Optimize

↓

Realtime Progress

↓

Preview Result

↓

Download

↓

Done
```

---

# Registered User Flow

```
Landing Page

↓

Login

↓

Dashboard

↓

Upload Video

↓

Video Analysis

↓

Compatibility Score

↓

Pilih Platform

↓

Optimize

↓

Realtime Progress

↓

Preview

↓

Download

↓

History

↓

Logout
```

---

# Administrator Flow

```
Login

↓

Admin Dashboard

↓

Monitoring Queue

↓

Monitoring Worker

↓

Analytics

↓

Storage

↓

System Logs

↓

User Management
```

---

# Landing Page Flow

Landing Page menampilkan:

- Hero Section
- Upload Button
- Cara Kerja
- Supported Platforms
- FAQ
- Footer

CTA utama:

Upload Video

---

# Upload Flow

User dapat:

- Drag & Drop
- Klik Upload
- Memilih beberapa video
- Membatalkan upload
- Mengulang upload jika gagal

Setelah upload berhasil:

↓

Video Analysis

---

# Video Analysis Flow

System membaca metadata video:

- Resolution
- Codec
- FPS
- Bitrate
- Duration

Kemudian menghasilkan:

- Compatibility Score
- Smart Recommendation

---

# Platform Selection Flow

User memilih tujuan upload.

Pilihan:

- WhatsApp Story
- WhatsApp Chat
- Instagram Story
- Instagram Reels
- TikTok
- Telegram
- Discord
- Facebook Story
- YouTube Shorts

↓

Optimize

---

# Optimization Flow

System:

↓

Masuk Queue

↓

Worker mengambil job

↓

FFmpeg Processing

↓

Generate Preview

↓

Store Result

↓

Done

---

# Processing Flow

Selama processing berlangsung, user melihat progress realtime.

Tahapan:

Waiting

↓

Preparing

↓

Encoding

↓

Optimizing

↓

Generating Preview

↓

Finalizing

↓

Completed

Jika gagal:

↓

Failed

↓

Retry

---

# Preview Flow

User dapat:

- Memutar video hasil
- Melihat metadata hasil
- Membandingkan sebelum dan sesudah

Pilihan:

- Download
- Optimize Again

---

# Download Flow

Guest:

↓

Download

↓

Selesai

Registered User:

↓

Download

↓

History otomatis tersimpan

---

# History Flow

Registered User dapat:

- Search
- Filter
- Download ulang
- Delete History

---

# AI Flow

AI hanya membantu menjelaskan hasil analisis.

Contoh:

Video Quality

78 / 100

Penyebab:

- Bitrate terlalu rendah
- FPS kurang ideal
- Codec kurang sesuai

Rekomendasi:

Optimize untuk WhatsApp Story

---

# Error Flow

Jika upload gagal:

↓

Tampilkan alasan

↓

Retry

---

Jika processing gagal:

↓

Retry

↓

Hubungi Administrator jika terus gagal

---

# Empty State Flow

Jika belum ada upload:

Tampilkan ilustrasi.

Pesan:

> Belum ada video.

> Upload dulu, biar gak burik.

---

# Success Flow

Setelah berhasil:

Tampilkan:

✅ Processing selesai

Video siap diunduh.

CTA:

Download Video

---

# Future User Flow

Versi berikutnya akan mendukung:

- Batch Processing
- Cloud Queue
- API Upload
- Browser Extension
- Mobile Application

---

# UX Principles

Forkekan-mint mengikuti prinsip:

- Sesedikit mungkin klik.
- Bahasa mudah dipahami.
- Tidak menggunakan istilah teknis yang membingungkan.
- Progress selalu terlihat.
- User selalu tahu apa yang sedang terjadi.

---

# End Goal

Pengguna dapat:

Upload video.

↓

Pilih platform.

↓

Klik Optimize.

↓

Download.

Tanpa harus memahami proses encoding maupun konfigurasi video.

> Anti Video Burik.

> "4K kan min!"