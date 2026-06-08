# 📌 Status Fitur & Prioritas — Jepangku News

Dokumen ini menyajikan status aktual implementasi fitur berdasarkan audit kode sumber, diurutkan dari
yang masih perlu dibangun hingga yang sudah selesai. Diperbarui secara manual setiap ada perubahan
signifikan pada fitur.

> **Rencana pengerjaan berfase** ada di `docs/development-roadmap.md` (Fase A–E). Tag fase di tiap
> bagian "Belum Diimplementasi" mengacu ke roadmap tersebut. Arah ekosistem ada di
> `.agents/05-ecosystem-strategy.md`.

---

## 🎯 Tujuan Utama

- Stabilkan portal lebih dulu (Fase A): hardening + user-facing + soft launch
- Lengkapi workflow artikel, quiz, polling, poin, dan leaderboard
- Jangan bangun fitur auth/poin/badge versi portal yang akan digantikan Core Service
- **Auth bridge:** integrasi Clerk di portal dulu; tabel `users` / poin tetap di DB news sampai Core siap (Fase C)
- Cutover penuh ke Core Service (user/poin global, FK `clerk_id`) setelah gap Core ditutup

---

## 🚧 Belum Diimplementasi

### 🚀 Soft Launch — *Fase A*

**Target:** 30–50 artikel + konten siap rilis publik.

| Kategori          | Jumlah Artikel | Status      |
| ----------------- | -------------- | ----------- |
| News              | 6–10           | ⏳ Persiapan |
| Travel            | 6–8            | ⏳ Persiapan |
| Culture           | 4–6            | ⏳ Persiapan |
| Entertainment     | 6–10           | ⏳ Persiapan |
| Lifestyle         | 4–6            | ⏳ Persiapan |
| Work in Japan     | 3–5            | ⏳ Persiapan |
| Study in Japan    | 3–5            | ⏳ Persiapan |
| Review Produk     | 3–5            | ⏳ Persiapan |
| Event             | 3–5            | ⏳ Persiapan |
| **Total Artikel** | **38–60**      | ⏳ Persiapan |

[ ] Riset topik dan sumber untuk setiap kategori
[ ] Penulisan draft artikel (minimal 30 artikel untuk soft launch)
[ ] Penyuntingan dan quality check
[ ] Pengumpulan/pembuatan thumbnail/cover image
[ ] Konfigurasi kategori dan tag di admin
[ ] Publikasi artikel secara bertahap atau sekaligus
[ ] Testing: homepage, search, filter, leaderboard, quiz, poll

**Referensi:** `docs/soft-launch-content.md` — template lengkap dan guideline penulisan artikel per kategori

### ⚙️ Keamanan & Kualitas — Defer *pre-launch / production*

[~] **Image moderation AI wajib di production** — set `IMAGE_MODERATION_ENDPOINT` + `IMAGE_MODERATION_API_KEY` (HTTP API generik; bisa wrapper AWS Rekognition, Google Vision, Sightengine, dll.)
[~] **Konfigurasi Redis/Upstash di production** — set `UPSTASH_REDIS_REST_*` atau `REDIS_URL` sebelum go-live multi-instance Vercel
[ ] **Backfill sanitasi konten lama di DB** — re-sanitize artikel/info page yang sudah ada sebelum sanitasi diterapkan
[ ] **Sentry SDK + alert channel terpusat** — ganti/extend monitoring webhook-only
[ ] **Log drain / file persistence** — export log dari Vercel ke storage terpusat

### 📦 Checklist Halaman — Belum Ada / Belum Selesai

[ ] `app/(user)/activity/page.tsx` — riwayat aktivitas user
[ ] `app/(admin)/admin/leaderboard/page.tsx` — monitor leaderboard dari admin
[ ] `app/(admin)/admin/points/page.tsx` — monitor semua transaksi poin
[ ] `app/(admin)/admin/activity-log/page.tsx` — audit log aksi admin

### 🌐 Ekosistem & Cutover Core — *Fase B/C*

[ ] **Shadow Core token** — opsional `POST /api/v1/auth/token` (non-blocking); validasi integrasi, bukan dependency login
[ ] **Cutover auth ke Core JWT** — tukar session Clerk → Core JWT untuk claims XP/role saat Core siap
[ ] **Migrasi FK portal → `clerk_id`** — `author_id`, `user_id`, dll. mengacu Clerk ID (= Core `users.id`)
[ ] **Ganti `awardPoints()` → Core API** — `POST /api/v1/gamification/award` + activity types portal + idempotency key
[ ] **Hapus tabel user/poin lokal** — `users`, `user_profiles`, `point_transactions`, `daily_login_rewards` setelah migrasi (Fase C)
[ ] **Jepangku Core Service — siap penuh** — username/profil extended, daily login global, spend poin, riwayat transaksi (koordinasi tim Core)

