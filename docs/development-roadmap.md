# 🗺️ Development Roadmap — Jepangku

Dokumen ini adalah **rencana pengerjaan berfase** untuk Jepangku setelah MVP portal berita
tercapai. Kontrak integrasi Core v2 ada di `docs/ecosystem-integration.md` dan
`jepangku-core/docs/ECOSYSTEM.md`. Visi produk jangka panjang: `.agents/05-ecosystem-strategy.md`
(bagian 8–12 = desain v1 — jangan dipakai untuk implementasi API).

Prinsip utama: **stabilkan portal lebih dulu, selaraskan Core + News, LMS nanti.**

Untuk status detail per fitur (sudah/belum), lihat `docs/feature-status.md`.

---

## 🎯 Prinsip Roadmap

1. **Stabilitas portal didahulukan.** Selesaikan fitur user-facing dan hardening yang membuat
   portal layak rilis publik (soft launch).
2. **Jangan bangun yang akan dibuang.** Auth, poin, badge, membership, dan notifikasi versi
   portal akan digantikan oleh Core Service + Clerk. Hindari membangunnya ulang di portal.
3. **Kerjakan yang tetap relevan.** Fitur domain berita (komentar, like, search, tag, analytics
   artikel) tetap milik portal selamanya — aman dikerjakan sekarang.
4. **Global-ready dipertahankan.** Tetap gunakan `source_app` dan poin berbasis transaksi agar
   migrasi ke Core mulus.

---

## 🧭 Ringkasan Fase

| Fase | Fokus | Status |
| ---- | ----- | ------ |
| **0** | Selaraskan dokumentasi & kontrak Core v2 | ✅ Selesai |
| **A** | Stabilkan MVP portal (user-facing + hardening + soft launch) | 🔄 Aktif sekarang |
| **B** | Core production-ready + News bridge (shadow token) | 🔄 Core ada; bridge ⏳ |
| **C** | Cutover News → consumer Core (FK Clerk ID, poin via API) | ⏳ Menunggu |
| **D** | Bangun LMS (`kursus.jepangku.com`) — consumer Core dari awal | ⏳ Menunggu |
| **E** | Fitur ekosistem global (badge, membership, notifikasi, admin pusat) | ⏳ Menunggu |

---

## 🟢 Fase A — Stabilkan MVP Portal (Prioritas Sekarang)

Tujuan: portal aman, lengkap, dan kredibel untuk rilis publik. Semua item di bawah **tetap milik
portal** meski Core Service hadir, jadi tidak akan terbuang.

### A1. Keamanan & Hardening (paling kritis)

[~] **Input sanitasi HTML** — artikel, komentar, profil, quiz/poll admin; whitelist img. *Defer:* sanitasi ulang konten lama
[~] **Rate limiting** — in-memory pada endpoint sensitif (login, register, artikel, vote, share, comment, quiz, upload, dll). *Defer:* Redis/Upstash pre-launch
[~] **Image moderation** — magic bytes + MIME + ukuran; moderasi AI opsional via env. *Defer:* wajibkan di production
[~] **Logging structured** — JSON `logger` + `proxy.ts` `/api/*`. *Defer:* log drain
[~] **Monitoring & alerting** — `captureException`, webhook opsional, `GET /api/health`. *Defer:* Sentry + uptime checker eksternal

### A2. Engagement & Sosial (domain portal)

[ ] **Sistem komentar artikel** — thread sederhana + moderasi admin
[ ] **Reaction / like artikel** — engagement ringan per artikel

### A3. Profil & Discovery (domain portal)

[ ] **Author profile publik** — `/profile/[username]`: bio, artikel published, statistik publik
[ ] **Statistik penulis** — total artikel published, total views, total bookmark diterima
[ ] **Dedicated search result page** — `/search?q=...` (artikel + quiz + poll)
[ ] **Trending articles discovery** — section/halaman khusus trending
[ ] **Related tags di halaman artikel** — klik tag langsung filter artikel
[ ] **Popular / trending tags** — tag populer di sidebar atau halaman explore

### A4. Analytics Konten (data milik portal)

[ ] **View analytics per artikel** — grafik views per hari/minggu, unique vs total
[ ] **Content performance report** — artikel dengan views/bookmark/share tertinggi per periode
[ ] **Admin: statistik per kategori** — jumlah artikel, views, engagement per kategori
[ ] **Statistik detail per quiz di admin** — jumlah attempt, distribusi skor, pass rate
[ ] **Statistik detail per poll di admin** — breakdown votasi per opsi, tren waktu

