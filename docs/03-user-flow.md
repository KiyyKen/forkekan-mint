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

Pilih Platform (default: WhatsApp Story)

↓

(Opsional) AI Fine-Tune

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

Pilih Platform (default: WhatsApp Story)

↓

(Opsional) AI Fine-Tune

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

Metadata ini dipakai untuk validasi upload dan, bila user mengaktifkan AI
Fine-Tune, untuk menghitung saran penyesuaian parameter (lihat AI Flow).
Tidak ada skor atau rekomendasi yang dihasilkan otomatis di langkah ini.

---

# Platform Selection Flow

Fokus utama produk: optimasi untuk **WhatsApp Story**, dipilih otomatis
sebagai default dengan badge "Direkomendasikan". Platform lain tetap
didukung penuh sebagai pilihan sekunder di bawah "Platform lainnya".

User memilih platform tujuan (dapat langsung memakai default atau mengganti):

Platform utama:

- WhatsApp Story (default)
- Instagram Story
- TikTok
- Discord
- Telegram
- YouTube Shorts

Platform lainnya:

- WhatsApp Chat
- Instagram Reels
- Facebook Story

↓

(Opsional) AI Fine-Tune

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

AI bersifat opsional dan hanya aktif setelah user memilih platform sendiri
(lihat Platform Selection Flow). AI tidak pernah memilih atau mengganti
platform — perannya terbatas menyesuaikan sebagian kecil parameter encoding
pada Platform Profile yang sudah dipilih:

- CRF
- Bitrate
- FPS
- Scale

User menyalakan toggle "AI Fine-Tune" (opsional, mati secara default).
Sistem menghitung saran deterministik dari metadata video dibanding target
platform, lalu menerapkannya otomatis dengan ringkasan singkat + alasan.

Contoh:

AI menyesuaikan: CRF 21 · 24fps

Alasan:

- Bitrate sumber lebih rendah dari target
- FPS sumber lebih rendah dari target

User dapat menekan "Reset ke default platform" kapan saja untuk kembali ke
Platform Profile apa adanya.

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