### 💬 Engagement & Sosial — *Fase E (Core Service)*

[ ] **In-app notifications** — notifikasi artikel diapprove/ditolak, komentar baru, poin diterima
[ ] **Follow / subscribe kategori** — user bisa subscribe kategori dan dapat notifikasi artikel baru

### 🏆 Poin, Leaderboard & Badge — *Fase E (Core Service)*

[ ] **Monthly leaderboard** — rolling window 30 hari
[ ] **All-time leaderboard** — total poin sepanjang waktu
[ ] **Filter leaderboard by app** — `source_app = news` vs `all`
[ ] **Global leaderboard** — gabungan poin dari semua app (`source_app = all`)
[ ] **Badge / level pada leaderboard** — indikasi visual pencapaian user
[ ] **Monthly / all-time quiz leaderboard per quiz**
[ ] **Export riwayat poin** — download CSV transaksi poin milik user
[ ] **Riwayat aktivitas lengkap** — `core_activity_logs` viewer (`/activity`)

### 🛡️ Admin Monitoring & Audit — *Fase E (Core Service)*

[ ] **Activity audit log** — log semua aksi admin: siapa approve apa, siapa reject apa, kapan
[ ] **Monitor leaderboard di admin** — tampilan leaderboard dari sisi admin
[ ] **Monitor point transactions di admin** — semua transaksi poin, filter by user/tipe/periode
[ ] **Point transaction summary di admin** — total poin per periode, breakdown by activity type
[ ] **User growth tracking** — grafik registrasi user per hari/minggu

### 🌐 Ekosistem Lanjutan — *Fase D/E*

[ ] **LMS integration** — `kursus.jepangku.com` dengan shared user dan poin (Fase D)
[ ] **Super-admin / role hierarchy** — role `editor`, `moderator`, `instructor`, `student` (Fase E)
[ ] **Membership & payment** — plan, subscription, payment global (Fase E)
[ ] **Admin pusat** — admin lintas aplikasi (Fase E)
[ ] **Multi-app deployment** — subdomain production per app (Fase E)
[ ] **CI/CD pipeline** — otomasi deploy ke Vercel / VPS (Fase E)
[ ] **Mobile app** — React Native atau PWA (Fase E)

---

## ⏱️ Prioritas Pengerjaan Berikutnya

Urutan pengerjaan resmi mengikuti **fase** di `docs/development-roadmap.md`. Ringkasnya:

### Fase A — Sekarang (stabilkan portal)

1. ~~Hardening: sanitasi HTML, rate limiting (Redis/Upstash + fallback), image validation, logging, monitoring~~ *(selesai — defer prod: AI moderation, Sentry, log drain)*
2. ~~Engagement portal: komentar artikel, reaction/like~~ *(selesai)*
3. ~~Profil publik author + statistik penulis~~ *(selesai)*
4. ~~Search & discovery: dedicated search page, trending, related/popular tags~~ *(selesai)*
5. ~~Analytics konten: view analytics, content performance, statistik kategori/quiz/poll~~ *(selesai)*
6. Soft launch: konten artikel (halaman statis sudah selesai)

### Fase B — Auth bridge (portal dulu, Core belum wajib)

1. ~~Integrasi Clerk + kolom `clerk_id` + JIT provisioning di DB portal~~ *(selesai)*
2. ~~Refactor `lib/auth.ts`; feature flag `AUTH_PROVIDER`~~ *(selesai)*
3. Opsional: shadow call Core `/auth/token` (non-blocking)
4. Lanjut fitur domain berita; **poin & `users` tetap lokal**

### Fase C — Cutover Core (menunggu Core siap)

1. Migrasi user/profil/poin ke Core; FK `clerk_id`
2. Ganti `awardPoints()` → Core API; hapus tabel user/poin lokal
3. Deprecate auth JWT lokal sepenuhnya

### Fase D–E — Ekosistem

1. Bangun LMS (`kursus.jepangku.com`)
2. Badge, leaderboard global, notifikasi, membership/payment, admin pusat

