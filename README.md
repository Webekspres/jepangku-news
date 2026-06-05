# Jepangku News

Portal berita interaktif bertema Jepang untuk pembaca Indonesia. Menggabungkan artikel, quiz, polling, leaderboard, dan sistem poin untuk meningkatkan engagement pengguna.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%2B-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)

## Ringkasan

Jepangku News adalah portal berita **full-stack** berbasis **Next.js App Router + TypeScript**. MVP single-app sudah tercapai; pengembangan lanjutan berfokus pada **Fase A** — menstabilkan portal untuk soft launch, sambil menyiapkan arsitektur agar siap menjadi ekosistem multi-app (Core Service, LMS, Clerk) di fase berikutnya.

Deployment saat ini: **Vercel**. Rencana migrasi: fork ke organisasi GitHub → self-hosted VPS.

## Fitur Utama

### Publik (tanpa login)

- Homepage dengan featured slider, trending, kategori, preview quiz/poll & leaderboard
- Daftar & detail artikel (search, filter kategori/tag, sort)
- Quiz & polling (guest dapat ikut; hasil tercatat setelah login)
- Leaderboard mingguan

### Pengguna terdaftar

- Register, login, logout
- Bookmark artikel (+poin)
- Submit & edit artikel (draft → review admin)
- Quiz & polling dengan tracking hasil
- Sistem poin (baca artikel, share, bookmark, quiz, poll, daily login)
- Profil & edit profil (avatar, bio, username dengan cooldown 14 hari)
- Riwayat transaksi poin

### Admin

- Dashboard statistik
- Kelola artikel (CRUD, review queue, bulk action, export)
- Kelola kategori & tag
- Kelola quiz & polling (multi-question builder)
- Kelola user (role, status)
- Kelola homepage (featured & hot articles)

## Status & Prioritas

> **Sumber kebenaran:** [`docs/feature-status.md`](docs/feature-status.md) — audit fitur per modul (sudah/belum).
> **Rencana berfase:** [`docs/development-roadmap.md`](docs/development-roadmap.md) — Fase A–E.

**MVP portal sudah tercapai.** Prioritas aktif (**Fase A**):

1. Keamanan & hardening — sanitasi HTML, rate limiting, image moderation, logging, monitoring
2. Engagement — komentar artikel, reaction/like
3. Profil publik author & statistik penulis
4. Search & discovery — halaman `/search`, trending, popular tags
5. Analytics konten — view analytics, performance report, statistik kategori/quiz/poll
6. Soft launch — konten artikel + halaman statis

Fitur yang **ditunda** (akan ditangani Core Service / Clerk): email verification, OAuth, forgot password, leaderboard global, badge, notifikasi in-app.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| Editor | TipTap (RichTextEditor) |
| ORM | Prisma 6 |
| Database | PostgreSQL (Neon) |
| Storage | Cloudflare R2 (S3-compatible) |
| Auth | JWT + HTTP-only cookie |
| Deploy | Vercel (`output: standalone`) |

## Prasyarat

- **Node.js** 18+
- **Bun** (disarankan) atau npm
- **Git**
- Akun **Neon PostgreSQL**
- Akun **Cloudflare R2** (opsional untuk development; ada graceful fallback)

## Setup Lokal

```bash
git clone https://github.com/Webekspres/jepangku-news.git
cd jepangku-news
bun install
```

### Konfigurasi environment

Salin `.env.example` ke `.env.local`, lalu isi nilai yang diperlukan:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION=86400
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_ACCESS_KEY_SECRET="your-access-key-secret"
R2_BUCKET_NAME="jepangku-storage"
R2_PUBLIC_URL="https://your-bucket-id.r2.cloudflarestorage.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

> Variabel `NEXT_PUBLIC_*` diekspos ke browser. Jangan commit file `.env.local`.
> Jalankan `bun prisma db seed` hanya jika membuat instance database baru.

### Menjalankan aplikasi

```bash
bunx prisma generate
bun dev
```

Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