### A5. Soft Launch (konten + halaman statis)

[ ] Riset topik dan sumber untuk setiap kategori
[ ] Penulisan draft artikel (minimal 30 artikel untuk soft launch)
[ ] Penyuntingan dan quality check
[ ] Pengumpulan/pembuatan thumbnail/cover image
[ ] Konfigurasi kategori dan tag di admin
[ ] Publikasi artikel secara bertahap atau sekaligus
[ ] Halaman statis: About, Contact, Advertise, Media Partner, Career, Internship, Privacy Policy, Terms of Service, Disclaimer
[ ] Testing end-to-end: homepage, search, filter, leaderboard, quiz, poll

> **Catatan:** detail target konten per kategori ada di `docs/soft-launch-content.md`.

---

## ⚪ Fase 0 — Selaraskan Dokumentasi & Kontrak ✅

Tujuan: satu kontrak teknis v2 agar Core, News, dan LMS tidak membangun dari desain yang berbeda.

[x] `jepangku-core/docs/ECOSYSTEM.md` — peta lintas-repo
[x] `docs/ecosystem-integration.md` — keputusan arsitektur & checklist News
[x] `docs/README.md` — indeks dokumentasi
[x] Roadmap Fase B/C/D di-update ke API Core v2
[x] Banner desain v1 di `.agents/05-ecosystem-strategy.md`

Spesifikasi teknis: `jepangku-core/docs/API.md` (bukan endpoint v1 `GET /me`, `POST /points/earn`).

---

## 🔵 Fase B — Core Siap + News Bridge

Tujuan: Core melayani News; News mulai integrasi **non-breaking** sebelum cutover penuh.
Detail: `docs/ecosystem-integration.md` §5 Fase 1–2 · API: `jepangku-core/docs/API.md`.

### B1. Core Service (`jepangku-core`) — sebagian sudah ada

[x] Project Core (Elysia + Prisma + Bun)
[x] Clerk webhook: `POST /api/v1/auth/webhooks/clerk`
[x] Core JWT: `POST /api/v1/auth/token`
[x] Schema v2: `users.id` = Clerk ID, `gamification_logs`, `roles`, `badges`, `levels`
[x] API: `GET /users/me`, `POST /gamification/award`, `GET /leaderboard`
[ ] Deploy staging/prod + env production
[ ] Seed activity types News (`ARTICLE_SHARED`, `POLL_VOTED`, `NEWS_QUIZ_COMPLETED`, dll.)
[ ] Assign role `NEWS_EDITOR` untuk admin portal di Core

### B2. Portal Berita — Clerk bridge (selesai) + Core shadow

[x] Integrasi Clerk di portal (`AUTH_PROVIDER=clerk`)
[x] Kolom `users.clerk_id` + JIT provisioning lokal
[x] Auth lokal (JWT/bcrypt) dinonaktifkan
[ ] Env `CORE_API_URL`, `CORE_SERVICE_TOKEN`
[ ] Modul `lib/core/` (token exchange, award wrapper)
[ ] Shadow call `POST /api/v1/auth/token` setelah login (non-blocking)
[ ] (Opsional) Dual-write poin lokal + Core untuk validasi saldo

---

## 🟣 Fase C — Cutover News → Consumer Core

Tujuan: poin & identitas global dari Core; News hanya simpan data domain berita + profil portal (username/bio).
Detail: `docs/ecosystem-integration.md` §5 Fase 3.

[x] Clerk sebagai satu-satunya auth (prasyarat)
[ ] Migrasi FK: `author_id`, `user_id`, dll. → **Clerk ID** (= Core `users.id`)
[ ] Ganti `awardPoints()` → `POST /api/v1/gamification/award` (`application: PORTAL_BERITA`)
[ ] Session: Core JWT wajib (bukan shadow); admin via `jepangku.roles` (`NEWS_EDITOR`)
[ ] UI poin/leaderboard dari Core API / JWT claims
[ ] Hapus `point_transactions`, `daily_login_rewards`, `total_points` lokal
[ ] Sederhanakan `users` → profil portal keyed by Clerk ID (username, bio tetap di News)

---

## 🟠 Fase D — Bangun LMS (`kursus.jepangku.com`)

