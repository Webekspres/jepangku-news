# Jepangku News

**Jepangku** adalah portal media interaktif bertema Jepang untuk pembaca Indonesia. Platform ini menyediakan berita, artikel, quiz, polling, voting, leaderboard, dan sistem poin untuk meningkatkan interaksi pengguna.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Table of Contents

- [Visi & Misi](#visi--misi)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Documentation](#api-documentation)
- [Kontribusi](#kontribusi)

## 🎯 Visi & Misi

### Visi
Jepangku bertujuan menjadi platform digital bertema Jepang untuk pengguna Indonesia yang ingin membaca konten seputar budaya Jepang, anime, manga, lifestyle, event, edukasi, dan hiburan, sekaligus berinteraksi melalui fitur quiz, polling, voting, dan leaderboard.

### Misi
- Menyediakan portal berita bertema Jepang yang dapat diakses oleh publik
- Menyediakan sistem akun untuk pengguna
- Memungkinkan user submit artikel dengan proses review admin
- Menyediakan fitur interaktif (quiz, polling, voting)
- Memberikan poin dari aktivitas tertentu
- Menampilkan weekly leaderboard berdasarkan poin
- Menyiapkan struktur yang scalable untuk ekosistem multi-app di masa depan

## ✨ Fitur Utama

### Untuk Publik (Guest)
- ✅ Membaca artikel dan kategori
- ✅ Melihat detail artikel
- ✅ Melihat leaderboard dan search result
- ✅ Mengikuti quiz dan polling (tanpa poin)

### Untuk Pengguna (User)
- ✅ Register & Login
- ✅ Bookmark artikel
- ✅ Submit artikel untuk review
- ✅ Mengikuti quiz & polling dengan tracking hasil
- ✅ Mengumpulkan poin dari aktivitas
- ✅ Melihat riwayat aktivitas & poin
- ✅ Melihat profil personal
- ✅ Masuk ke weekly leaderboard

### Untuk Admin
- ✅ Dashboard admin
- ✅ Mengelola artikel & kategori
- ✅ Review artikel yang disubmit user
- ✅ Mengelola quiz & polling
- ✅ Mengelola user
- ✅ Mengelola homepage & banner

## 🛠️ Tech Stack

### Frontend & Backend
- **Framework**: [Next.js 14+](https://nextjs.org/) - Full-stack React framework dengan SSR/SSG dan API Routes
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Unstyled, accessible components

### Backend Services
- **Database**: PostgreSQL - Relational database
- **ORM**: [Prisma](https://www.prisma.io/) - Type-safe database client
- **Authentication**: JWT + Session management

### Infrastructure & Storage
- **File Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) - S3-compatible object storage
- **Runtime**: Node.js 18+
- **Deployment**: Vercel / Self-hosted

## 📦 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js**: v18.17.0 atau lebih baru ([Download](https://nodejs.org/))
- **npm** atau **yarn** atau **pnpm** (included with Node.js)
- **Git**: Untuk version control
- **PostgreSQL**: Database (optional - bisa local atau cloud)
- **Cloudflare Account**: Untuk R2 storage

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/jepangku-news-app.git
cd jepangku-news-app
```

### 2. Install Dependencies
```bash
npm install
# atau jika menggunakan yarn
yarn install
# atau jika menggunakan pnpm
pnpm install
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed data
npx prisma db seed
```

## 🔧 Konfigurasi Lingkungan

Buat file `.env.local` di root project dan konfigurasi variabel lingkungan:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jepangku"

# JWT Secret (generate dengan: openssl rand -base64 32)
JWT_SECRET="your-secret-key-here"

# Cloudflare R2 Configuration
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_ACCESS_KEY_SECRET="your-access-key-secret"
R2_BUCKET_NAME="jepangku-storage"
R2_PUBLIC_URL="https://your-bucket-id.r2.cloudflarestorage.com"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Optional: Analytics, Email, etc
# NEXT_PUBLIC_ANALYTICS_ID="..."
```

### Mendapatkan Cloudflare R2 Credentials

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **R2** di sidebar
3. Buat bucket baru atau gunakan yang sudah ada
4. Buat **API Token** di halaman **Settings**
   - Pilih "Create API token"
   - Pilih "Edit R2" scope
   - Copy credentials ke `.env.local`

## ▶️ Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
# Aplikasi akan berjalan di http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

### Lint & Format
```bash
# Check linting
npm run lint

# Format code
npm run format
```

### Database Commands
```bash
# Open Prisma Studio (GUI untuk database)
npx prisma studio

# Generate migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ akan menghapus semua data)
npx prisma migrate reset
```

## 📁 Struktur Proyek

```
jepangku-news-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # Auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── (public)/               # Public pages
│   │   ├── articles/
│   │   ├── quiz/
│   │   ├── polls/
│   │   └── leaderboard/
│   ├── (user)/                 # Protected user pages
│   │   ├── dashboard/
│   │   ├── bookmarks/
│   │   ├── submit-article/
│   │   ├── profile/
│   │   └── history/
│   ├── (admin)/                # Admin pages
│   │   ├── dashboard/
│   │   ├── articles/
│   │   ├── quiz/
│   │   ├── users/
│   │   └── settings/
│   └── api/                    # API routes
│       ├── auth/
│       ├── articles/
│       ├── quiz/
│       ├── polls/
│       ├── users/
│       └── upload/
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── navbar/
│   ├── sidebar/
│   ├── cards/
│   └── forms/
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # Authentication utils
│   ├── r2.ts                   # R2 storage client
│   ├── api.ts                  # API client
│   └── utils.ts                # Utility functions
├── styles/
│   └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.local                  # Environment variables (git ignored)
├── .env.example                # Environment variables template
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
├── package.json
└── README.md
```

## 📚 API Documentation

API endpoints tersedia di `/api/`. Dokumentasi lengkap:

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Articles
- `GET /api/articles` - Get semua artikel
- `GET /api/articles/:id` - Get detail artikel
- `POST /api/articles` - Create artikel (user)
- `PUT /api/articles/:id` - Update artikel (admin/owner)
- `DELETE /api/articles/:id` - Delete artikel (admin/owner)

### Quiz
- `GET /api/quiz` - Get semua quiz
- `GET /api/quiz/:id` - Get detail quiz
- `POST /api/quiz/:id/submit` - Submit jawaban quiz

### Polls & Voting
- `GET /api/polls` - Get semua polling
- `POST /api/polls/:id/vote` - Vote di polling

### Leaderboard
- `GET /api/leaderboard` - Get weekly leaderboard

### User
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/bookmarks` - Get user bookmarks
- `GET /api/users/:id/activity-history` - Get activity history

## 🎯 Roadmap Jangka Panjang

MVP saat ini adalah single app, namun struktur dirancang untuk scalability:

```
Phase 1 (Current):
└── Jepangku News MVP (Single App)

Phase 2:
├── jepangku.com          → Website utama / landing
├── news.jepangku.com     → Portal berita (refined)
├── learn.jepangku.com    → LMS belajar bahasa Jepang
└── admin.jepangku.com    → Admin dashboard pusat

Phase 3:
├── Shared authentication service
├── Global user system
├── Cross-app leaderboard & poin system
└── Advanced role & permission system
```

## 🤝 Kontribusi

Kami menerima kontribusi! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Project ini dilisensikan di bawah [MIT License](LICENSE) - lihat file LICENSE untuk detail.

## 📧 Contact & Support

- **Email**: contact@jepangku.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/jepangku-news-app/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/jepangku-news-app/wiki)

---

**Dibuat dengan ❤️ untuk komunitas Indonesia yang mencintai Jepang**
