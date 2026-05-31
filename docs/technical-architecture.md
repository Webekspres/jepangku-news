# 🏗️ Tech Stack & Arsitektur

Dokumen ini merangkum stack teknis dan pilihan arsitektur untuk Jepangku News MVP.

## 📋 Ringkasan

Jepangku News adalah aplikasi **full-stack Next.js** dengan backend API routes dan frontend React dalam satu repository. Strategi ini mempercepat development dan memudahkan deploy awal di Vercel.

## 🚀 Stack Utama

| Layer | Teknologi | Versi | Keterangan |
|------|-----------|-------|------------|
| Framework | Next.js | 16.x | App Router, server components, API routes |
| UI | React | 19.x | Core rendering dan interaktivitas |
| CSS | Tailwind CSS | 4.x | Utility-first styling |
| ORM | Prisma | 6.x | Database client, migrations |
| Database | PostgreSQL | Neon | Managed cloud database |
| Storage | Cloudflare R2 | - | S3-compatible object storage |
| Auth | JWT + cookie | - | Session handling dan route protection |
| Deployment | Vercel | - | Deploy awal, CI/CD mudah |

## 🧱 Arsitektur Aplikasi

- `app/` : UI dan app routes
- `app/api/` : API backend routes
- `components/` : reusable UI components
- `lib/` : helper utilities (DB client, auth, R2)
- `prisma/` : schema database dan migrations

## 🧠 Mengapa Next.js?

- Full-stack dalam satu repo
- Built-in API routes tanpa backend terpisah
- SEO-friendly dengan server rendering
- Routing yang jelas dan modular
- Mudah deploy ke Vercel

## 💾 Database

### PostgreSQL + Neon

Neon dipilih untuk cloud PostgreSQL yang ringan dan managed. Project ini menggunakan Prisma sebagai ORM.

### Prisma

- type-safe queries
- auto-generated client
- migration management
- Prisma Studio untuk inspeksi database

### Schema Utama

Tabel inti meliputi:
- `users`
- `articles`
- `categories`
- `tags`
- `bookmarks`
- `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`
- `polls`, `poll_options`, `poll_votes`
- `point_transactions`

## 📦 Storage

### Cloudflare R2

Digunakan untuk media seperti cover image dan file upload. R2 dipilih karena kompatibilitas S3 dan tanpa biaya egress yang signifikan.

## 🔐 Authentication

### Model

- `USER`
- `ADMIN`

### Implementasi

- Login menggunakan email/username + password
- JWT disimpan dalam cookie HTTP-only
- Route protection untuk area user dan admin

## 🧭 Deployment

### Saat ini
- Vercel untuk deploy awal

### Masa depan
- Fork repo ke organisasi GitHub
- Self-hosted VPS untuk staging / production
- CI/CD pipeline untuk build dan deploy

## 📌 Kesiapan Multi-App

Arsitektur saat ini sudah menggunakan atribut `source_app` untuk beberapa model, sehingga migrasi ke ekosistem multi-app dapat dilakukan nanti tanpa perlu mengubah model fundamental.

## 📁 Struktur File Penting

- `app/` — halaman publik, auth, user, admin
- `app/api/` — backend API endpoint
- `components/` — reusable UI components
- `lib/` — utility functions: auth, db, r2
- `prisma/schema.prisma` — database model

## 🔄 Catatan Pengembangan

Prioritas pengembangan saat ini:
1. Fitur user flow (auth, bookmark, submit artikel, quiz/poll, poin)
2. Perbaikan UX / polish
3. Kebutuhan admin dashboard tambahan
4. Setup deployment self-hosted
