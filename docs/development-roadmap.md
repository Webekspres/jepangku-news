# 🗺️ Development Roadmap — Jepangku

Dokumen ini adalah **rencana pengerjaan berfase** untuk Jepangku setelah MVP portal berita
tercapai. Kontrak integrasi Core v2 ada di `docs/ecosystem-integration.md` dan
`jepangku-core/docs/ECOSYSTEM.md`. Visi produk jangka panjang: `.agents/05-ecosystem-strategy.md`
(bagian 8–12 = desain v1 — jangan dipakai untuk implementasi API).

Prinsip utama: **portal stabil + integrasi Core (Fase 1–3 coded); QA production & LMS polish berikutnya.**

Untuk status detail per fitur (sudah/belum), lihat `docs/feature-status.md`.  
Rencana teknis kontributor, newsletter, notifikasi: `docs/backlog-plan.md`.

---

## 🎯 Prinsip Roadmap

1. **Stabilitas portal didahulukan.** Selesaikan fitur user-facing dan hardening yang membuat
   portal layak rilis publik (soft launch).
2. **Jangan duplikasi identitas.** Auth & profil global lewat Clerk + Core; poin/badge **tetap**
   milik masing-masing app (News = poin, LMS = badge + XP Core).
3. **Kerjakan yang tetap relevan.** Fitur domain berita (komentar, like, search, tag, analytics
   artikel) tetap milik portal selamanya — aman dikerjakan sekarang.
4. **Poin berbasis transaksi di News DB.** Core v2.1 tidak menyimpan poin — ledger `point_transactions`
   adalah sumber kebenaran leaderboard portal.

---

## 🧭 Ringkasan Fase