---

## ✅ Sudah Diimplementasi (Verified)

### 🚀 Soft Launch — Halaman Statis

[x] About
[x] Contact
[x] Advertise
[x] Media Partner
[x] Career
[x] Internship
[x] Privacy Policy
[x] Terms of Service
[x] Disclaimer

### ⚙️ Keamanan & Kualitas — *Fase A (portal)*

[x] **Rate limiting** — `lib/rate-limit.ts` + `lib/rate-limit-store.ts`: backend Upstash REST / `REDIS_URL` / in-memory fallback otomatis; endpoint: submit/update artikel, vote, share, comment, reaction, quiz attempt, upload, read-complete, bookmark; log 429 + fallback saat Redis error. Rate limit auth via Clerk (bukan API login/register lokal)
[x] **Input sanitasi HTML** — `sanitize-html` via `lib/sanitizer.ts`: write + read artikel, komentar plain-text, profil, quiz/poll admin, info pages; whitelist tag/atribut; img hanya `http`/`https` (tanpa `data:` URI)
[x] **Image moderation (validasi file)** — `lib/image-moderation.ts`: magic bytes JPEG/PNG/GIF/WebP, cek MIME vs isi file, ukuran 100 B–10 MB; dipanggil di `POST /api/upload`
[x] **Image moderation (AI opsional)** — HTTP generik `IMAGE_MODERATION_ENDPOINT` + `IMAGE_MODERATION_API_KEY`; payload base64; reject jika `decision: reject` atau `moderation: unsafe`; tanpa env = skip (warn di prod)
[x] **Monitoring & alerting** — `lib/monitoring.ts`: `captureException` + webhook opsional `MONITORING_WEBHOOK_URL`; `GET /api/health` cek koneksi DB
[x] **Logging structured** — `lib/logger.ts` JSON console + `proxy.ts` log semua `/api/*` (requestId, method, path, IP); log rate limit, moderasi, exception

### 🔐 Auth & Akun — *Clerk bridge + fallback JWT lokal (Fase B portal)*

[x] **Integrasi Clerk di portal** — `@clerk/nextjs`, halaman `/sign-in` & `/sign-up`, `proxy.ts` proteksi route user/admin (Clerk) + fallback JWT lokal
[x] **Kolom `clerk_id` di DB portal** — migration `users.clerk_id` (unique, nullable); `password_hash` nullable untuk akun Clerk-only
[x] **JIT user provisioning** — upsert/find `users` by `clerk_id` (link by email jika ada); sync via `lib/auth/clerk-user.ts`
[x] **Refactor `lib/auth.ts`** — `getCurrentUser()` / `getCurrentAdmin()` dual path: Clerk session + lookup DB portal, atau JWT lokal
[x] **Abstraction session user** — tipe `SessionUser` (`lib/auth/types.ts`); API route tetap pakai helper auth
[x] **Feature flag auth** — `AUTH_PROVIDER=local|clerk` + `NEXT_PUBLIC_AUTH_PROVIDER` (rollback ke JWT lokal)
[x] **Deprecate auth lokal** — `/login` & `/register` redirect ke `/sign-in` & `/sign-up`; API login/register disabled (410)
[x] **Email verification** — Clerk
[x] **Forgot password / password reset** — Clerk
[x] **OAuth login** — Clerk (konfigurasi di Clerk Dashboard)
[x] **Session management UI** — Clerk User Profile / Account
[x] `@clerk/nextjs` + `ClerkProvider` (saat `AUTH_PROVIDER=clerk`)
[x] Halaman `/sign-in`, `/sign-up` (Clerk UI); `/login`, `/register` redirect ke Clerk bila perlu
[x] `users.clerk_id` + JIT provisioning (`lib/auth/clerk-user.ts`)
[x] `SessionUser` abstraction; `getCurrentUser()` / `getCurrentAdmin()` dual provider
[x] `AUTH_PROVIDER` / `NEXT_PUBLIC_AUTH_PROVIDER` feature flag
[x] `proxy.ts`: proteksi route + logging API (Clerk `auth.protect` atau cookie JWT lokal)
[x] Register: validasi uniqueness email/username, bcrypt hash, JWT cookie (mode `local`)
[x] Login: mendukung email atau username, cek status banned, JWT cookie (mode `local`)
[x] Logout: clear cookie (local) / Clerk `signOut` (clerk)
[x] `GET /api/auth/me`: session user (Clerk JIT atau JWT)
[x] Daily login points: `checkDailyLogin()` saat login/provisi Clerk
[x] Username change cooldown 14 hari (field `usernameChangedAt`, enforced di API + UI profile edit)

