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
- Shared auth (Clerk) / Core Service / multi-app / LMS dikerjakan pada Fase B–E

---

## 🚧 Belum Diimplementasi

### 🔐 Auth & Akun — *Fase B/C (ditangani Clerk)*

[ ] **Email verification** — kirim email konfirmasi saat register, validasi token sebelum akun aktif
[ ] **Forgot password / password reset** — form request reset, kirim email link, form set password baru
[ ] **OAuth login** — login via Google/sosial media (opsional, sesuai arah ekosistem)
[ ] **Session management UI** — user bisa lihat dan revoke session aktif

### ⚙️ Keamanan & Kualitas — *Fase A (portal)*

[~] **Rate limiting** — in-memory (tanpa Redis): login, register, submit/update artikel, vote, share, comment, quiz attempt, upload, read-complete, bookmark; log saat 429. *Defer pre-launch:* Redis/Upstash untuk multi-instance Vercel
[~] **Input sanitasi HTML** — artikel (write + read), komentar, profil, quiz/poll admin; whitelist img tanpa `data:` URI. *Defer:* migrasi sanitasi ulang konten lama di DB
[~] **Image moderation** — validasi magic bytes + MIME + ukuran (min/max); moderasi AI opsional via env; rate limit upload. *Defer:* wajibkan layanan moderasi di production
[~] **Monitoring & alerting** — `captureException` + webhook opsional (`MONITORING_WEBHOOK_URL`); `GET /api/health` untuk uptime checker. *Defer:* Sentry SDK + alert channel terpusat
[~] **Logging structured** — JSON console via `logger` + `proxy.ts` log semua `/api/*` (requestId, method, path, IP); log rate limit & moderasi. *Defer:* log drain / file persistence

### 💬 Engagement & Sosial — *Fase A (portal): komentar & like; Fase E (Core): notifikasi & follow*

[x] **Sistem komentar** — komentar pada artikel, polling, dan kuis (model polimorfik), thread 1 level (balasan), edit/hapus milik sendiri, moderasi admin (sembunyikan/hapus), +2 poin sekali per target
[ ] **Reaction / like artikel** — user bisa react/like artikel sebagai bentuk engagement ringan
[ ] **In-app notifications** — notifikasi artikel diapprove/ditolak, komentar baru, poin diterima
[ ] **Follow / subscribe kategori** — user bisa subscribe kategori dan dapat notifikasi artikel baru

### 🔍 Search & Discovery — *Fase A (portal)*

[ ] **Dedicated search result page** — `/search?q=...` dengan hasil artikel + quiz + poll sekaligus
[ ] **Trending articles discovery** — halaman atau section khusus trending (bukan hanya sort param)
[ ] **Related tags di halaman artikel** — klik tag langsung filter artikel dengan tag tersebut
[ ] **Popular / trending tags** — tampilan tag populer di sidebar atau halaman explore

### 👤 Profile & Discovery Author — *Fase A (portal)*

[ ] **Author profile publik** — halaman `/profile/[username]` yang bisa dilihat user lain: bio, artikel published, statistik publik
[ ] **Statistik penulis** — total artikel published, total views, total bookmark diterima

### 📈 Analytics Konten — *Fase A (portal)*

[ ] **View analytics per artikel** — grafik views per hari/minggu, unique visitor vs total views
[ ] **Content performance report** — artikel dengan views, bookmark, share tertinggi dalam periode tertentu
[ ] **Admin: lihat statistik per kategori** — berapa artikel, views, engagement per kategori
[ ] **Statistik detail per quiz di admin** — berapa user sudah attempt, distribusi skor, pass rate
[ ] **Statistik detail per poll di admin** — breakdown votasi per opsi, tren waktu

### 🔐 Auth Lanjutan — *Fase B/C (ditangani Clerk)*

[ ] **Email verification** — sudah tercantum di bagian Auth & Akun di atas
[ ] **Forgot password / password reset**
[ ] **OAuth login** — Google/sosial media
[ ] **Session management UI** — lihat & revoke session aktif

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

