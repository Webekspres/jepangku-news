# 🗺️ Development Roadmap — Jepangku

Dokumen ini adalah **rencana pengerjaan berfase** untuk Jepangku setelah MVP portal berita
tercapai. Roadmap disusun mengikuti arah ekosistem di `.agents/05-ecosystem-strategy.md`,
dengan prinsip utama: **stabilkan portal lebih dulu, sambil menunggu Jepangku Core Service.**

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
| **A** | Stabilkan MVP portal (user-facing + hardening + soft launch) | 🔄 Aktif sekarang |
| **B** | Bangun Jepangku Core Service + integrasi Clerk | ⏳ Menunggu |
| **C** | Refactor portal jadi consumer Core | ⏳ Menunggu |
| **D** | Bangun LMS (`kursus.jepangku.com`) | ⏳ Menunggu |
| **E** | Fitur ekosistem global (badge, leaderboard global, membership, notifikasi, admin pusat) | ⏳ Menunggu |

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

## 🔵 Fase B — Jepangku Core Service + Clerk

Tujuan: memindahkan data shared (user, poin, file, profil) keluar dari portal ke layanan pusat.
Lihat `.agents/05-ecosystem-strategy.md` bagian 4–8.

[ ] Setup project Core Service (backend terpisah)
[ ] Integrasi **Clerk**: login, session, OAuth, email verification, MFA, password
[ ] Tabel Core: `core_users` (+ `clerk_id`), `core_user_profiles`, `core_user_settings`
[ ] Tabel role: `core_roles`, `core_permissions`, `core_role_permissions`, `core_user_roles`
[ ] Tabel poin: `core_point_transactions`, `core_point_balances`, `core_point_rules`, `core_daily_login_rewards`
[ ] Tabel file global: `core_files`
[ ] Tabel audit: `core_activity_logs`, `core_auth_logs`
[ ] Core API: `GET /me`, `POST /points/earn`, `POST /points/spend`, `GET /points/me`, `GET /leaderboard`
[ ] Skrip migrasi data: `users/user_profiles/point_transactions/daily_login_rewards/files` → tabel `core_*`

---

## 🟣 Fase C — Refactor Portal jadi Consumer Core

Tujuan: portal berhenti memiliki data user/poin, hanya menjadi consumer Core via API.
Lihat `.agents/05-ecosystem-strategy.md` bagian 9–12.

[ ] Ganti auth lokal (bcrypt + JWT di `lib/auth.ts`) → verifikasi session Clerk
[ ] Hapus `password_hash` dari portal; simpan hanya referensi `clerk_id`/`core_user_id`
[ ] Ganti `awardPoints()` lokal (`lib/points.ts`) → panggilan `POST /points/earn` ke Core
[ ] Ubah FK portal → referensi `core_user_id` (`author_core_user_id`, `reviewer_core_user_id`, dll.)
[ ] Hapus tabel `users`, `user_profiles`, `point_transactions`, `daily_login_rewards`, `files` dari portal
[ ] Halaman poin/profil/leaderboard portal membaca dari Core API

---

## 🟠 Fase D — Bangun LMS (`kursus.jepangku.com`)

Tujuan: aplikasi pembelajaran yang memakai user & poin yang sama dari Core.
Lihat `.agents/05-ecosystem-strategy.md` bagian 13.

[ ] Setup project LMS (schema domain sendiri)
[ ] Tabel: `courses`, `sections`, `lessons`, `course_enrollments`, `lesson_progress`
[ ] Quiz course + `course_quiz_attempts`
[ ] `certificates`
[ ] Integrasi Core: `GET /me`, `POST /points/earn` (`source_app = lms`)

---

## 🔴 Fase E — Fitur Ekosistem Global

Tujuan: fitur lintas aplikasi yang hanya mungkin setelah Core berdiri. Membangunnya di portal
sekarang akan terbuang — karena itu **ditunda sampai Core siap**.

[ ] **Badge / achievement global** — `core_badges`, `core_user_badges`
[ ] **Monthly leaderboard** — rolling 30 hari (dari Core)
[ ] **All-time leaderboard** — total poin sepanjang waktu (dari Core)
[ ] **Global leaderboard** — gabungan poin semua app (`source_app = all`)
[ ] **Badge / level pada leaderboard** — indikasi visual pencapaian
[ ] **In-app notifications** — `core_notifications` (artikel diapprove/ditolak, poin, badge, dll.)
[ ] **Follow / subscribe kategori** — subscribe + notifikasi artikel baru
[ ] **Export riwayat poin** — download CSV transaksi poin (dari Core)
[ ] **Riwayat aktivitas lengkap** (`/activity`) — viewer `core_activity_logs`
[ ] **Admin: monitor leaderboard** — dari sisi admin (data Core)
[ ] **Admin: monitor point transactions** — semua transaksi poin, filter by user/tipe/periode (data Core)
[ ] **Admin: activity audit log** — log aksi admin (`core_activity_logs`)
[ ] **Membership & payment** — `core_membership_plans`, `core_memberships`, `core_subscriptions`, `core_payments`
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

- `.agents/01-mvp-scope.md` — scope MVP dan batasan fitur
- `.agents/02-user-flow.md` — role permissions dan user/admin flow
- `.agents/03-database-erd.md` — desain database dan schema
- `.agents/04-project-steering.md` — arah dan prioritas proyek
- `.agents/05-ecosystem-strategy.md` — arsitektur ekosistem & Core Service
- `docs/feature-status.md` — status aktual per fitur
- `docs/technical-architecture.md` — arsitektur teknis
- `docs/cloudflare-r2-setup.md` — setup Cloudflare R2
- `docs/soft-launch-content.md` — checklist konten soft launch