### 📰 Artikel — Publik, User & Admin

[x] `GET /api/articles`: search (title, excerpt, content), filter kategori (by slug), filter tag, sort (latest/popular/trending), pagination
[x] `GET /api/articles/[slug]`: increment view count, related articles by category, tags resolved
[x] `POST /api/articles/create`: auth required, slug generation, resolve kategori, create/link tag, status DRAFT atau PENDING_REVIEW
[x] `GET /api/articles/my`: daftar artikel milik user, termasuk catatan review terakhir
[x] `PUT /api/articles/[slug]/update`: ownership check, hanya DRAFT/REJECTED yang bisa diedit user, admin bisa update semua status
[x] `DELETE /api/articles/[slug]/delete`: ownership check, PUBLISHED tidak bisa dihapus non-admin
[x] `POST /api/articles/[slug]/read-complete`: +2 poin sekali per artikel, anti-duplikat via `awardPoints()`, update `readCompletedAt` di ArticleView
[x] `GET /api/articles/[slug]/share`: cek status `hasShared` per user
[x] `POST /api/articles/[slug]/share`: +5 poin, satu kali per user, increment `shareCount`, simpan record ArticleShare
[x] `GET /api/articles/[slug]/reviews`: riwayat review artikel (status + reviewer), hanya penulis
[x] `GET /api/articles/[slug]/revisions`: riwayat revisi konten artikel, hanya penulis
[x] `lib/article-audit.ts`: pencatatan revisi konten, status review, lastEditedBy admin
[x] Admin edit artikel: `changeNote` wajib; tercatat di `article_revisions`
[x] `components/ui/article-activity-modal.tsx`: modal gabungan riwayat revisi + review untuk penulis
[x] Banner "+2 POINTS AWARDED" muncul di halaman artikel setelah read complete
[x] Scroll detection di halaman detail artikel — trigger saat user sampai akhir konten
[x] **Admin: create artikel langsung dari panel** — `admin/articles/create`, `POST /api/admin/articles` (publish langsung / draft / antrian review)
[x] **Admin: edit artikel published** — `admin/articles/[id]/edit`, slug published tidak berubah otomatis saat judul diedit
[x] **Admin: archive artikel** — status `ARCHIVED` dari form edit + bulk archive
[x] **Admin: bulk action artikel** — checkbox di list + `POST /api/admin/articles/bulk` (approve/reject/archive/delete)
[x] **Admin: export data CSV/JSON** — `GET /api/admin/articles/export` (artikel; mengikuti filter aktif)
[x] **Admin artikel: filter + sort lengkap** — filter author, kategori, tanggal, search, sort latest/oldest/popular/published
[x] **Pagination di my-articles** — saat ini list mungkin tanpa pagination jika artikel banyak
[x] **Draft autosave** — simpan draft otomatis selama user mengetik di form submit/edit artikel
[x] **Preview sebelum submit** — user bisa preview artikel sebelum submit untuk review
[x] `app/(user)/submit-article`: RichTextEditor, image upload, pilih kategori/tag, simpan sebagai draft atau submit untuk review
[x] `app/(user)/edit-article/[id]`: pre-populate form dari API, flow submit sama dengan create
[x] `app/(user)/my-articles`: filter by status, preview catatan penolakan, aksi edit/submit/hapus, modal riwayat review
[x] `app/(public)/articles/page.tsx`: search box, filter kategori, filter tag (toggle panel via URL param `?tag=`), sort latest/popular/trending, pagination, tag populer
[x] `app/(public)/articles/[slug]/page.tsx`: read complete detection, bookmark toggle, share tracking, related articles, tag klikabel → filter artikel

### 🧩 Quiz

[x] `GET /api/quizzes`: daftar quiz, filter by status
[x] `GET /api/quizzes/[slug]`: detail quiz dengan questions + options (jawaban benar disembunyikan dari response)
[x] `POST /api/quizzes/[slug]/attempt`: one-attempt guard, per-answer scoring, award base points + bonus per-correct via `awardPoints()`
[x] Halaman list quiz publik
[x] Halaman detail quiz + submit jawaban
[x] Hasil quiz langsung tampil setelah submit

### 📊 Polling / Voting