### Perintah lain

```bash
bun run build    # prisma generate + next build
bun run start    # production server
bun run lint     # ESLint
```

## Deployment

### Vercel (saat ini)

1. Hubungkan repository ke Vercel
2. Set semua environment variables dari `.env.example`
3. Pastikan `bun run build` sukses sebelum deploy

### Rencana migrasi

1. Fork repo ke organisasi GitHub
2. Setup self-hosted VPS (staging & production)
3. Implementasi CI/CD

Detail setup R2: [`docs/cloudflare-r2-setup.md`](docs/cloudflare-r2-setup.md)

## Struktur Proyek

```
app/
├── (public)/       # Halaman publik: homepage, artikel, quiz, poll, leaderboard
├── (user)/         # Halaman user: profil, bookmark, submit artikel, poin
├── (admin)/        # Admin dashboard & management
├── (auth)/         # Login & register
└── api/            # API routes (auth, articles, quiz, poll, admin, upload, …)
components/         # UI components (Navbar, Footer, ArticleCard, …)
contexts/           # React context (AuthContext)
lib/                # Utilities: DB, auth, R2, points, article-audit
prisma/             # Schema, migrations, seed
public/             # Static assets (logo, favicons)
docs/               # Dokumentasi proyek
.agents/            # Scope, user flow, ERD, steering, ekosistem
```

## API (ringkas)

| Grup | Endpoint utama |
|------|----------------|
| Auth | `POST /api/auth/register`, `login`, `logout` · `GET /api/auth/me` |
| Artikel | `GET /api/articles` · `GET /api/articles/[slug]` · `POST /api/articles/create` · `PUT /api/articles/[slug]/update` · `POST /api/articles/[slug]/read-complete` · `POST /api/articles/[slug]/share` |
| Bookmark | `GET /api/bookmarks` · `POST/DELETE /api/bookmarks/[articleId]` |
| Quiz | `GET /api/quizzes` · `GET /api/quizzes/[slug]` · `POST /api/quizzes/[slug]/attempt` |
| Poll | `GET /api/polls` · `GET /api/polls/[slug]` · `POST /api/polls/[slug]/vote` |
| Poin | `GET /api/points/my` |
| Leaderboard | `GET /api/leaderboard/weekly` |
| Profil | `GET/PUT /api/user/profile` |
| Upload | `POST /api/upload` |
| Admin | `/api/admin/*` — artikel, kategori, tag, user, quiz, poll, homepage, stats |

Daftar lengkap dan status verifikasi ada di [`docs/feature-status.md`](docs/feature-status.md).

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [`docs/feature-status.md`](docs/feature-status.md) | Status aktual per fitur — **mulai dari sini** |
| [`docs/development-roadmap.md`](docs/development-roadmap.md) | Rencana pengerjaan Fase A–E |
| [`.agents/04-project-steering.md`](.agents/04-project-steering.md) | Arah & prioritas proyek |
| [`.agents/01-mvp-scope.md`](.agents/01-mvp-scope.md) | Scope & batasan MVP |
| [`.agents/02-user-flow.md`](.agents/02-user-flow.md) | Alur pengguna & permission |
| [`.agents/03-database-erd.md`](.agents/03-database-erd.md) | Desain database & schema |
| [`.agents/05-ecosystem-strategy.md`](.agents/05-ecosystem-strategy.md) | Arsitektur ekosistem & Core Service |
| [`docs/technical-architecture.md`](docs/technical-architecture.md) | Arsitektur teknis |
| [`docs/cloudflare-r2-setup.md`](docs/cloudflare-r2-setup.md) | Setup Cloudflare R2 |
| [`docs/soft-launch-content.md`](docs/soft-launch-content.md) | Checklist konten soft launch |

## Kontribusi

1. Fork repository
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit perubahan
4. Push branch
5. Buat Pull Request

Ikuti prioritas di `docs/development-roadmap.md` dan update `docs/feature-status.md` setelah menyelesaikan fitur signifikan.