| Fase | Fokus | Status |
| ---- | ----- | ------ |
| **0** | Selaraskan dokumentasi & kontrak Core v2 | ✅ Selesai |
| **A** | Stabilkan MVP portal (user-facing + hardening + soft launch) | 🔄 Aktif sekarang |
| **A″** | Kontributor + gate upload artikel *(revisi produk Juni 2026)* | ⏳ Berikutnya · [`backlog-plan.md` §2](./backlog-plan.md#2-kontributor--gate-upload--fase-a) |
| **B** | Core + News bridge (`lib/core/`, JWT exchange) | ✅ Coded · prod ⏳ |
| **C** | Cutover identitas News → Core (Clerk ID, JWT, role) | ✅ Coded · QA ⏳ |
| **C′** | Migrasi poin + leaderboard portal ke News DB (selaras Core v2.1) | 🔄 Berikutnya |
| **D** | LMS consumer Core (XP, level, badge lokal) | ✅ Fase 1 coded · UI belajar ⏳ |
| **E1** | Newsletter subscription portal | ⏳ · [`backlog-plan.md` §3](./backlog-plan.md#3-newsletter-subscription--fase-e1) |
| **E2** | Notifikasi portal (modal daily poin, bell, welcome) | ⏳ · [`backlog-plan.md` §4](./backlog-plan.md#4-notifikasi-portal--fase-c--e2) |
| **E** | Fitur lintas-app lainnya (membership, admin pusat, CI/CD) | ⏳ Menunggu |

---

## 🟢 Fase A — Stabilkan MVP Portal (Prioritas Sekarang)

Tujuan: portal aman, lengkap, dan kredibel untuk rilis publik. Semua item di bawah **tetap milik
portal** meski Core Service hadir, jadi tidak akan terbuang.

### A1. Keamanan & Hardening (paling kritis)

[~] **Input sanitasi HTML** — artikel, komentar, profil, quiz/poll admin; whitelist img. *Defer:* sanitasi ulang konten lama
[~] **Rate limiting** — in-memory pada endpoint sensitif (login, register, artikel, vote, share, comment, quiz, upload, dll). *Defer:* Redis/Upstash pre-launch
[~] **Image moderation** — magic bytes + MIME + ukuran; moderasi AI opsional via env. *Defer:* wajibkan di production
[~] **Logging structured** — JSON `logger` + `proxy.ts` `/api/*`. *Defer:* log drain
[x] **Monitoring & alerting** — `captureException`, `MONITORING_WEBHOOK_URL`, `LOG_DRAIN_URL`, `GET /api/health`

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

### A″ — Kontributor & gate upload *(revisi produk)*

Tujuan: user biasa tidak bisa submit artikel tanpa approve admin. UI CTA & drawer ✅ (Tier 4 revisi); backend belum.

Checklist lengkap: [`backlog-plan.md` §2](./backlog-plan.md#2-kontributor--gate-upload--fase-a) · prioritas **Prio 6** di [`feature-status.md`](./feature-status.md).

[ ] Schema `ContributorApplication` / role `CONTRIBUTOR` + migrasi  
[ ] API apply + gate `POST /api/articles/create`  
[ ] Admin antrian `/admin/contributors`  
[ ] Form `/contributor/apply` (ganti placeholder)

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
[x] Schema v2.1: `users.id` = Clerk ID, `gamification_logs`, `roles`, `levels` (tanpa poin/badge di Core)
[x] API: `GET /users/me`, `POST /gamification/award` (XP), `GET /leaderboard` (XP global — LMS)
[x] Deploy prod — `https://core.jepangku.com` (`GET /health` OK)
[x] Role portal: `USER`, `PORTAL_ADMIN` (seed Core v2.1)

### B2. Portal Berita — Clerk bridge (selesai) + Core shadow

[x] Integrasi Clerk di portal (`AUTH_PROVIDER=clerk`)
[x] Kolom `users.clerk_id` + JIT provisioning lokal
[x] Auth lokal (JWT/bcrypt) dinonaktifkan
[x] Env `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_JWT_*` (prod: `core.jepangku.com`)
[ ] Modul `lib/core/` (token exchange, award wrapper)
[ ] Shadow call `POST /api/v1/auth/token` setelah login (non-blocking)
[ ] Dual-write tidak diperlukan — poin hanya di News DB (Core v2.1)

---

## 🟣 Fase C — Cutover identitas News → Core

Tujuan: identitas & role global dari Core; News simpan domain berita + profil portal + **poin lokal**.
Detail: `docs/ecosystem-integration.md` §5 Fase 3.

[x] Clerk sebagai satu-satunya auth (prasyarat)
[x] Migrasi FK: `author_id`, `user_id`, dll. → **Clerk ID** (= Core `users.id`)
[x] Session: Core JWT wajib; admin via `jepangku.roles` (`PORTAL_ADMIN` / `CORE_ADMIN`)
[x] Hapus `users.total_points` / `clerk_id` lokal (identitas di Core)

## 🟣 Fase C′ — Poin & leaderboard portal (News DB)

Tujuan: selaraskan dengan Core v2.1 — poin **tidak** di Core.

[ ] Kembalikan / aktifkan `point_transactions` + saldo poin di News DB
[ ] Refactor `awardPoints()` → tulis ledger News (bukan `awardXp()` ke Core)
[ ] `GET /api/leaderboard/weekly` — agregasi poin News (bukan `GET /api/v1/leaderboard` Core)
[ ] UI Navbar, `/points`, homepage leaderboard dari saldo & transaksi News

---

## 🟠 Fase D — Bangun LMS (`kursus.jepangku.com`)

Tujuan: LMS consumer Core **dari hari pertama** (tanpa ulang pekerjaan cutover News).
Prasyarat: Fase C News selesai atau pola `lib/core/` terbukti stabil.

[ ] Next.js + `@clerk/nextjs` (Clerk app **sama** dengan News)
[ ] Prisma LMS: `User.id` = Clerk ID (PK, tanpa duplikasi user global)
[ ] `lib/core/` — salin pola News
[ ] Tabel domain: `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress`, `course_quiz_attempts`, `certificates`
[ ] Award XP ke Core: `application: LMS`, `activityType: COMPLETED_LESSON` / `COMPLETED_QUIZ`
[ ] Badge & display level: **LMS DB** + claims Core JWT (`totalXp`, `level`)
[ ] Leaderboard LMS: `GET /api/v1/leaderboard` (XP) atau kustom LMS

---

## 🔴 Fase E — Fitur Ekosistem Global

Tujuan: fitur lintas aplikasi. Beberapa item portal (E1, E2) **bisa dikerjakan di News DB** tanpa menunggu schema Core global — lihat [`backlog-plan.md`](./backlog-plan.md).

### E1 — Newsletter *(portal-only)*

Detail: [`backlog-plan.md` §3](./backlog-plan.md#3-newsletter-subscription--fase-e1)

[ ] Footer subscribe + model `NewsletterSubscription`  
[ ] Admin CRUD `/admin/newsletter`  
[ ] Unsubscribe wajib login akun yang sama  

### E2 — Notifikasi portal *(News DB)*

Detail: [`backlog-plan.md` §4](./backlog-plan.md#4-notifikasi-portal--fase-c--e2). Modal daily poin butuh **C′**; notif approve kontributor butuh **A″**.

[ ] Infrastruktur `Notification` + API  
[ ] Modal daily poin (first session/hari)  
[ ] Welcome user baru + notif kontributor approved  
[ ] Navbar bell fungsional (artikel/komentar) — lanjutan  

### E — Lintas-app & infrastruktur

[ ] **Monthly leaderboard poin** — rolling 30 hari (News DB)
[ ] **All-time leaderboard poin** — total poin portal (News DB)
[ ] **Export riwayat poin** — CSV dari `point_transactions` News
[ ] **Follow / subscribe kategori** — subscribe + notifikasi artikel baru
[ ] **Riwayat aktivitas lengkap** (`/activity`) — viewer transaksi poin News
[ ] **Admin: monitor leaderboard & poin** — dari News DB (bukan Core)
[ ] **Admin: activity audit log** — audit admin portal
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
| Monthly / All-time leaderboard poin | **Fase C′ — News DB** |
| Badge / level LMS | **LMS DB + Core XP** (bukan News) |
| In-app notifications (modal daily poin, bell) | **Fase E2 — News DB** · [`backlog-plan.md` §4](./backlog-plan.md#4-notifikasi-portal--fase-c--e2) |
| Newsletter subscription | **Fase E1 — News DB** · [`backlog-plan.md` §3](./backlog-plan.md#3-newsletter-subscription--fase-e1) |
| Kontributor + gate upload | **Fase A″ — News** · [`backlog-plan.md` §2](./backlog-plan.md#2-kontributor--gate-upload--fase-a) |
| Follow / subscribe kategori | **Fase E — portal** (notifikasi artikel baru) |
| Export riwayat poin | **Fase C′ — News DB** |
| Riwayat aktivitas lengkap (`/activity`) | **Fase C′/E — News DB** |
| Admin: monitor leaderboard & point transactions | **Fase C′ — News admin** |
| Admin: activity audit log | **Fase E — portal admin** |
| Komentar, like, profil author, search, tags, analytics artikel | **Fase A — tetap di portal** |
| Rate limiting, sanitasi HTML, image moderation, monitoring, logging | **Fase A — hardening portal** |

---

## 📌 Referensi

- `docs/README.md` — indeks dokumentasi News
- `docs/backlog-plan.md` — rencana teknis backlog aktif (A″, E1, E2, revisi UI)
- `docs/ecosystem-integration.md` — **kontrak cutover News ↔ Core (v2)**
- `jepangku-core/docs/ECOSYSTEM.md` — peta ekosistem 3 aplikasi
- `jepangku-core/docs/API.md` — spesifikasi HTTP API Core
- `docs/feature-status.md` — status aktual per fitur
- `docs/technical-architecture.md` — arsitektur teknis portal
- `.agents/04-project-steering.md` — arah dan prioritas proyek
- `.agents/05-ecosystem-strategy.md` — visi produk (bagian 8–12 = v1)
- `.agents/01-mvp-scope.md` · `.agents/02-user-flow.md` · `.agents/03-database-erd.md`
- `docs/cloudflare-r2-setup.md` · `docs/soft-launch-content.md`