[x] `GET /api/polls`: daftar polling, filter status, total votes per poll dihitung
[x] `GET /api/polls/[slug]`: detail polling, persentase per opsi dihitung
[x] `POST /api/polls/[slug]/vote`: multi-question support, duplicate guard per pertanyaan per user, award poin satu kali per poll
[x] Halaman list polling publik
[x] Halaman detail polling + vote + hasil

### 🔖 Bookmark

[x] `GET /api/bookmarks`: list artikel yang di-bookmark user
[x] `POST /api/bookmarks/[articleId]`: bookmark artikel, soft-delete aware (restore jika pernah di-bookmark), +1 poin (hanya sekali)
[x] `DELETE /api/bookmarks/[articleId]`: soft-delete (set `deletedAt`), decrement `bookmarkCount`
[x] Poin bookmark tidak diberikan ulang jika user hapus lalu bookmark ulang artikel yang sama
[x] `app/(user)/bookmarks`: list artikel yang di-bookmark

### 💬 Engagement & Sosial — *Fase A (portal)*

[x] **Sistem komentar** — komentar pada artikel, polling, dan kuis (model polimorfik), thread 1 level (balasan), edit/hapus milik sendiri, moderasi admin (sembunyikan/hapus), +2 poin sekali per target
[x] **Reaction / like artikel** — sistem reaksi polimorfik (`Reaction`, target ARTICLE/POLL/QUIZ/COMMENT). Konten: 9 reaksi (Love, Lol, Cute, Win, WTF, OMG, Geeky, Scary, Fail) dengan bar di atas kolom komentar; komentar: jempol naik/turun. Satu reaksi aktif per user per target (klik = toggle/ganti), tanpa poin, rate limit 30/menit
[x] Model `Comment` polimorfik (`targetType` ARTICLE/POLL/QUIZ + `targetId`), thread 1 level via `parentId`, soft-delete (`deletedAt`), moderasi (`status` VISIBLE/HIDDEN)
[x] `GET /api/comments?targetType=&targetId=`: thread publik (komentar HIDDEN/terhapus jadi placeholder bila punya balasan tampil)
[x] `POST /api/comments`: auth required, validasi + sanitasi plain-text (maks 1000), rate limit 10/menit, verifikasi target ada, +2 poin sekali per target via `awardPoints()`
[x] `PATCH/DELETE /api/comments/[id]`: edit & soft-delete milik sendiri (admin bisa hapus semua)
[x] `GET /api/admin/comments`: list moderasi dengan filter status/tipe + search + pagination
[x] `PATCH/DELETE /api/admin/comments/[id]`: sembunyikan/tampilkan + hapus permanen
[x] `components/CommentSection.tsx`: komponen reusable (form, balasan, edit, hapus, kontrol moderasi admin inline) — terpasang di halaman detail artikel, polling, kuis
[x] `app/(admin)/admin/comments/page.tsx`: halaman moderasi + tautan di dashboard admin

### 🏆 Leaderboard & Poin — *Portal (mingguan)*

[x] `GET /api/leaderboard/weekly`: rolling window 7 hari, group by userId, resolve display name dari profile
[x] `GET /api/points/my`: return 100 transaksi poin terakhir milik user
[x] Halaman leaderboard mingguan publik
[x] Halaman points user dengan riwayat transaksi lengkap + ikon per tipe aktivitas
[x] `app/(user)/points`: riwayat transaksi poin lengkap

### 🔍 Search & Discovery — *Fase A (portal)*

[x] **Dedicated search result page** — `/search?q=...` + `GET /api/search` dengan hasil artikel + quiz + poll sekaligus; Navbar & hero search mengarah ke `/search`
[x] **Trending articles discovery** — halaman `/trending` (grid + pagination, sort `weeklyViewCount`); homepage sidebar pakai algoritma yang sama + link "Lihat Semua"
[x] **Related tags di halaman artikel** — tag ditampilkan di detail artikel, klik → `/articles?tag=<slug>`
[x] **Popular / trending tags** — `GET /api/tags/popular` (agregasi `articleTag`), komponen `PopularTags` di `/articles`, halaman `/explore` + nav "Jelajahi"
[x] `GET /api/search?q=`: pencarian lintas artikel + kuis + polling (title/excerpt/content)
[x] `GET /api/tags/popular`: tag diurutkan jumlah artikel (`articleTag` groupBy)
[x] `GET /api/homepage`: trending sidebar memakai `weeklyViewCount` (konsisten dengan `sort=trending`)
[x] `app/(public)/search/page.tsx`: hasil gabungan artikel + kuis + polling dari `GET /api/search`
[x] `app/(public)/trending/page.tsx`: discovery artikel tren mingguan dengan pagination
[x] `app/(public)/explore/page.tsx`: hub tag populer, kategori, link trending
[x] Search icon di Navbar (desktop + mobile) redirect ke `/search?q=...`
[x] Kategori di homepage sebagai shortcut ke `/articles?category=slug`