Tujuan: LMS consumer Core **dari hari pertama** (tanpa ulang pekerjaan cutover News).
Prasyarat: Fase C News selesai atau pola `lib/core/` terbukti stabil.

[ ] Next.js + `@clerk/nextjs` (Clerk app **sama** dengan News)
[ ] Prisma LMS: `User.id` = Clerk ID (PK, tanpa duplikasi user global)
[ ] `lib/core/` — salin pola News
[ ] Tabel domain: `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress`, `course_quiz_attempts`, `certificates`
[ ] Award XP: `application: LMS`, `activityType: COMPLETED_LESSON` / `COMPLETED_QUIZ`
[ ] **Tidak** buat `lib/points.ts` lokal

---

## 🔴 Fase E — Fitur Ekosistem Global

Tujuan: fitur lintas aplikasi yang hanya mungkin setelah Core berdiri. Membangunnya di portal
sekarang akan terbuang — karena itu **ditunda sampai Core siap**.

[ ] **Badge / achievement global** — Core `badges`, `user_badges` (sudah ada schema)
[ ] **Monthly leaderboard** — rolling 30 hari (dari Core)
[ ] **All-time leaderboard** — total poin sepanjang waktu (dari Core)
[ ] **Global leaderboard** — gabungan poin semua app (`source_app = all`)
[ ] **Badge / level pada leaderboard** — indikasi visual pencapaian
[ ] **In-app notifications** — belum ada di Core schema (desain Fase E)
[ ] **Follow / subscribe kategori** — subscribe + notifikasi artikel baru
[ ] **Export riwayat poin** — download CSV transaksi poin (dari Core)
[ ] **Riwayat aktivitas lengkap** (`/activity`) — perlu endpoint/viewer ledger Core (belum ada)
[ ] **Admin: monitor leaderboard** — dari sisi admin (data Core)
[ ] **Admin: monitor point transactions** — dari `gamification_logs` Core (endpoint admin belum ada)
[ ] **Admin: activity audit log** — audit admin portal (belum di Core)
[ ] **Membership & payment** — belum ada di Core schema
[ ] **Super-admin / role hierarchy** — `editor`, `moderator`, `instructor`, `student`
[ ] **Admin pusat** — admin lintas aplikasi
[ ] **Multi-app deployment** — subdomain production per app
[ ] **CI/CD pipeline** — otomasi deploy
[ ] **Mobile app** — React Native atau PWA

---

## 🔀 Pemetaan: Backlog Lama → Fase

Beberapa item yang sebelumnya ada di backlog portal **dipindah ke Core** agar tidak dibangun dua kali.

| Item backlog lama | Keputusan baru |
| ----------------- | -------------- |
| Email verification, Forgot password, OAuth, Session management UI | **Fase B/C — ditangani Clerk**, bukan portal |
| Monthly / All-time / Global leaderboard | **Fase E — dari Core** (data poin pindah ke Core) |
| Badge / level | **Fase E — Core** |
| In-app notifications | **Fase E — Core** |
| Follow / subscribe kategori | **Fase E — Core (notifikasi)** |
| Export riwayat poin | **Fase E — Core** |
| Riwayat aktivitas lengkap (`/activity`) | **Fase E — Core (`core_activity_logs`)** |
| Admin: monitor leaderboard & point transactions | **Fase E — Core** |
| Admin: activity audit log | **Fase E — Core** |
| Komentar, like, profil author, search, tags, analytics artikel | **Fase A — tetap di portal** |
| Rate limiting, sanitasi HTML, image moderation, monitoring, logging | **Fase A — hardening portal** |

---

## 📌 Referensi

- `docs/README.md` — indeks dokumentasi News
- `docs/ecosystem-integration.md` — **kontrak cutover News ↔ Core (v2)**
- `jepangku-core/docs/ECOSYSTEM.md` — peta ekosistem 3 aplikasi
- `jepangku-core/docs/API.md` — spesifikasi HTTP API Core
- `docs/feature-status.md` — status aktual per fitur
- `docs/technical-architecture.md` — arsitektur teknis portal
- `.agents/04-project-steering.md` — arah dan prioritas proyek
- `.agents/05-ecosystem-strategy.md` — visi produk (bagian 8–12 = v1)
- `.agents/01-mvp-scope.md` · `.agents/02-user-flow.md` · `.agents/03-database-erd.md`
- `docs/cloudflare-r2-setup.md` · `docs/soft-launch-content.md`