### 🌐 Ekosistem & Infrastruktur — *Fase B/D/E*

[ ] **Jepangku Core Service** — user/profil/poin/role/badge/membership/notifikasi global (Fase B)
[ ] **Shared auth (Clerk)** — authentication terpusat untuk semua app (Fase B/C)
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

1. Hardening: sanitasi HTML, rate limiting, image moderation, logging, monitoring
2. Engagement portal: komentar artikel, reaction/like
3. Profil publik author + statistik penulis
4. Search & discovery: dedicated search page, trending, related/popular tags
5. Analytics konten: view analytics, content performance, statistik kategori/quiz/poll
6. Soft launch: konten artikel + 9 halaman statis

### Fase B–C — Menunggu Core Service

1. Bangun Jepangku Core Service + integrasi Clerk
2. Migrasi user/profil/poin/file ke Core
3. Refactor portal jadi consumer Core (auth Clerk, poin via Core API, FK `core_user_id`)

### Fase D–E — Ekosistem

1. Bangun LMS (`kursus.jepangku.com`)
2. Badge, leaderboard global, notifikasi, membership/payment, admin pusat

---

## 📦 Checklist Halaman (File-by-File)

### Belum Ada

[ ] `app/(user)/activity/page.tsx` — riwayat aktivitas user
[ ] `app/(public)/profile/[username]/page.tsx` — profil publik author
[ ] `app/(admin)/admin/leaderboard/page.tsx` — monitor leaderboard dari admin
[ ] `app/(admin)/admin/points/page.tsx` — monitor semua transaksi poin
[ ] `app/(admin)/admin/activity-log/page.tsx` — audit log aksi admin

### Public

[x] `app/(public)/page.tsx` — homepage (featured slider, trending, polls/quiz, leaderboard, kategori)
[x] `app/(public)/articles/page.tsx` — articles list (search, filter kategori, tag, sort)
[x] `app/(public)/articles/[slug]/page.tsx` — article detail (read complete, bookmark, share, related)
[x] `app/(public)/polls/page.tsx` — polls list
[x] `app/(public)/polls/[slug]/page.tsx` — poll detail (vote, hasil)
[x] `app/(public)/quizzes/page.tsx` — quizzes list
[x] `app/(public)/quizzes/[slug]/page.tsx` — quiz detail (attempt, hasil langsung)
[x] `app/(public)/leaderboard/page.tsx` — leaderboard mingguan

### User

[x] `app/(user)/bookmarks/page.tsx` — list artikel yang di-bookmark
[x] `app/(user)/my-articles/page.tsx` — list artikel user + status + riwayat review
[x] `app/(user)/points/page.tsx` — riwayat transaksi poin lengkap
[x] `app/(user)/profile/page.tsx` — halaman profil (stats, recent points, quick actions)
[x] `app/(user)/profile/edit/page.tsx` — edit profil (avatar, name, bio, username cooldown)
[x] `app/(user)/submit-article/page.tsx` — submit artikel (RichTextEditor, upload, kategori, tag)
[x] `app/(user)/edit-article/[id]/page.tsx` — edit artikel (pre-populate, same flow)

### Admin

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

## ✅ Sudah Diimplementasi (Verified)

### 🔐 Auth & Akun

[x] Register: validasi uniqueness email/username, bcrypt hash, JWT cookie (access 15m + refresh 7d), seed DB otomatis
[x] Login: mendukung email atau username, cek status banned, JWT cookie
[x] Logout: clear cookie
[x] `GET /api/auth/me`: validasi JWT, return data user bersih
[x] Daily login points: `checkDailyLogin()` dipanggil tiap login, +3 poin per hari via `DailyLoginReward` table
[x] Username change cooldown 14 hari (field `usernameChangedAt`, enforced di API + UI profile edit)

### 📰 Artikel — Publik & User

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

### 💬 Komentar

