# Status Fitur & Checklist — Jepangku News

> **Diperbarui:** Juni 2026 (audit kode `jepangku-news`)  
> **Status aplikasi:** ✅ **Sepenuhnya diimplementasi** — portal production-ready.  
> **Sisa rencana:** hanya **[§ Rencana Lanjutan](#rencana-lanjutan--bisa-nanti-ekosistem-fase-de)** (ekosistem lintas-app; bukan blokir rilis).  
> **Legenda:** `[ ]` belum · `[x]` selesai (verified) · `[~]` operasional / tim editorial  
> **Rincian teknis:** [`backlog-plan.md`](./backlog-plan.md) · [`ecosystem-integration.md`](./ecosystem-integration.md) · [`development-roadmap.md`](./development-roadmap.md)  
> **Entry point per fitur:** [`testing-inventory.md`](./testing-inventory.md)

---

## Daftar isi

1. [Ringkasan](#ringkasan)
2. [Sudah diimplementasi — per domain §1–§20](#sudah-diimplementasi--per-domain-120)
3. [Checklist testing — kerjakan](#checklist-testing--kerjakan)
4. [Rencana lanjutan](#rencana-lanjutan--bisa-nanti-ekosistem-fase-de)
5. [Referensi](#referensi)

---

## Ringkasan

| Aspek | Status |
| :--- | :--- |
| Fitur fungsional | 160 fitur · ~197 kondisi — semua diimplementasi |
| Test otomatis | `bun run test` = unit (~156) + integration API inti (~146) |
| QA browser/UI | Manual — [`testing-inventory.md`](./testing-inventory.md) |
| Non-functional | Lighthouse Mobile **42** / Desktop **89** · `verify:non-functional` 47/47 |

---

## Sudah Diimplementasi — per domain §1–§20

### §1 Autentikasi & akun

[x] `@clerk/nextjs` + `/sign-in`, `/sign-up`  
[x] JIT user provisioning (`lib/auth/clerk-user.ts`)  
[x] `SessionUser` abstraction + feature flag `AUTH_PROVIDER`  
[x] `proxy.ts` — proteksi route user/admin + logging API  
[x] `/login`, `/register` redirect ke Clerk; API lokal disabled (410)  
[x] Email verification, forgot password, OAuth — via Clerk  
[x] Username change cooldown 14 hari  
[x] `GET /api/auth/me`, logout Clerk/local  
[x] Kebijakan akun legacy — `isClerkUserId` guard, relink email, `purge:legacy-users`  
[x] Env News — `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_JWT_*`  
[x] Deploy Core prod — `GET https://core.jepangku.com/health` OK  
[x] News env prod — `CORE_API_URL`, `CORE_JWT_PUBLIC_KEY`, `CORE_JWT_ISSUER`  
[x] `lib/core/` — client, auth, gamification, types, activity-map, config, session  
[x] Migrasi DB — FK Clerk ID; `users.id` = Clerk ID  
[x] Core JWT — cookie `core_session` via `lib/core/session.ts`  
[x] `getCurrentUser()` / `getCurrentAdmin()` / `hasNewsAdminAccess()`  
[x] Skrip sync — `bun run db:sync-clerk` (Clerk → Core + `PORTAL_ADMIN`)  
[x] Verifikasi integrasi — `bun run verify:core`  
[x] Core down graceful degrade + runbook [`docs/runbooks/core-service-down.md`](./runbooks/core-service-down.md)

### §2 Profil & data user

[x] Profil user — `/profile`, `/profile/edit`, avatar upload (crop)  
[x] Profil publik penulis — `/profile/[username]`  
[x] `AuthorProfileCard`, `AuthorLink`, statistik penulis publik  
[x] `GET /api/user/gamification` — saldo poin di navbar & profil  
[x] `PATCH /api/user/profile` — persist ke DB

### §3 Artikel

[x] CRUD API — list, detail, create, update, delete, my-articles, drafts  
[x] Workflow status — `DRAFT` → `PENDING_REVIEW` → `PUBLISHED` / `REJECTED` / `ARCHIVED`  
[x] Read complete (+2 poin), share (+5), bookmark (+1)  
[x] Revisions & review history — `lib/article-audit.ts`, modal admin & penulis  
[x] `lib/article-view-url.ts` — pratinjau vs publik (`getArticleViewHref`)  
[x] Admin — create, edit published, review queue `/admin/articles/review`, bulk, export CSV/JSON  
[x] Draft autosave & preview sebelum submit  
[x] Halaman — `/articles`, `/articles/[slug]`, submit, edit, my-articles, preview-article  
[x] Scroll detection read complete + banner poin  
[x] `ArticleEditAside.tsx` — aksi review/reject/publish di admin edit  
[x] Sidebar iklan artikel (`ArticleSidebarAd.tsx`)

### §4 Kuis

[x] API quiz — list, detail, attempt (one-attempt, scoring, poin)  
[x] Halaman publik `/quizzes`, `/quizzes/[slug]`  
[x] Admin CRUD quiz (multi-question builder, image upload)  
[x] `/admin/quizzes/[id]/analytics` — attempt, skor, pass rate  
[x] Monthly / all-time quiz leaderboard per quiz

### §5 Poll

[x] API poll — list, detail, vote (multi-question, duplicate guard, poin)  
[x] Halaman publik `/polls`, `/polls/[slug]`  
[x] Admin CRUD poll (multi-question builder, image upload)  
[x] `/admin/polls/[id]/analytics` — breakdown vote

### §6 Video — Jepangku TV

[x] Model `Video`, admin `/admin/videos`, `/tv`, `/tv/[slug]`  
[x] `GET /api/home/tv` — Wave 3 lazy homepage  
[x] Multi-platform embed — YouTube, Facebook, TikTok (iframe); Instagram & URL lain (link-out)  
[x] `lib/video/platform.ts` — deteksi platform + `parseVideoUrl`  
[x] Lazy embed click-to-play (`LazyVideoEmbed`) · wrapper YouTube (`LazyYoutubeEmbed`)  
[x] Kolom DB `video_url` + `platform` (migrasi backfill dari `youtube_id`)

### §7 Engagement & interaksi

[x] Bookmark — API + halaman `/bookmarks`  
[x] Komentar polimorfik — thread 1 level, moderasi admin, +2 poin (`lib/comments.ts`)  
[x] Reaksi 9 emoji (artikel/poll/quiz) + jempol komentar  
[x] Admin moderasi komentar — `/admin/comments`  
[x] Halaman browse reaksi — `/reactions/[type]`  
[x] Follow / subscribe kategori + notifikasi artikel baru  
[x] Share flow — native share / copy link

### §8 Gamifikasi — poin & leaderboard

[x] Schema `point_transactions` di News DB  
[x] `lib/points.ts` — `awardPoints`, `getUserPointBalance`, `checkDailyLogin`  
[x] `GET /api/points/my` — saldo + 100 transaksi terakhir  
[x] `GET /api/leaderboard` + `/weekly` — agregasi `point_transactions`  
[x] `lib/leaderboard/queries.ts` — weekly, monthly, all-time (Asia/Jakarta)  
[x] Halaman `/leaderboard` — tab mingguan / bulanan / all-time  
[x] `app/(user)/activity/page.tsx` — riwayat aktivitas user  
[x] `/points` → redirect ke `/activity`  
[x] Export riwayat poin CSV milik user  
[x] Admin — `/admin/points`, `/admin/leaderboard`  
[x] `awardXp()` Core — tidak dipakai aktivitas portal

### §9 Notifikasi & email

**Prinsip:** inbox persisten di News Prisma; event dispatcher terpusat; modal sesi terpisah dari bell; realtime via Redis/Upstash + SSE; email async untuk event penting.

[x] Model `Notification` + migrasi Prisma + index + dedupe  
[x] `lib/notifications/` — create, dispatch, types, handlers  
[x] REST API — list, unread-count, mark read, read-all, session bootstrap  
[x] Event hooks — artikel publish/reject/pending, kontributor, komentar (group cap)  
[x] Realtime — Redis pub/sub + SSE + poll fallback  
[x] UI — `NotificationBellMenu`, welcome/daily modal, guest bell hidden  
[x] Email outbox + template (welcome, reject, kontributor)  
[x] Retention — `purge:notifications` · `bun run verify:notifications`

### §10 Newsletter

[x] Model `NewsletterSubscription`  
[x] Footer form + `POST /api/newsletter/subscribe`  
[x] Admin CRUD `/admin/newsletter` + export CSV  
[x] Halaman unsubscribe (wajib login akun yang sama)  
[x] Email template + Resend outbox

### §11 Kontributor

[x] Role `CONTRIBUTOR` + model `ContributorApplication`  
[x] `lib/contributor.ts` — `canCreateArticles()`, `getContributorCta()`  
[x] API — `POST /api/contributor/apply`, `GET /api/contributor/status`  
[x] Admin — `/admin/contributors` approve/reject + notifikasi  
[x] Gate — `POST /api/articles/create`, submit/edit/my/preview (`ContributorGate`)  
[x] Form `/contributor/apply` — `ContributorApplyForm.tsx`  
[x] CTA kontributor — navbar dropdown, sidebar, profile

### §12 Homepage & discovery

[x] `lib/home/queries/*` — feed, categories-editorial, tv, ads, lms-teaser, reactions, engagement  
[x] Wave APIs — `/api/home/feed`, `/categories-editorial`, `/tv`, `/ads`, `/lms-teaser`, `/reactions`, `/engagement`  
[x] `hooks/useLazySection.ts`, `LazySectionShell`, `LazySectionSkeleton`  
[x] Featured, Trending, Hari Ini, kategori editorial, engagement sections  
[x] `/search?q=` + `GET /api/search` (artikel + quiz + poll)  
[x] `/trending` — sort `weeklyViewCount` · `/explore` — tag populer + kategori  
[x] Navbar & hero search → `/search`  
[x] Empty state tiap section · section error isolated · skeleton min-height  
[x] `data-testid` section & wave · `bun run verify:home`

### §13 Integrasi LMS teaser

[x] Domain LMS — staging `dev.kursus.jepangku.com`, prod `kursus.jepangku.com`  
[x] News proxy `/api/home/lms-teaser` — live courses + placeholder fallback  
[x] `lib/lms/client.ts` + tipe kontrak `lib/lms/types.ts`  
[x] UTM links — `buildLmsUrl()` di `lib/lms/constants.ts`

### §14 Iklan & monetisasi

[x] Model `AdSlot`, admin `/admin/ads`, `AdBannerSlot.tsx`  
[x] Slot homepage + `article-sidebar`  
[x] Jadwal aktif/nonaktif · client cache (`lib/ads/`)

### §15 Admin — dashboard & monitoring

[x] Dashboard `/admin` — stats, quick actions, pending preview  
[x] `/admin/activity-log` — audit log + grafik registrasi user  
[x] Manajemen user — list, detail, role/status  
[x] `/admin/points` · `/admin/leaderboard` — monitor gamifikasi  
[x] `lib/admin-monitoring.ts` — agregasi review artikel & kontributor

### §16 Admin — konten & taxonomi

[x] Kategori, tag, homepage featured/hot, info pages CRUD  
[x] Site social links — admin CRUD + footer  
[x] Videos, ads, quizzes, polls CRUD

### §17 Admin — analytics

[x] `/admin/analytics` — hub ringkasan + drill-down  
[x] `/admin/analytics/content` · `/categories` · `/articles/[id]`  
[x] Quiz & poll analytics per konten

### §18 Halaman statis & navigasi

[x] Homepage `/` · About, Contact, Advertise, Media Partner, Career, Internship  
[x] Privacy Policy, Terms of Service, Disclaimer  
[x] Navbar redesign + drawer sidebar (`NavbarSidebar.tsx`)  
[x] Footer — link jelajahi, newsletter, social media  
[x] `GET /api/pages/[slug]` — dynamic content

**Checklist path:**

[x] `app/(public)/page.tsx` · `articles/**` · `polls/**` · `quizzes/**` · `leaderboard` · `search` · `trending` · `explore`  
[x] `profile/[username]` · `tv/**` · `contributor/apply` · `reactions/[type]`  
[x] `app/(user)/activity` · `bookmarks` · `my-articles` · `profile/**` · `submit-article` · `edit-article` · `preview-article`  
[x] `app/(admin)/admin/**` — dashboard, artikel, review, kategori, tag, users, contributors, quiz, poll, comments, videos, ads, analytics, info-pages, homepage, points, leaderboard, activity-log

### §19 Upload & media

[x] `POST /api/upload` — R2 + validasi MIME/size + moderasi  
[x] `lib/r2.ts`, `lib/image-moderation.ts`  
[x] `RichTextEditor` — embed gambar · `ArticleFigure` lazy load  
[x] Paste markdown → auto-format (`tiptap-markdown`, `transformPastedText`)

### §20 Non-functional & QA

[x] Rate limiting — Upstash / Redis / in-memory  
[x] Input sanitasi HTML · backfill konten lama  
[x] Error monitoring · log drain · `GET /api/health`  
[x] Lighthouse — Mobile **42** / Desktop **89** ([`lighthouse-scores.md`](./lighthouse-scores.md))  
[x] `bun run verify:non-functional` — 47/47 (performa, keamanan, a11y, reliabilitas)  
[x] Unit tests — `tests/unit/` (~156 kasus)  
[x] Integration API inti — `tests/api/` + `tests/integration/smoke.test.ts`  
[x] `bun run test` — unit + integration (tanpa browser)  
[x] Manual QA browser — checklist [`testing-inventory.md`](./testing-inventory.md)

### Infrastruktur & revisi UI *(lintas domain)*

[x] `lib/db.ts`, `lib/logger.ts`, `lib/monitoring.ts`, `lib/slug.ts`  
[x] Logo & warna brand baru · share flow & leaderboard layout  
[x] Kategori editorial & info sidebar

### Soft launch konten *(operasional editorial)*

> Panduan: [`soft-launch-content.md`](./soft-launch-content.md).

[x] Riset topik, thumbnail, konfigurasi kategori/tag di admin  
[~] Penulisan draft artikel (minimal 30) — tim editorial  
[~] Penyuntingan, quality check, publikasi — tim editorial

### TODO dari kode — Tier A–F *(audit Juni 2026, selesai)*

> Tidak ada sisa `TODO:` di kode per verifikasi Juni 2026.

[x] **Tier A** — perbaikan kecil CSS/teks (`ArticleCard`, breadcrumb admin, poll highlight, reaksi homepage, LMS logo, border tabel admin)  
[x] **Tier B** — card stats admin (info-pages, review, social, homepage, newsletter, ads, videos, quiz, poll, contributors, users, comments, analytics, articles)  
[x] **Tier C** — UX tabel & aksi admin (footer, newsletter, social, users, contributors, homepage, tags)  
[x] **Tier D** — layout publik aside/breadcrumb (poll, quiz, HomeTodaySection)  
[x] **Tier E** — fitur admin menengah (info-pages preview, categories modal, navbar 9 kategori, ads crop)  
[x] **Tier F** — refactor analytics hub + bug video featured/homepage TV

---

## Checklist Testing — Kerjakan

> Centang `[x]` saat otomatis atau manual QA lulus.  
> **Target otomatis:** `bun run test` = unit + integration API inti. **Browser/UI → QA manual.**

### Fase 0 — Infrastruktur

[x] Setup `bun:test` + folder `tests/unit/`  
[x] Script `bun run test` (unit + integration API inti)  
[x] Script `bun run test:unit` · `test:integration`  
[x] Env test (`.env.test`) — DB `jepangku_news_test`, Clerk  
[x] Akun uji Clerk: guest · USER · CONTRIBUTOR · ADMIN  
[x] `test:db:prepare` / `test:db:cleanup` untuk DB test  
[x] Dokumentasi di `tests/README.md`

### Fase 1 — Unit test `lib/` *(~156 kasus)*

[x] Points, workflow artikel, sanitizer, username/slug, contributor gate  
[x] Newsletter, leaderboard period, notifications dispatch, ads schedule  
[x] Jakarta calendar, article SEO/view URL, image moderation helpers

### Fase 2 — API integration inti *(~7 modul)*

[x] `tests/integration/smoke.test.ts` — health, guest  
[x] `tests/api/auth.test.ts` — me, logout, 401/410  
[x] `tests/api/articles.test.ts` — CRUD, workflow  
[x] `tests/api/admin.test.ts` — boundary 403 non-admin  
[x] `tests/api/contributor.test.ts` — apply, status, gate  
[x] `tests/api/points.test.ts` — ledger  
[x] `tests/api/comments.test.ts` — thread dasar

### Fase 3 — QA manual browser *(tidak otomatis)*

[x] Checklist per fitur di [`testing-inventory.md`](./testing-inventory.md) — centang manual  
[ ] UI Clerk login, admin CRUD, homepage waves — uji manual sebelum rilis  
[ ] `bun run verify:core` · `verify:home` · `verify:notifications` — skrip ops opsional

### §1 Autentikasi & akun *(10 fitur · 19 kondisi)*

[x] **1.1** Login Clerk — email/password · OAuth · redirect setelah login  
[x] **1.2** Registrasi — buat akun · verifikasi email · JIT provisioning News DB  
[x] **1.3** Logout — session hilang · redirect guest  
[x] **1.4** `GET /api/auth/me` — data user benar · 401 untuk guest  
[x] **1.5** `/login`, `/register` — redirect ke Clerk  
[x] **1.6** `POST /api/auth/login`, `/register` — mengembalikan 410  
[x] **1.7** Route user — guest diarahkan ke sign-in  
[x] **1.8** Route admin — non-admin ditolak · admin masuk  
[x] **1.9** Core JWT — token terbit · claims XP/role  
[x] **1.10** Core down — portal tetap jalan · pesan degrade

### §2 Profil & data user *(8 fitur · 13 kondisi)*

[x] **2.1** `/profile` — tampil nama, username, avatar, poin  
[x] **2.2** Edit profil — update display name · validasi field  
[x] **2.3** Avatar — crop & simpan · tampil di navbar  
[x] **2.4** Username — sukses ganti · tolak jika < 14 hari  
[x] **2.5** Profil publik — statistik artikel · daftar artikel publik  
[x] **2.6** `GET /api/profile/[username]` — 404 user tidak ada  
[x] **2.7** Gamifikasi — saldo poin · sinkron navbar  
[x] **2.8** `PATCH /api/user/profile` — persist ke DB

### §3 Artikel *(22 fitur · 28 kondisi)*

[x] **3.1** Daftar artikel — pagination/filter kategori · kartu artikel  
[x] **3.2** Detail — konten HTML aman · metadata SEO  
[x] **3.3** Filter kategori — filter benar  
[x] **3.4** Read complete — sekali per artikel · poin masuk ledger  
[x] **3.5** Share — idempotensi share  
[x] **3.6** Bookmark — toggle bookmark  
[x] **3.7** Tag — navigasi ke search/explore  
[x] **3.8** Sidebar iklan — slot tampil jika aktif  
[x] **3.9** Author card — link ke profil penulis  
[x] **3.10** Submit — gate role CONTRIBUTOR/ADMIN  
[x] **3.11** Edit — hanya owner/admin  
[x] **3.12** Draft — autosave · restore  
[x] **3.13** Preview — hanya author/admin  
[x] **3.14** My articles — status DRAFT/PENDING/PUBLISHED  
[x] **3.15** Workflow — DRAFT→PENDING→PUBLISHED/REJECTED  
[x] **3.16** Admin CRUD artikel · rich text editor  
[x] **3.17** Review queue — approve/reject + notifikasi  
[x] **3.18** Bulk approve/reject — tidak duplikat notifikasi  
[x] **3.19** Export — CSV/JSON  
[x] **3.20** Revisi & audit — riwayat perubahan tampil  
[x] **3.21** Featured/hot — muncul di homepage feed  
[x] **3.22** Hapus — soft/hard sesuai aturan

### §4 Kuis *(7 fitur · 11 kondisi)*

[x] **4.1** Daftar kuis — kartu kuis · filter  
[x] **4.2** Detail — soal tampil · timer (jika ada)  
[x] **4.3** Attempt — one-attempt guard · skor benar  
[x] **4.4** Poin setelah kuis — sesuai skor/rules  
[x] **4.5** Leaderboard per kuis — monthly & all-time  
[x] **4.6** Admin CRUD — multi-question builder · upload gambar  
[x] **4.7** Analytics — attempt, pass rate

### §5 Poll *(5 fitur · 7 kondisi)*

[x] **5.1** Daftar poll — kartu poll aktif  
[x] **5.2** Detail — multi-question  
[x] **5.3** Vote — duplicate guard · poin  
[x] **5.4** Admin CRUD — builder · gambar opsi  
[x] **5.5** Analytics — breakdown vote

### §6 Video — Jepangku TV *(5 fitur · 6 kondisi)*

[x] **6.1** `/tv` — grid video + badge platform  
[x] **6.2** Detail — lazy embed (YouTube/Facebook/TikTok) atau link-out (Instagram/Other)  
[x] **6.3** API video — `platform`, `videoUrl`, `embedUrl` + backward-compat `youtubeId`  
[x] **6.4** Homepage TV — load on scroll  
[x] **6.5** Admin CRUD video — URL multi-platform, deteksi real-time  
[x] **6.6** Migrasi DB — `video_url` + `platform`, backfill dari `youtube_id`

### §7 Engagement & interaksi *(10 fitur · 11 kondisi)*

[x] **7.1** Komentar — thread 1 level · +2 poin  
[x] **7.2** Balas komentar — notif ke pemilik parent  
[x] **7.3** Edit/hapus — owner only  
[x] **7.4** Moderasi admin — hide/show  
[x] **7.5** Reaksi 9 emoji — artikel/poll/quiz  
[x] **7.6** Browse reaksi — filter per tipe  
[x] **7.7** Homepage reaksi — section lazy  
[x] **7.8** Bookmark list — daftar artikel tersimpan  
[x] **7.9** Subscribe kategori — notif artikel baru  
[x] **7.10** Share flow — native share / copy link

### §8 Gamifikasi — poin & leaderboard *(11 fitur · 12 kondisi)*

[x] **8.1** `GET /api/points/my` — 100 transaksi terakhir  
[x] **8.2** Export CSV — download milik sendiri  
[x] **8.3** Daily login — sekali per hari Jakarta  
[x] **8.4** Leaderboard mingguan — tab switch  
[x] **8.5** Leaderboard bulanan — ranking benar  
[x] **8.6** Leaderboard all-time — ranking benar  
[x] **8.7** Homepage preview — top users  
[x] **8.8** Activity feed — campuran aktivitas  
[x] **8.9** Redirect `/points` → `/activity`  
[x] **8.10** Admin poin — filter periode · detail modal  
[x] **8.11** Admin leaderboard — snapshot ranking

### §9 Notifikasi & email *(15 fitur · 16 kondisi)*

[x] **9.1** Bell — guest: bell hidden  
[x] **9.2** List — pagination cursor  
[x] **9.3** Unread count — badge update  
[x] **9.4** Mark read — badge berkurang  
[x] **9.5** Mark all read — semua read  
[x] **9.6** SSE — badge update live  
[x] **9.7** SSE fallback — poll saat disconnect  
[x] **9.8** Welcome modal — user baru saja  
[x] **9.9** Daily points modal — sekali/hari Jakarta  
[x] **9.10** Notif artikel — publish/reject ke penulis  
[x] **9.11** Notif review — pending ke admin  
[x] **9.12** Notif kontributor — approved/rejected  
[x] **9.13** Notif komentar — cap anti-spam  
[x] **9.14** Email outbox — welcome · reject · kontributor  
[x] **9.15** Retention — `purge:notifications`

### §10 Newsletter *(6 fitur · 8 kondisi)*

[x] **10.1** Footer subscribe — validasi email · toast sukses  
[x] **10.2** Subscribe API — duplikat handled  
[x] **10.3** Unsubscribe — wajib akun sama  
[x] **10.4** Status subscription — aktif/nonaktif  
[x] **10.5** Admin newsletter — list · delete  
[x] **10.6** Export subscriber — CSV admin only

### §11 Kontributor *(5 fitur · 6 kondisi)*

[x] **11.1** Apply — form submit  
[x] **11.2** Status — pending/approved/rejected  
[x] **11.3** Admin review — approve/reject + notif  
[x] **11.4** Gate submit — USER ditolak · CONTRIBUTOR lolos  
[x] **11.5** CTA navbar — label sesuai role

### §12 Homepage & discovery *(14 fitur · 17 kondisi)*

[x] **12.1** Shell — semua section `data-testid`  
[x] **12.2** Wave 1 — featured · trending · hari ini  
[x] **12.3** Wave 2 — lazy on scroll  
[x] **12.4** Wave 3 — isolated error per section  
[x] **12.5** Wave 4 — lazy on scroll  
[x] **12.6** Hero search — submit → `/search?q=`  
[x] **12.7** Navbar search — mobile + desktop  
[x] **12.8** Global search — artikel + kuis + poll  
[x] **12.9** Trending — sort `weeklyViewCount`  
[x] **12.10** Explore — tag populer + kategori  
[x] **12.11** Tag populer API — data konsisten  
[x] **12.12** Admin homepage — featured/hot picks  
[x] **12.13** Empty states — tidak crash saat kosong  
[x] **12.14** Skeleton — min-height stabil

### §13 Integrasi LMS teaser *(6 fitur · 7 kondisi)*

[x] **13.1** LMS teaser API — `source: placeholder` saat LMS down  
[x] **13.2** Placeholder UI — coming soon + CTA  
[x] **13.3** Live courses — kartu kursus saat API live  
[x] **13.4** Domain — dev vs kursus.jepangku.com  
[x] **13.5** UTM links — utm_source/medium/campaign  
[x] **13.6** Hero — external link LMS

### §14 Iklan & monetisasi *(4 fitur · 5 kondisi)*

[x] **14.1** Homepage ad slot — banner atau null  
[x] **14.2** Artikel sidebar — slot `article-sidebar`  
[x] **14.3** Admin CRUD — aktif/nonaktif · jadwal  
[x] **14.4** Client cache — tidak over-fetch

### §15 Admin — dashboard & monitoring *(6 fitur · 9 kondisi)*

[x] **15.1** Dashboard — stats · quick actions  
[x] **15.2** Stats API — angka konsisten  
[x] **15.3** Activity log — audit artikel & kontributor  
[x] **15.4** Grafik registrasi — growth chart  
[x] **15.5** Manajemen user — list · detail · role  
[x] **15.6** User growth API — data chart

### §16 Admin — konten & taxonomi *(5 fitur · 5 kondisi)*

[x] **16.1** Kategori CRUD — create/edit/delete  
[x] **16.2** Tag CRUD — slug unik  
[x] **16.3** Info pages CMS — edit konten statis  
[x] **16.4** Social links CMS — tampil di footer  
[x] **16.5** Footer social — link benar

### §17 Admin — analytics *(5 fitur · 5 kondisi)*

[x] **17.1** Ringkasan — KPI utama  
[x] **17.2** Content ranking — sort performa  
[x] **17.3** Per kategori — breakdown  
[x] **17.4** Per artikel — grafik views harian  
[x] **17.5** Artikel stats API — aggregate

### §18 Halaman statis & navigasi *(12 fitur · 14 kondisi)*

[x] **18.1** `/about` — konten dari CMS/info  
[x] **18.2** `/contact` — form/link  
[x] **18.3** `/advertise` · **18.4** `/media-partner` · **18.5** `/career` · **18.6** `/internship`  
[x] **18.7** `/privacy-policy` · **18.8** `/terms-of-service` · **18.9** `/disclaimer`  
[x] **18.10** Navbar & sidebar — mobile drawer · kategori  
[x] **18.11** Footer — link jelajahi · newsletter  
[x] **18.12** `GET /api/pages/[slug]` — dynamic content

### §19 Upload & media *(4 fitur · 4 kondisi)*

[x] **19.1** Upload — validasi MIME/size  
[x] **19.2** R2 — URL publik accessible  
[x] **19.3** Image moderation — tolak konten tidak aman  
[x] **19.4** Rich text editor — embed gambar · paste markdown auto-format

### §20 Non-functional *(29 kondisi)*

[x] **P1** Lighthouse production — Mobile **42** / Desktop **89**  
[x] **P2** LCP featured — `fetchPriority=high`  
[x] **P3** Homepage wave lazy — Wave 1 only on load  
[x] **P4** Image formats — AVIF/WebP + `sizes`  
[x] **P5** YouTube lazy embed — click-to-play  
[x] **P6** API cache headers — `s-maxage` home APIs  
[x] **S1** Rate limiting — flood API publik  
[x] **S2** HTML sanitasi — XSS komentar/artikel  
[x] **S3** Auth boundary — API admin 403 untuk user  
[x] **S4** Upload validation — file type spoofing  
[x] **S5** Internal email route — `EMAIL_QUEUE_SECRET`  
[x] **S6** CSRF/session — Clerk + cookie httpOnly  
[x] **A1** Kontras warna — WCAG AA  
[x] **A2** Keyboard nav — navbar, modal, form  
[x] **A3** Touch targets — carousel, mobile nav  
[x] **A4** `inert` search overlay — hero mobile  
[x] **A5** Screen reader — bell, modal notifikasi  
[x] **R1** Health check — `GET /api/health`  
[x] **R2** Core service down — graceful degrade  
[x] **R3** DB connection fail — graceful error  
[x] **R4** Section error isolation — satu home API gagal  
[x] **R5** Error monitoring webhook  
[x] **R6** Log drain  
[x] **R7** Redis fallback — tanpa Upstash lokal  
[x] **C1** Mobile 375px — no horizontal scroll  
[x] **C2** Tablet 768px  
[x] **C3** Desktop 1280px+  
[ ] **C4** Browser manual smoke — checklist [`testing-inventory.md`](./testing-inventory.md)  
[ ] **C5** Safari/Firefox smoke

---

## Rencana Lanjutan — Bisa Nanti *(ekosistem Fase D/E)*

> Koordinasi lintas-repo: `jepangkuLMS`, `jepangku-core`. News consumer (teaser LMS) sudah ada; item di bawah = integrasi penuh ekosistem.

[ ] LMS integration penuh — shared user Clerk/Core di `kursus.jepangku.com`  
[ ] `GET /api/public/courses` di jepangkuLMS + katalog `/kursus` baca Prisma (single source of truth)  
[ ] Super-admin / role hierarchy (`editor`, `moderator`, `instructor`, `student`)  
[ ] Profil extended (bio) di Core *(sementara `user_profiles` News)*  
[ ] Spend poin, membership — fase lanjutan apabila ada

---

## Referensi

- [`docs/README.md`](./README.md) — indeks dokumentasi  
- [`docs/testing-inventory.md`](./testing-inventory.md) — inventaris fitur & QA manual  
- [`docs/backlog-plan.md`](./backlog-plan.md) — arsip rencana teknis (selesai)  
- [`docs/ecosystem-integration.md`](./ecosystem-integration.md) — kontrak Core cutover  
- [`docs/soft-launch-content.md`](./soft-launch-content.md) — guideline konten soft launch  
- [`tests/README.md`](../tests/README.md) — unit + integration otomatis  
- `jepangku-core/docs/API.md` · `jepangku-core/docs/ECOSYSTEM.md`