### 👤 Profile & Discovery Author — *Fase A (portal)*

[x] **Author profile publik** — `/profile/[username]` + `GET /api/profile/[username]` (hanya user `active`, tanpa email/poin); bio, avatar, artikel published, `AuthorProfileCard` di artikel (bawah reaction, atas komentar); `AuthorLink` di artikel/komentar/leaderboard
[x] **Statistik penulis** — agregat publik: total artikel published, total views, total bookmark diterima (di profil publik & API)
[x] `app/(public)/profile/[username]/page.tsx` — profil publik author (bio, stats, artikel published)
[x] `components/AuthorProfileCard.tsx` + `AuthorLink.tsx` — kartu penulis & link ke profil

### 📈 Analytics Konten — *Fase A (portal)*

[x] **View analytics per artikel** — `article_views` time-series + `/admin/analytics/articles/[id]` (grafik harian, total vs unique visitors, periode 7/30/90 hari)
[x] **Content performance report** — `/admin/analytics/content` ranking views/bookmark/share per periode + link ke detail grafik
[x] **Admin: lihat statistik per kategori** — `/admin/analytics/categories` tabel + chart views & engagement per kategori
[x] **Statistik detail per quiz di admin** — `/admin/analytics/quizzes/[id]` attempt, user unik, distribusi skor, pass rate ≥70%, tren harian
[x] **Statistik detail per poll di admin** — `/admin/analytics/polls/[id]` breakdown per pertanyaan/opsi, tren vote harian

### 👤 Profile User

[x] `GET/PUT /api/profile`: get profile + stats, update displayName / bio / avatar
[x] Halaman profil: stats dari API, recent points, quick actions
[x] Edit profil: avatar upload, name/username (dengan cooldown 14 hari), displayName, bio
[x] Avatar upload terintegrasi profile edit
[x] `app/(user)/profile`: halaman profil user
[x] `app/(user)/profile/edit`: form edit profil

### 📤 Upload

[x] `POST /api/upload`: auth required, validasi tipe image + max 10MB, `validateImageBuffer` + `moderateImage`, upload ke Cloudflare R2 (graceful fallback jika unconfigured), simpan record ke tabel `File`
[x] `lib/r2.ts`: S3Client wrapper, `uploadToR2`, `deleteFromR2`, `getSignedUrlR2`, fallback path jika unconfigured
[x] `lib/image-moderation.ts`: validasi magic bytes/MIME/ukuran + moderasi AI opsional via env

### 🛡️ Admin — API

[x] `GET /api/admin/stats`: count artikel/user/quiz/poll
[x] `GET /api/admin/articles`: list artikel, filter status/author/kategori/tanggal/search/sort
[x] `POST /api/admin/articles`: buat artikel admin (DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED)
[x] `GET /api/admin/articles/[id]`: detail artikel untuk form edit admin
[x] `POST /api/admin/articles/bulk`: approve, reject, archive, delete massal
[x] `GET /api/admin/articles/export`: export CSV atau JSON dengan filter yang sama
[x] `GET /api/admin/articles/pending`: filter PENDING_REVIEW saja
[x] `POST /api/admin/articles/[id]/approve`: set PUBLISHED, buat record ArticleReview
[x] `POST /api/admin/articles/[id]/reject`: set REJECTED, buat record ArticleReview dengan catatan
[x] `PUT /api/admin/articles/[id]/featured`: toggle `isFeatured`
[x] `PUT /api/admin/articles/[id]/hot`: toggle `isHot`
[x] `GET/POST /api/admin/tags`: list dengan usage count, buat tag baru dengan slug, duplicate guard
[x] `DELETE /api/admin/tags/[id]`: guard hapus jika tag masih dipakai artikel
[x] `GET/PUT /api/admin/users`: search/filter, update role + status user
[x] `GET /api/admin/users/[id]`: detail user + artikel + transaksi poin + statistik
[x] `GET/POST /api/admin/categories`: CRUD dengan slug generation, duplicate guard
[x] `PATCH/DELETE /api/admin/categories/[id]`: update dengan rename check, delete dengan guard artikel
[x] `GET /api/admin/homepage`: return featured + hot articles
[x] `GET/POST /api/admin/polls`: list dengan filter, create dengan questions + options validasi
[x] `GET/PATCH/DELETE /api/admin/polls/[id]`: edit semua field + replace questions, delete hanya DRAFT
[x] `GET/POST /api/admin/quizzes`: list dengan filter, create dengan questions + options + correct answers
[x] `GET/PATCH/DELETE /api/admin/quizzes/[id]`: edit semua field + replace questions, delete hanya DRAFT