[x] Model `Comment` polimorfik (`targetType` ARTICLE/POLL/QUIZ + `targetId`), thread 1 level via `parentId`, soft-delete (`deletedAt`), moderasi (`status` VISIBLE/HIDDEN)
[x] `GET /api/comments?targetType=&targetId=`: thread publik (komentar HIDDEN/terhapus jadi placeholder bila punya balasan tampil)
[x] `POST /api/comments`: auth required, validasi + sanitasi plain-text (maks 1000), rate limit 10/menit, verifikasi target ada, +2 poin sekali per target via `awardPoints()`
[x] `PATCH/DELETE /api/comments/[id]`: edit & soft-delete milik sendiri (admin bisa hapus semua)
[x] `GET /api/admin/comments`: list moderasi dengan filter status/tipe + search + pagination
[x] `PATCH/DELETE /api/admin/comments/[id]`: sembunyikan/tampilkan + hapus permanen
[x] `components/CommentSection.tsx`: komponen reusable (form, balasan, edit, hapus, kontrol moderasi admin inline) — terpasang di halaman detail artikel, polling, kuis
[x] `app/(admin)/admin/comments/page.tsx`: halaman moderasi + tautan di dashboard admin

### 🏆 Leaderboard & Poin

[x] `GET /api/leaderboard/weekly`: rolling window 7 hari, group by userId, resolve display name dari profile
[x] `GET /api/points/my`: return 100 transaksi poin terakhir milik user
[x] Halaman leaderboard mingguan publik
[x] Halaman points user dengan riwayat transaksi lengkap + ikon per tipe aktivitas

### 📤 Upload

[x] `POST /api/upload`: auth required, validasi tipe image + max 10MB, upload ke Cloudflare R2 (graceful fallback jika unconfigured), simpan record ke tabel `File`
[x] `lib/r2.ts`: S3Client wrapper, `uploadToR2`, `deleteFromR2`, `getSignedUrlR2`, fallback path jika unconfigured

### 👤 Profile User

[x] `GET/PUT /api/profile`: get profile + stats, update displayName / bio / avatar
[x] Halaman profil: stats dari API, recent points, quick actions
[x] Edit profil: avatar upload, name/username (dengan cooldown 14 hari), displayName, bio
[x] Avatar upload terintegrasi profile edit

### 📄 Halaman User

[x] `app/(user)/submit-article`: RichTextEditor, image upload, pilih kategori/tag, simpan sebagai draft atau submit untuk review
[x] `app/(user)/edit-article/[id]`: pre-populate form dari API, flow submit sama dengan create
[x] `app/(user)/my-articles`: filter by status, preview catatan penolakan, aksi edit/submit/hapus, modal riwayat review
[x] `app/(user)/bookmarks`: list artikel yang di-bookmark
[x] `app/(user)/points`: riwayat transaksi poin lengkap
[x] `app/(user)/profile`: halaman profil user
[x] `app/(user)/profile/edit`: form edit profil

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

[x] Homepage: featured article slider auto-advance, trending sidebar, hero search, latest articles grid, polls + quiz CTA, leaderboard preview, kategori grid
[x] `app/(public)/articles/page.tsx`: search box, filter kategori, filter tag (toggle panel via URL param `?tag=`), sort latest/popular/trending, pagination
[x] `app/(public)/articles/[slug]/page.tsx`: read complete detection, bookmark toggle, share tracking, related articles, tags
[x] `app/(public)/polls/page.tsx`: list polling
[x] `app/(public)/polls/[slug]/page.tsx`: detail polling, vote, hasil persentase
[x] `app/(public)/quizzes/page.tsx`: list quiz
[x] `app/(public)/quizzes/[slug]/page.tsx`: detail quiz, submit jawaban, hasil langsung
[x] `app/(public)/leaderboard/page.tsx`: weekly leaderboard
[x] Search icon di Navbar (desktop + mobile) redirect ke `/articles?search=...`
[x] Kategori di homepage sebagai shortcut ke `/articles?category=slug`

### 🔧 Utilities & Infrastruktur

