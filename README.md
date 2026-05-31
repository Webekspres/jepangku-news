# Jepangku News

**Jepangku** adalah portal berita interaktif bertema Jepang untuk pembaca Indonesia. Proyek ini menggabungkan konten artikel, quiz, polling, leaderboard, dan sistem poin untuk meningkatkan engagement pengguna.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%2B-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📌 Ringkasan

Jepangku News adalah MVP single-app yang dibangun dengan **Next.js + TypeScript** dan siap dikembangkan menjadi ekosistem multi-app di masa depan. Saat ini deployment utama menggunakan **Vercel**, dan rencana selanjutnya adalah fork repository ke organisasi GitHub lalu deploy ke **self-hosted VPS**.

## 🎯 Fokus Prioritas

1. **User experience dan fitur user** terlebih dahulu
2. Baru setelah itu, fokus ke **admin dashboard dan management tools**
3. Saat ini, **shared auth service** tidak diimplementasikan, tetapi arsitektur sudah disiapkan agar dapat terintegrasi kelak
4. Database sudah tersedia di **Neon PostgreSQL** dan sudah memiliki seed data

## ✨ Fitur Utama Saat Ini

### Untuk Publik (guest)
- Membaca daftar artikel dan detail
- Melihat kategori artikel
- Melihat leaderboard mingguan
- Mengikuti quiz dan polling

### Untuk Pengguna Terdaftar
- Register & login
- Mengelola bookmark artikel
- Submit artikel untuk review admin
- Mengikuti quiz dan polling dengan tracking hasil
- Mengumpulkan poin dari aktivitas
- Melihat riwayat poin dan aktivitas
- Melihat profil personal
- Terdaftar dalam weekly leaderboard

### Untuk Admin
- Akses admin dashboard
- Manage artikel dan review user-submitted article
- Manage kategori dan tags
- Manage quiz dan polling
- Manage user dan homepage banner

## 🛠️ Tech Stack

- **Next.js** 16.x
- **React** 19.x
- **TypeScript** 5.x
- **Tailwind CSS** 4.x
- **Prisma** 6.x
- **PostgreSQL** (Neon)
- **Cloudflare R2** untuk storage asset
- **JWT + session cookie** untuk auth
- **Vercel** untuk deployment awal

## ✅ Status Implementasi

### Sudah tersedia
- Authentication: register, login, logout, `auth/me`
- Artikel: listing, detail, submit artikel, review workflow
- Bookmark untuk user
- Quiz: list, detail, submit jawaban
- Polling: list, detail, vote
- Leaderboard mingguan
- User profile dasar
- API routes untuk auth, articles, quizzes, polls, users, leaderboard
- Upload utility Cloudflare R2 di `lib/r2.ts`

### Belum selesai / sedang ditingkatkan
- Email verification
- Forgot password / password reset
- Share tracking + points reward
- Full-text search dan trending algorithm lengkap
- Avatar upload terintegrasi profile
- Advanced admin management untuk quiz/poll
- Monthly / all-time leaderboard
- Comments dan notification system
- Rate limiting, sanitasi input, monitoring

## 📦 Prasyarat

- Node.js 18+
- npm / pnpm
- Git
- Neon PostgreSQL database
- Cloudflare R2 credentials

## 🧩 Setup Lokal

```bash
git clone https://github.com/yourusername/jepangku-news-app.git
cd jepangku-news-app
npm install
```

## 🔧 Konfigurasi Environment

Salin `.env.example` ke `.env.local` lalu isi nilai berikut:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_ACCESS_KEY_SECRET="your-access-key-secret"
R2_BUCKET_NAME="jepangku-storage"
R2_PUBLIC_URL="https://your-bucket-id.r2.cloudflarestorage.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

> Catatan: database sudah di-seed di Neon. Jalankan `npx prisma db seed` hanya jika Anda membuat instance database baru.

## ⚙️ Installasi dan Run

```bash
npx prisma generate
npm run dev
```

### Build & production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## ☁️ Deployment

### Saat ini
- Deploy di **Vercel**
- Pastikan environment variables terpasang di dashboard Vercel
- Pastikan build `npm run build` sukses sebelum deploy

### Rencana migrasi
1. Fork repo ke organisasi GitHub
2. Pindahkan repo ke organisasi tersebut
3. Setup self-hosted VPS untuk staging/production
4. Implement CI/CD untuk build dan deploy

## 🗂️ Struktur Proyek

```
app/
components/
lib/
prisma/
public/
docs/
.agents/
README.md
package.json
tsconfig.json
next.config.ts
```

## 🌐 API Endpoint Ringkas

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Articles
- `GET /api/articles`
- `GET /api/articles/[slug]`
- `POST /api/articles`
- `PUT /api/articles/[id]`
- `DELETE /api/articles/[id]`

### Quiz
- `GET /api/quiz`
- `GET /api/quiz/[slug]`
- `POST /api/quiz/[slug]/submit`

### Polls
- `GET /api/polls`
- `GET /api/polls/[slug]`
- `POST /api/polls/[slug]/vote`

### Leaderboard
- `GET /api/leaderboard/weekly`

### Users
- `GET /api/users/[id]`
- `PUT /api/users/[id]`
- `GET /api/users/[id]/bookmarks`
- `GET /api/users/[id]/activity-history`

## 📚 Dokumentasi Proyek

- `docs/TECH_STACK.md`
- `docs/R2_SETUP.md`
- `docs/UNCOMPLETED_FEATURE.md`
- `.agents/erd.md`
- `.agents/mvp.md`
- `.agents/user-flow.md`
- `.agents/steering.md`

## 🤝 Kontribusi

1. Fork repository
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit perubahan
4. Push branch
5. Buat Pull Request

## 📄 Lisensi

Project ini dilisensikan di bawah MIT License. Lihat `LICENSE`.
''