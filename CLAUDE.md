# CLAUDE.md

# Forkekan-mint

> AI-powered video optimization platform.
>
> "Anti Video Burik."

---

# Project Goal

Forkekan-mint adalah platform untuk mengoptimalkan video agar sesuai dengan berbagai platform (WhatsApp, Instagram, TikTok, Telegram, Discord, dll.) menggunakan AI Recommendation dan FFmpeg.

Project ini dibangun sebagai portfolio production-grade.

Seluruh implementasi harus mengikuti blueprint pada folder `docs`.

---

# Mandatory Reading

Sebelum mengimplementasikan fitur apa pun, WAJIB membaca dokumen berikut.

1. docs/01-product-overview.md
2. docs/02-prd.md
3. docs/03-user-flow.md
4. docs/04-erd.md
5. docs/05-c4-architecture.md
6. docs/06-folder-structure.md
7. docs/07-api-specification.md
8. docs/08-database-schema.md
9. docs/09-ui-design-system.md
10. docs/10-development-roadmap.md
11. docs/11-deployment.md
12. docs/12-testing-strategy.md

Jangan mengimplementasikan fitur sebelum memahami dokumen yang relevan.

---

# UI Skills

Repository memiliki UI Skills pada:

```
.agents/skills/
```

Sebelum mengerjakan UI, baca skill yang relevan.

- frontend-design
- frontend-ui-engineering
- baseline-ui
- improve-ui

Ikuti seluruh aturan yang terdapat pada SKILL.md.

Jangan mengabaikan guideline yang diberikan skill tersebut.

---

# Development Workflow

Setiap implementasi harus mengikuti urutan berikut.

1. Baca CLAUDE.md.
2. Baca dokumen yang relevan pada folder docs.
3. Baca UI Skill jika mengerjakan frontend.
4. Pahami requirement.
5. Buat implementation plan.
6. Implementasikan.
7. Jalankan seluruh verification command.
8. Perbaiki seluruh error.
9. Baru anggap task selesai.

---

# Architecture Rules

Ikuti C4 Architecture.

Jangan mengubah struktur project tanpa alasan yang kuat.

Gunakan folder sesuai blueprint.

Jangan membuat folder baru jika tidak benar-benar diperlukan.

---

# Project Structure

Seluruh struktur project harus mengikuti:

```
docs/06-folder-structure.md
```

Jangan membuat struktur baru yang bertentangan dengan blueprint.

---

# API Rules

Ikuti seluruh endpoint pada:

```
docs/07-api-specification.md
```

Jangan:

- membuat endpoint baru
- mengubah response
- mengubah request
- mengubah URL

kecuali diminta secara eksplisit.

---

# Database Rules

Ikuti:

```
docs/08-database-schema.md
```

Jangan:

- membuat tabel baru
- mengubah relasi
- mengubah enum
- mengubah cascade
- mengubah migration strategy

tanpa instruksi.

---

# UI Rules

Ikuti:

```
docs/09-ui-design-system.md
```

UI harus:

- modern
- clean
- minimal
- production-ready

Hindari tampilan generik hasil AI.

Gunakan:

- React
- Tailwind CSS
- shadcn/ui

Gunakan component yang reusable.

Utamakan accessibility.

---

# Coding Rules

Gunakan:

- TypeScript strict mode
- Composition over duplication
- Reusable components
- Small functions
- Strong typing

Hindari:

- any
- duplicated code
- magic number
- hardcoded string
- dead code

---

# Backend Rules

Gunakan:

- NestJS
- Prisma
- PostgreSQL
- BullMQ
- Redis

Pisahkan:

- Controller
- Service
- Repository
- DTO
- Validation

Business logic tidak boleh berada di Controller.

---

# Frontend Rules

Gunakan:

- React
- Vite
- TanStack Query
- React Router
- Tailwind
- shadcn/ui

Pisahkan:

- pages
- layouts
- components
- hooks
- services
- lib

Komponen harus reusable.

---

# Worker Rules

Worker hanya bertanggung jawab untuk:

- Queue Processing
- FFmpeg
- Metadata Extraction
- Thumbnail
- AI Recommendation Processing

Worker tidak boleh memiliki UI.

---

# Testing Rules

Ikuti:

```
docs/12-testing-strategy.md
```

Pastikan:

- Unit Test
- Integration Test
- E2E

tetap dapat dijalankan.

---

# Documentation Rules

Jangan mengubah isi folder docs kecuali diminta.

Jika implementasi membutuhkan perubahan arsitektur, jelaskan terlebih dahulu dan tunggu persetujuan sebelum mengubah dokumentasi.

---

# Verification

Sebelum task dianggap selesai WAJIB menjalankan:

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

```bash
pnpm test
```

Jika salah satu gagal:

- cari penyebabnya
- perbaiki
- jalankan ulang

Task belum selesai sampai seluruh command berhasil.

---

# Git Rules

Buat perubahan sekecil mungkin.

Hindari perubahan yang tidak berhubungan dengan task.

Jangan mengubah banyak file tanpa alasan.

Ikuti struktur project yang ada.

---

# Never

Jangan pernah:

- Mengubah blueprint tanpa izin.
- Menambah fitur di luar PRD.
- Mengubah API tanpa instruksi.
- Mengubah Database Schema tanpa instruksi.
- Mengubah UI Design System tanpa instruksi.
- Menghapus kode yang masih digunakan.
- Menggunakan `any` tanpa alasan yang jelas.
- Mengabaikan lint error.
- Mengabaikan type error.
- Mengabaikan build error.
- Mengabaikan test yang gagal.
- Membuat duplicate component.
- Membuat duplicate utility.
- Membuat duplicate service.

---

# Definition of Done

Sebuah task dianggap selesai apabila:

- Requirement terpenuhi.
- Sesuai PRD.
- Sesuai Architecture.
- Sesuai Database Schema.
- Sesuai API Specification.
- Sesuai UI Design System.
- Seluruh command verification berhasil.
- Tidak ada lint error.
- Tidak ada type error.
- Tidak ada build error.
- Tidak ada test yang gagal.

---

# Final Reminder

Selalu utamakan kualitas implementasi dibanding kecepatan.

Jika terdapat konflik antara implementasi dan dokumentasi, dokumentasi adalah sumber kebenaran.

Jangan berasumsi.

Jangan mengarang fitur.

Jangan mengubah arsitektur tanpa persetujuan.

Ikuti blueprint.
