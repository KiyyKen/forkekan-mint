# UI Design System

# Forkekan-mint

> Anti Video Burik.
>
> "4K kan min!"

Version: 1.0

---

# Overview

Dokumen ini menjelaskan pedoman desain antarmuka (UI Design System) yang digunakan pada Forkekan-mint.

Tujuan:

- Konsistensi tampilan
- Mudah dikembangkan
- Mudah dipelihara
- Responsive
- Modern
- Accessible

---

# Design Principles

Forkekan-mint mengutamakan:

- Simple
- Clean
- Modern
- Fast
- User Friendly

Dashboard tetap profesional, sedangkan Landing Page dapat menggunakan sentuhan humor sesuai branding "Anti Video Burik."

---

# Technology

Frontend

- React 19
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

Icons

- Lucide React

---

# Theme

Mode

- Light
- Dark

Menggunakan CSS Variables sehingga mudah dikembangkan.

---

# Color Palette

Primary

```
Blue
```

Secondary

```
Slate
```

Success

```
Green
```

Warning

```
Yellow
```

Danger

```
Red
```

Info

```
Sky
```

---

# Border Radius

Gunakan radius konsisten.

| Component | Radius |
|-----------|--------|
| Button | md |
| Card | xl |
| Modal | xl |
| Input | lg |

---

# Typography

Font

```
Inter
```

Hierarchy

| Element | Size |
|----------|------|
| H1 | 36px |
| H2 | 30px |
| H3 | 24px |
| H4 | 20px |
| Body | 16px |
| Small | 14px |

---

# Spacing

Gunakan skala Tailwind.

```
2
4
6
8
12
16
20
24
```

Hindari nilai acak.

---

# Layout

Container

```
max-w-7xl
```

Section

```
py-16
```

Gap

```
gap-6
```

---

# Components

## Button

Variant

- Primary
- Secondary
- Outline
- Ghost
- Destructive

State

- Default
- Hover
- Active
- Disabled
- Loading

---

## Input

State

- Default
- Focus
- Error
- Disabled

---

## Card

Digunakan untuk

- Video
- Dashboard
- Statistics
- Preset

---

## Dialog

Digunakan untuk

- Confirmation
- Delete
- Error
- Success

---

## Badge

Digunakan untuk

- Status
- Platform
- Queue
- AI Recommendation

---

## Progress

Digunakan untuk

- Upload
- Processing
- Download

---

## Skeleton

Digunakan saat loading.

---

## Toast

Jenis

- Success
- Error
- Warning
- Info

---

# Icons

Semua icon menggunakan

```
Lucide React
```

Contoh

- Upload
- Download
- Settings
- User
- History
- Sparkles

---

# Animation

Menggunakan

```
Framer Motion
```

Animasi hanya digunakan untuk:

- Page Transition
- Fade
- Slide
- Modal
- Loading

Animasi tidak boleh mengganggu performa.

---

# Responsive Breakpoints

| Device | Width |
|---------|-------|
| Mobile | <640px |
| Tablet | ≥640px |
| Laptop | ≥1024px |
| Desktop | ≥1280px |

---

# Accessibility

Target

WCAG 2.1 AA

Standar

- Keyboard Navigation
- Focus Ring
- ARIA Label
- Semantic HTML
- Color Contrast

---

# Empty States

Contoh

History kosong

```
Belum ada riwayat optimasi.
```

Favorite kosong

```
Belum ada preset favorit.
```

---

# Loading States

Semua request harus memiliki loading state.

Contoh

- Skeleton
- Spinner
- Progress Bar

---

# Error States

Semua error menggunakan komponen yang konsisten.

Contoh

```
Upload gagal.

Silakan coba lagi.
```

---

# Dashboard Structure

Sidebar

↓

Header

↓

Content

↓

Footer

---

# Landing Page Structure

- Hero
- Features
- How It Works
- Supported Platforms
- FAQ
- CTA
- Footer

---

# Design Tokens

Semua warna, spacing, radius, dan typography harus menggunakan design tokens agar mudah diubah tanpa memodifikasi setiap komponen.

---

# Naming Convention

Komponen

```
PascalCase
```

Contoh

```
UploadCard

VideoPreview

ProgressCard
```

Props

```
camelCase
```

---

# Future Improvements

- Theme Customization
- Multiple Accent Color
- Motion Preferences
- Component Playground
- Storybook Integration

---

# Closing

UI Design System menjadi pedoman utama dalam pengembangan antarmuka Forkekan-mint. Seluruh komponen harus mengikuti standar yang telah ditetapkan agar pengalaman pengguna tetap konsisten, mudah dipelihara, dan siap berkembang seiring bertambahnya fitur.