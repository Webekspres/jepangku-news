# 🏗️ Tech Stack & Arsitektur

Dokumen ini merangkum stack teknis dan pilihan arsitektur untuk Jepangku News.
Integrasi ekosistem (Core + Clerk): [`ecosystem-integration.md`](./ecosystem-integration.md).

## 📋 Ringkasan

Jepangku News adalah aplikasi **full-stack Next.js** dengan backend API routes dan frontend React dalam satu repository. Strategi ini mempercepat development dan memudahkan deploy di VPS/Docker.

Dalam ekosistem JepangKu, News adalah **aplikasi domain berita** — artikel, quiz/poll, komentar — yang mengonsumsi **identitas global** dari `jepangku-core` (Clerk ID, role, JWT). **Poin dan leaderboard poin** milik News DB sendiri (Core v2.1 tidak menyimpan poin).

## 🚀 Stack Utama

| Layer | Teknologi | Versi | Keterangan |
|------|-----------|-------|------------|
| Framework | Next.js | 16.x | App Router, server components, API routes |
| UI | React | 19.x | Core rendering dan interaktivitas |
| CSS | Tailwind CSS | 4.x | Utility-first styling; tokens di `app/globals.css` — lihat [design-system.md](./design-system.md) |
| ORM | Prisma | 6.x | Database client, migrations |
| Database | PostgreSQL | Neon | Managed cloud database (domain berita) |
| Storage | Cloudflare R2 | - | S3-compatible object storage |
| Auth | Clerk | - | SSO; session → JIT sync lokal (transisi) |
| Shared identity | jepangku-core | - | Identitas + role global; XP/level untuk LMS (bukan poin portal) |
| Deployment | Docker / VPS | - | Self-hosted, kontrol penuh |

## 🧱 Arsitektur Aplikasi

- `app/` : UI dan app routes
- `app/api/` : API backend routes
- `components/` : reusable UI components
- `lib/` : helper utilities (DB client, auth, R2; `lib/core/` rencana Fase B)
- `prisma/` : schema database dan migrations

## 🌐 Posisi dalam Ekosistem

```mermaid
flowchart LR
  Clerk[Clerk]
  News[Jepangku News]
  Core[jepangku-core]
  NewsDB[(News DB)]
  CoreDB[(Core DB)]

  Clerk --> News
  Clerk -->|webhook| Core
  News -->|Fase B+: auth/token, award| Core
  News --> NewsDB
  Core --> CoreDB
```

| Data | Lokasi |
|------|--------|
| Artikel, quiz berita, poll, komentar, bookmark | News DB |
| Username, bio, **poin**, **leaderboard poin**, `point_transactions` | News DB |
| Email, name, avatar global, role, XP/level (LMS) | Core DB |
| Login, password, OAuth | Clerk |

Peta lengkap: [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md).

## 💾 Database

### PostgreSQL + Neon

Neon dipilih untuk cloud PostgreSQL yang ringan dan managed. Project ini menggunakan Prisma sebagai ORM.

### Schema domain portal (tetap di News)

- `articles`, `categories`, `tags`, `bookmarks`
- `quizzes`, `polls`, `comments`, `reactions`
- `users`, `user_profiles` — **transisi**: akan disederhanakan setelah cutover Core (username/bio saja)

### Schema gamifikasi portal (tetap / kembali di News)

- `point_transactions`, `daily_login_rewards` — **sumber kebenaran poin portal** (Core v2.1 tidak punya poin)
- Kolom `users.total_points` — dihapus saat cutover identitas; saldo poin dihitung dari ledger News

### Yang di Core (bukan poin portal)

- `users`, `roles`, `gamification_logs` — identitas + XP global (utama LMS)
- Portal hanya konsumsi **auth/token** dan **users/me**; leaderboard poin **tidak** dari `GET /api/v1/leaderboard`

## 📦 Storage

### Cloudflare R2

Digunakan untuk media seperti cover image dan file upload. R2 dipilih karena kompatibilitas S3 dan tanpa biaya egress yang signifikan.

## 🔐 Authentication

Portal memakai **Clerk only** — tidak ada login JWT lokal.

- Sign-in: `/sign-in` · Sign-up: `/sign-up`
- `/login` dan `/register` redirect ke Clerk
- Session → Core JWT via `POST /api/v1/auth/token` (`application: PORTAL_BERITA`)
- Admin seed: `admin+clerk_test@jepangku.com` — OTP dev `424242`; role Core `PORTAL_ADMIN` / `CORE_ADMIN`

Clerk webhook **tidak** di News — user global disinkronkan ke Core via webhook di `jepangku-core`.

## 🔗 Integrasi Core (Fase B+)

| Variable | Kegunaan |
|----------|----------|
| `CORE_API_URL` | Base URL Core (`http://localhost:8080`) |
| `CORE_SERVICE_TOKEN` | Opsional — hanya jika route News memanggil Core `gamification/award` (XP); poin portal ditulis di News DB |

Alur target: lihat [`ecosystem-integration.md`](./ecosystem-integration.md).

## 🧭 Deployment

### Saat ini
- Self-hosted VPS dengan Docker
- Multi-app: News, Core, LMS dalam satu VPS
- PostgreSQL terpisah (managed cloud atau container)

### CI/CD
- Build & deploy via GitHub Actions atau manual di VPS
- Docker multi-stage build (lihat `Dockerfile`)
- Health check endpoint untuk monitoring

## 📌 Kesiapan Multi-App

Arsitektur saat ini sudah menggunakan atribut `source_app` untuk beberapa model. Setelah cutover, FK user mengacu **Clerk ID** (= Core `users.id`) — lihat [`ecosystem-integration.md` §3](./ecosystem-integration.md).

## 📁 Struktur File Penting

- `app/` — halaman publik, auth, user, admin
- `app/api/` — backend API endpoint
- `components/` — reusable UI components
- `lib/auth/` — Clerk session + JIT user
- `lib/points.ts` — award poin portal → News DB (`point_transactions`)
- `lib/core/` — client Core (auth/token, users/me; bukan sumber poin/leaderboard portal)
- `prisma/schema.prisma` — database model

## 🔄 Catatan Pengembangan

Prioritas pengembangan saat ini:
1. Soft launch konten (Fase A)
2. Core bridge + cutover (Fase B–C) — [`development-roadmap.md`](./development-roadmap.md)
3. Perbaikan UX / polish admin
4. LMS nanti (Fase D) — pola consumer Core sama dengan News pasca-cutover
