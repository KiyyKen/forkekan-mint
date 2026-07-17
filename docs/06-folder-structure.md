# Folder Structure

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan struktur folder proyek Forkekan-mint.

Struktur proyek dirancang menggunakan pendekatan **monorepo** agar frontend, backend, worker, dan dokumentasi dapat dikelola dalam satu repository secara terstruktur.

---

# Goals

- Mudah dipelihara
- Mudah dikembangkan
- Konsisten
- Siap untuk scaling
- Memisahkan tanggung jawab setiap aplikasi

---

# Root Structure

```text
forkekan-mint/

├── apps/
├── packages/
├── docs/
├── infra/
├── scripts/
├── .github/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
└── LICENSE
```

---

# apps/

Berisi aplikasi utama.

```text
apps/

├── web/
├── api/
└── worker/
```

---

## web/

Frontend.

Framework

- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

Contoh struktur

```text
web/

src/

components/
pages/
layouts/
hooks/
services/
stores/
types/
utils/
assets/
styles/
```

---

## api/

Backend.

Framework

- NestJS

Contoh struktur

```text
api/

src/

auth/
users/
uploads/
videos/
processing/
presets/
downloads/
history/
admin/
common/
config/
database/
```

---

## worker/

Background processing.

Tanggung jawab

- BullMQ Worker
- FFmpeg
- Thumbnail Generator
- Metadata Extractor

Contoh struktur

```text
worker/

src/

jobs/
processors/
ffmpeg/
services/
utils/
```

---

# packages/

Berisi kode yang digunakan bersama.

```text
packages/

ui/
types/
config/
eslint/
tsconfig/
shared/
```

---

## ui/

Shared UI Components.

Misalnya

- Button
- Card
- Dialog
- Modal

---

## types/

Shared TypeScript Types.

Contoh

```text
User

Video

ProcessingJob

PlatformPreset
```

---

## shared/

Utility bersama.

Contoh

- formatter
- validator
- constants

---

# docs/

Semua dokumentasi proyek.

```text
docs/

01-product-overview.md
02-product-requirements.md
03-user-flow.md
04-erd.md
05-c4-architecture.md
06-folder-structure.md
07-api-specification.md
08-database-schema.md
09-ui-design-system.md
10-development-roadmap.md
11-deployment.md
12-testing-strategy.md
```

---

# infra/

Konfigurasi infrastruktur.

```text
infra/

docker/

nginx/

coolify/

compose/
```

---

# scripts/

Automation.

Contoh

```text
scripts/

seed.ts

cleanup.ts

backup.ts
```

---

# .github/

Workflow GitHub.

```text
.github/

workflows/

issue_template/

pull_request_template.md
```

---

# Environment

```text
.env

.env.example
```

.env tidak pernah di-commit.

---

# Naming Convention

Folder

- lowercase

File

- kebab-case

Component

- PascalCase

Function

- camelCase

Constant

- UPPER_SNAKE_CASE

Interface

- PascalCase

Enum

- PascalCase

---

# Import Rules

Gunakan absolute import.

Contoh

```ts
import { Button } from "@/components/ui/button";
```

Hindari relative import yang terlalu panjang.

```ts
../../../../components/button
```

---

# Separation of Responsibility

Frontend

- UI
- Form
- State
- Request API

Backend

- Business Logic
- Authentication
- Database
- Queue

Worker

- Encoding
- FFmpeg
- Thumbnail
- Compression

---

# Design Principles

Forkekan-mint mengikuti prinsip:

- Modular
- Reusable
- Maintainable
- Scalable
- Clean Architecture

---

# Future Expansion

Struktur ini memungkinkan penambahan aplikasi baru tanpa mengubah struktur utama.

Contoh

```text
apps/

mobile/

desktop/

cli/
```

Atau package baru

```text
packages/

analytics/

notifications/

sdk/
```

---

# Closing

Struktur folder Forkekan-mint dirancang agar setiap bagian aplikasi memiliki tanggung jawab yang jelas, memudahkan kolaborasi, serta mendukung pengembangan jangka panjang tanpa mengorbankan keterbacaan maupun skalabilitas proyek.