[x] `lib/auth.ts`: bcrypt, JWT create/verify, `getCurrentUser`, `getCurrentAdmin`, cookie set/clear
[x] `lib/points.ts`: `awardPoints()` dengan idempotency via unique constraint + race condition handling
[x] `lib/slug.ts`: `createSlug` (user content) dan `createAdminSlug` (admin content)
[x] `lib/article-tags.ts`: `syncArticleTags`, `resolveCategoryId`
[x] `lib/admin-articles-query.ts`: filter/sort query builder admin articles
[x] `lib/db.ts`: Prisma client singleton
[x] `lib/seed.ts`: auto-seed DB dipanggil saat register/login/categories
[x] `components/ui/confirm-modal.tsx` + `useConfirm` hook: reusable confirm dialog
[x] `components/ui/review-history-modal.tsx` + `useReviewHistory` hook: modal riwayat review artikel
[x] `RichTextEditor` component: digunakan di submit/edit article

### 📰 Artikel — Admin & Workflow

[x] **Admin: create artikel langsung dari panel** — `admin/articles/create`, `POST /api/admin/articles` (publish langsung / draft / antrian review)
[x] **Admin: edit artikel published** — `admin/articles/[id]/edit`, slug published tidak berubah otomatis saat judul diedit
[x] **Admin: archive artikel** — status `ARCHIVED` dari form edit + bulk archive
[x] **Admin: bulk action artikel** — checkbox di list + `POST /api/admin/articles/bulk` (approve/reject/archive/delete)
[x] **Admin: export data CSV/JSON** — `GET /api/admin/articles/export` (artikel; mengikuti filter aktif)
[x] **Admin artikel: filter + sort lengkap** — filter author, kategori, tanggal, search, sort latest/oldest/popular/published
[x] **Pagination di my-articles** — saat ini list mungkin tanpa pagination jika artikel banyak
[x] **Draft autosave** — simpan draft otomatis selama user mengetik di form submit/edit artikel
[x] **Preview sebelum submit** — user bisa preview artikel sebelum submit untuk review

---

## 🚀 Soft Launch Checklist

**Target:** 30–50 artikel + 9 halaman statis untuk terlihat hidup, aktif, dan kredibel sejak hari pertama.

**Rincian per Kategori:**

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

**Halaman Statis (9 item):**

[ ] About
[ ] Contact
[ ] Advertise
[ ] Media Partner
[ ] Career
[ ] Internship
[ ] Privacy Policy
[ ] Terms of Service
[ ] Disclaimer

**Struktur Artikel per Kategori:**

Setiap kategori mempunyai guideline struktur konten yang berbeda:

- **News**: Judul fakta, lead, detail, latar belakang, dampak, kutipan, kesimpulan
- **Travel**: Judul + daya tarik, lead, akses, harga, aktivitas, tips
- **Culture**: Judul tradisi, lead, sejarah, makna, cara masyarakat, relevansi
- **Entertainment**: Judul, lead, sinopsis, highlight, fakta menarik, jadwal rilis
- **Lifestyle**: Judul tren, lead, penjelasan, contoh, tips, kesimpulan
- **Work in Japan**: Judul peluang, lead, syarat, gaji, cara apply, tips interview
- **Study in Japan**: Judul panduan, lead, jenis sekolah, biaya, cara apply, tips
- **Review Produk**: Judul produk, lead, deskripsi, kelebihan, kekurangan, harga, kesimpulan
- **Event**: Judul event + tahun, lead, info dasar, highlight, suasana, tips

**Persiapan Konten:**

[ ] Riset topik dan sumber untuk setiap kategori
[ ] Penulisan draft artikel (minimal 30 artikel untuk soft launch)
[ ] Penyuntingan dan quality check
[ ] Pengumpulan/pembuatan thumbnail/cover image
[ ] Konfigurasi kategori dan tag di admin
[ ] Publikasi artikel secara bertahap atau sekaligus
[ ] Setup halaman statis
[ ] Testing: homepage, search, filter, leaderboard, quiz, poll

**Referensi:** `docs/soft-launch-content.md` — template lengkap dan guideline penulisan artikel per kategori

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