### 🛡️ Admin — Halaman

[x] `app/(admin)/admin/page.tsx`: stats cards, quick action links, preview artikel pending
[x] `app/(admin)/admin/homepage/page.tsx`: toggle featured/hot untuk semua artikel published, search, live data
[x] `app/(admin)/admin/tags/page.tsx`: CRUD tag, usage count, guard hapus
[x] `app/(admin)/admin/users/page.tsx`: list user dengan search + filter role, update role/status
[x] `app/(admin)/admin/users/[id]/page.tsx`: detail user + statistik + transaksi poin
[x] `app/(admin)/admin/articles/page.tsx`: list artikel admin, filter lengkap, bulk action, export, link edit
[x] `app/(admin)/admin/articles/create/page.tsx`: buat artikel admin (publish langsung)
[x] `app/(admin)/admin/articles/[id]/edit/page.tsx`: edit artikel semua status termasuk published
[x] `app/(admin)/admin/articles/review/page.tsx`: queue review + detail + approve/reject dengan catatan
[x] `app/(admin)/admin/categories/page.tsx`: CRUD kategori, toggle aktif/nonaktif, guard hapus, confirm modal
[x] `app/(admin)/admin/quizzes/page.tsx`: list quiz, filter status, aksi aktivasi/hapus, link ke edit
[x] `app/(admin)/admin/quizzes/create/page.tsx`: multi-question builder, marking jawaban benar, image upload per soal/opsi
[x] `app/(admin)/admin/quizzes/[id]/edit/page.tsx`: load data existing, same builder seperti create
[x] `app/(admin)/admin/polls/page.tsx`: list polling, filter status + tipe, aksi tutup/aktifkan/hapus
[x] `app/(admin)/admin/polls/create/page.tsx`: multi-question builder, image upload, toggle guest vote
[x] `app/(admin)/admin/polls/[id]/edit/page.tsx`: load data existing, same builder seperti create

### 🌐 Halaman Publik

[x] Homepage: featured article slider auto-advance, trending sidebar (`weeklyViewCount`), hero search → `/search`, latest articles grid, polls + quiz CTA, leaderboard preview, kategori grid
[x] `app/(public)/page.tsx` — homepage (featured slider, trending, polls/quiz, leaderboard, kategori)
[x] `app/(public)/polls/page.tsx`: list polling
[x] `app/(public)/polls/[slug]/page.tsx`: detail polling, vote, hasil persentase
[x] `app/(public)/quizzes/page.tsx`: list quiz
[x] `app/(public)/quizzes/[slug]/page.tsx`: detail quiz, submit jawaban, hasil langsung
[x] `app/(public)/leaderboard/page.tsx`: weekly leaderboard

### 🔧 Utilities & Infrastruktur

[x] `lib/auth.ts` + `lib/auth/*`: Clerk bridge, JWT lokal, `SessionUser`, feature flag
[x] `lib/rate-limit.ts` + `lib/rate-limit-store.ts`: rate limit Upstash / Redis / in-memory + fallback
[x] `lib/sanitizer.ts`: sanitasi HTML, plain-text, media URL
[x] `lib/monitoring.ts` + `lib/logger.ts`: exception capture, webhook, structured JSON log
[x] `lib/points.ts`: `awardPoints()` dengan idempotency via unique constraint + race condition handling
[x] `lib/slug.ts`: `createSlug` (user content) dan `createAdminSlug` (admin content)
[x] `lib/article-tags.ts`: `syncArticleTags`, `resolveCategoryId`
[x] `lib/admin-articles-query.ts`: filter/sort query builder admin articles
[x] `lib/db.ts`: Prisma client singleton
[x] `lib/seed.ts`: auto-seed DB dipanggil saat register/login/categories
[x] `components/ui/confirm-modal.tsx` + `useConfirm` hook: reusable confirm dialog
[x] `components/ui/review-history-modal.tsx` + `useReviewHistory` hook: modal riwayat review artikel
[x] `RichTextEditor` component: digunakan di submit/edit article

