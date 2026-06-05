# Jepangku News

> Portal berita interaktif bertema Jepang untuk pembaca Indonesia — artikel, quiz, polling, leaderboard, dan sistem poin.

[![Node.js][node-image]][node-url]
[![Next.js][next-image]][next-url]
[![TypeScript][ts-image]][ts-url]

Jepangku News adalah aplikasi **full-stack** berbasis **Next.js App Router + TypeScript** yang menggabungkan konten berita dengan fitur interaktif untuk meningkatkan engagement pengguna. Pembaca dapat menikmati artikel seputar budaya Jepang, anime, manga, dan lifestyle, sambil mengikuti quiz, polling, dan mengumpulkan poin.

MVP single-app sudah tercapai. Pengembangan lanjutan berfokus pada **Fase A** — menstabilkan portal untuk soft launch — sambil menyiapkan arsitektur agar siap menjadi ekosistem multi-app (Core Service, LMS, Clerk) di fase berikutnya. Deployment saat ini menggunakan **Vercel**.

<img width="1894" height="913" alt="Image" src="" />
[](https://github.com/user-attachments/assets/bcc5e3da-39f4-4583-be45-374d12eab396)

## Installation

**Prasyarat:** Node.js 18+, Bun (disarankan) atau npm, Git, akun Neon PostgreSQL. Cloudflare R2 opsional untuk development (ada graceful fallback).

**macOS & Linux:**

```sh
git clone https://github.com/Webekspres/jepangku-news.git
cd jepangku-news
bun install
cp .env.example .env.local
bunx prisma generate
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/Webekspres/jepangku-news.git
cd jepangku-news
bun install
Copy-Item .env.example .env.local
bunx prisma generate
```

Isi `.env.local` sesuai `.env.example`:

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

> Variabel `NEXT_PUBLIC_*` diekspos ke browser. Jangan commit `.env.local`.
> Jalankan `bun prisma db seed` hanya jika membuat instance database baru.

## Usage example

Jalankan server development:

```sh
bun dev
```

Buka [http://localhost:3000](http://localhost:3000). Contoh alur penggunaan:

**Pembaca (guest):** jelajahi artikel di `/articles`, ikuti quiz di `/quizzes`, vote polling di `/polls`, lihat peringkat di `/leaderboard`.

**Pengguna terdaftar:** daftar/masuk, bookmark artikel, submit artikel untuk review, kumpulkan poin, kelola profil di `/profile`.

**Admin:** akses dashboard di `/admin` — kelola artikel, kategori, tag, quiz, polling, user, dan homepage banner.

Contoh request API:

```sh
# Daftar artikel dengan filter
curl "http://localhost:3000/api/articles?sort=latest&page=1"

# Leaderboard mingguan
curl "http://localhost:3000/api/leaderboard/weekly"
```

_Untuk dokumentasi lengkap fitur, API, dan status implementasi, lihat [docs/feature-status.md](docs/feature-status.md) dan [docs/development-roadmap.md](docs/development-roadmap.md)._

## Development setup

Instal dependensi dan jalankan perintah development:

```sh
bun install
bunx prisma generate
bun dev          # development server (Turbopack)
bun run build    # prisma generate + production build
bun run start    # production server
bun run lint     # ESLint
```

**Struktur proyek:**

```
app/
├── (public)/    # Homepage, artikel, quiz, poll, leaderboard
├── (user)/      # Profil, bookmark, submit artikel, poin
├── (admin)/     # Admin dashboard & management
├── (auth)/      # Login & register
└── api/         # API routes
components/      # UI components
lib/             # DB, auth, R2, points
prisma/          # Schema, migrations, seed
docs/            # Dokumentasi proyek
.agents/         # Scope, user flow, ERD, steering
```

**Tech stack:** Next.js 16 · React 19 · Tailwind CSS 4 · Prisma 6 · PostgreSQL (Neon) · Cloudflare R2 · JWT + cookie

**Deployment (Vercel):** hubungkan repo, set environment variables dari `.env.example`, pastikan `bun run build` sukses. Detail R2: [docs/cloudflare-r2-setup.md](docs/cloudflare-r2-setup.md).

## Release History

* **Fase A** *(aktif)*
  * ADD: Hardening keamanan, engagement (komentar, like), profil publik author
  * ADD: Search & discovery, analytics konten, soft launch (konten + halaman statis)
* **MVP** *(0.1.0 — tercapai)*
  * ADD: Auth (register, login, logout, daily login points)
  * ADD: Artikel (listing, detail, submit, review workflow, bookmark, share, read-complete points)
  * ADD: Quiz & polling (attempt, vote, scoring, points)
  * ADD: Leaderboard mingguan & riwayat poin
  * ADD: Admin dashboard (artikel, kategori, tag, quiz, poll, user, homepage)
  * ADD: Upload ke Cloudflare R2, profil user dengan avatar
* **0.0.1**
  * Work in progress — scaffold Next.js + Prisma + auth dasar

## Meta

[Webekspres](https://webekspres.id) – [GitHub](https://github.com/Webekspres)

Proyek private. Dikembangkan oleh [Webekspres](https://webekspres.id).

[https://github.com/Webekspres/jepangku-news](https://github.com/Webekspres/jepangku-news)

## Contributing

1. Fork it ([https://github.com/Webekspres/jepangku-news/fork](https://github.com/Webekspres/jepangku-news/fork))
2. Create your feature branch (`git checkout -b feature/nama-fitur`)
3. Commit your changes (`git commit -am 'Add some namaFitur'`)
4. Push to the branch (`git push origin feature/nama-fitur`)
5. Create a new Pull Request

Ikuti prioritas di [docs/development-roadmap.md](docs/development-roadmap.md) dan update [docs/feature-status.md](docs/feature-status.md) setelah menyelesaikan fitur signifikan.

<!-- Badge links -->

[node-image]: https://img.shields.io/badge/Node.js-18%2B-green
[node-url]: https://nodejs.org/
[next-image]: https://img.shields.io/badge/Next.js-16%2B-black
[next-url]: https://nextjs.org/
[ts-image]: https://img.shields.io/badge/TypeScript-5%2B-blue
[ts-url]: https://www.typescriptlang.org/