### 📦 Checklist Halaman — Sudah Selesai

[x] `app/(public)/profile/[username]/page.tsx` — profil publik author (bio, stats, artikel published)
[x] `GET /api/profile/[username]` — profil & artikel publik penulis
[x] `components/AuthorProfileCard.tsx` + `AuthorLink.tsx` — kartu penulis & link ke profil
[x] `app/(public)/page.tsx` — homepage (featured slider, trending, polls/quiz, leaderboard, kategori)
[x] `app/(public)/articles/page.tsx` — articles list (search, filter kategori, tag, sort)
[x] `app/(public)/articles/[slug]/page.tsx` — article detail (read complete, bookmark, share, related)
[x] `app/(public)/polls/page.tsx` — polls list
[x] `app/(public)/polls/[slug]/page.tsx` — poll detail (vote, hasil)
[x] `app/(public)/quizzes/page.tsx` — quizzes list
[x] `app/(public)/quizzes/[slug]/page.tsx` — quiz detail (attempt, hasil langsung)
[x] `app/(public)/leaderboard/page.tsx` — leaderboard mingguan
[x] `app/(user)/bookmarks/page.tsx` — list artikel yang di-bookmark
[x] `app/(user)/my-articles/page.tsx` — list artikel user + status + riwayat review
[x] `app/(user)/points/page.tsx` — riwayat transaksi poin lengkap
[x] `app/(user)/profile/page.tsx` — halaman profil (stats, recent points, quick actions)
[x] `app/(user)/profile/edit/page.tsx` — edit profil (avatar, name, bio, username cooldown)
[x] `app/(user)/submit-article/page.tsx` — submit artikel (RichTextEditor, upload, kategori, tag)
[x] `app/(user)/edit-article/[id]/page.tsx` — edit artikel (pre-populate, same flow)
[x] `app/(admin)/admin/page.tsx` — dashboard (stats, quick actions, pending preview)
[x] `app/(admin)/admin/homepage/page.tsx` — manage featured/hot artikel (full functional)
[x] `app/(admin)/admin/tags/page.tsx` — CRUD tag
[x] `app/(admin)/admin/users/page.tsx` — list + search + filter + update role/status user
[x] `app/(admin)/admin/users/[id]/page.tsx` — detail user (stats + poin + artikel)
[x] `app/(admin)/admin/articles/page.tsx` — list artikel admin (filter status)
[x] `app/(admin)/admin/articles/review/page.tsx` — review queue (approve/reject dengan catatan)
[x] `app/(admin)/admin/categories/page.tsx` — CRUD kategori (toggle aktif, guard hapus)
[x] `app/(admin)/admin/quizzes/page.tsx` — list quiz (filter, aktivasi, hapus)
[x] `app/(admin)/admin/quizzes/create/page.tsx` — buat quiz (multi-question builder)
[x] `app/(admin)/admin/quizzes/[id]/edit/page.tsx` — edit quiz
[x] `app/(admin)/admin/polls/page.tsx` — list poll (filter, tutup, aktivasi, hapus)
[x] `app/(admin)/admin/polls/create/page.tsx` — buat poll (multi-question builder)
[x] `app/(admin)/admin/polls/[id]/edit/page.tsx` — edit poll
[x] `app/(admin)/admin/articles/create/page.tsx` — admin buat artikel
[x] `app/(admin)/admin/articles/[id]/edit/page.tsx` — admin edit artikel

---

## 📌 Referensi

- `.agents/01-mvp-scope.md` — scope MVP dan batasan fitur
- `.agents/02-user-flow.md` — role permissions dan user/admin flow
- `.agents/03-database-erd.md` — desain database dan schema
- `.agents/04-project-steering.md` — arah dan prioritas proyek
- `.agents/05-ecosystem-strategy.md` — arsitektur ekosistem & Core Service
- `docs/development-roadmap.md` — rencana pengerjaan berfase (Fase A–E)
- `docs/technical-architecture.md` — arsitektur teknis
- `docs/cloudflare-r2-setup.md` — setup Cloudflare R2
- `docs/soft-launch-content.md` — checklist konten soft launch
