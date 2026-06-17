# Status Fitur & Checklist — Jepangku News

> **Diperbarui:** Juni 2026 (audit kode `jepangku-news`)  
> **Legenda:** `[ ]` belum · `[~]` sebagian / ops / QA manual · `[x]` selesai (verified)  
> **Rincian teknis:** [`backlog-plan.md`](./backlog-plan.md) · [`ecosystem-integration.md`](./ecosystem-integration.md) · [`development-roadmap.md`](./development-roadmap.md)

---

## Belum Selesai — Urut Prioritas

### 1. Homepage QA sebelum launch

[x] Mobile: `overflow-x-clip` homepage + body; section tidak overflow horizontal  
[x] Lighthouse dev (ngrok + `bun dev`): Mobile **34** / Desktop **53** — TTFB ngrok, bundle dev, ekstensi Chrome; **ulangi di production build** (`bun run build && bun start`) incognito  
[x] Lighthouse perbaikan kode: `fetchPriority=high` LCP featured, `sizes` gambar, AVIF/WebP, preconnect Clerk, touch target carousel, kontras a11y, `inert` search overlay, `robots.ts`, manifest  
[x] E2E otomatis homepage (Playwright) — `e2e/homepage.spec.ts`, `bun run test:e2e`
[x] Empty state tiap section — feed, hari ini, TV, reaksi, poll/kuis/leaderboard, iklan partner (placeholder)  
[x] Network: Wave 1 saat load; Wave 2–4 hanya setelah scroll (`useLazySection`)  
[x] Section error isolated — satu API gagal tidak kosongkan halaman  
[x] Lazy-load YouTube embed (`LazyYoutubeEmbed` di `/tv/[slug]`)  
[x] Skeleton height fixed (`LazySectionSkeleton` + `minHeight`)  
[x] `data-testid` section & wave (`LazySectionShell`, `data-home-wave`)

### 2. Core deploy prod + Clerk webhook *(Fase B–C, koordinasi tim Core)*

[x] Deploy Core prod — `GET https://core.jepangku.com/health` OK (`status: ok`, redis connected)  
[x] News env prod — `CORE_API_URL=https://core.jepangku.com`, `CORE_JWT_PUBLIC_KEY` + `CORE_JWT_ISSUER`  

### 3. Verifikasi Fase 4 — `bun run verify:core`

[x] Registrasi baru — Clerk JIT News + `establishCoreSession` → Core JWT; webhook Core wajib untuk user baru di Core DB *(manual staging: sign-up flow)*  
[x] Aktivitas poin — baca/share/bookmark/quiz/poll/komentar → `awardPoints()` + unique `point_transactions` (anti-double P2002)  
[x] Daily login — `checkDailyLogin()` idempotent per hari (`sourceId` = `YYYY-MM-DD`)  
[x] Admin — `PORTAL_ADMIN` / `CORE_ADMIN` / role lokal `ADMIN` → `/admin/*` + `/api/admin/*`; non-admin 403 *(UI: `AdminShell` + API: `getCurrentAdmin`)*  
[x] Leaderboard — agregasi `point_transactions` News DB (`weekly`, `monthly`, `sepanjang-waktu`)  
[x] Core down — graceful degrade (`establishCoreSession`/`fetchCoreUserMe` → null); runbook [`docs/runbooks/core-service-down.md`](./runbooks/core-service-down.md)  
[~] Staging end-to-end sebelum production cutover — `bun run verify:staging` + checklist manual § runbook *(jalankan di URL staging)*  
[x] Sync dokumen integrasi — `ecosystem-integration.md` §5 diperbarui Juni 2026

### 4. Kebijakan akun legacy

[ ] User tanpa Clerk ID (JWT lama): force re-login Clerk atau hapus

### 5. Keamanan & kualitas pre-production

[x] Rate limiting — Upstash / Redis / in-memory fallback (`lib/rate-limit.ts`)  
[x] Input sanitasi HTML (`lib/sanitizer.ts`)  
[x] Image moderation validasi file (`lib/image-moderation.ts` + `POST /api/upload`)  
[x] Image moderation AI — kode HTTP generik siap  
[x] Redis/Upstash — kode siap (`lib/rate-limit-store.ts`)  
[x] Redis/Upstash — set `UPSTASH_REDIS_REST_*` atau `REDIS_URL` di production  
[x] Backfill sanitasi konten lama — `bun run backfill:sanitize` (dry-run) / `backfill:sanitize:apply`  
[x] Error monitoring — `captureException` → `MONITORING_WEBHOOK_URL` + `LOG_DRAIN_URL`
[x] Log drain — JSON structured logger + `LOG_DRAIN_URL` (warn/error); Vercel stdout → Log Drain

### 6. Kontributor & gate upload *(Fase A″)*

[x] Halaman placeholder `/contributor/apply`  
[x] CTA kontributor di navbar/sidebar (`lib/contributor.ts`)  
[x] Role `CONTRIBUTOR` + migrasi Prisma  
[x] API apply + status kontributor  
[x] Gate `POST /api/articles/create` & halaman submit/edit/my/preview  
[x] Admin antrian approve/reject (`/admin/contributors`) — sementara promote via `/admin/users`  
[x] Form `/contributor/apply` fungsional (ganti placeholder)  
[x] `lib/contributor.ts` — `canCreateArticles()` baca role DB (`ADMIN` | `CONTRIBUTOR`)  
[x] Sinkron entry point (navbar dropdown, sidebar, profile; my-articles disembunyikan untuk USER)

### 7. Halaman belum ada / admin monitoring *(Fase C′ / E)*

[ ] `app/(user)/activity/page.tsx` — riwayat aktivitas user  
[ ] `app/(admin)/admin/leaderboard/page.tsx` — monitor leaderboard *(nav: comingSoon)*  
[ ] `app/(admin)/admin/points/page.tsx` — monitor transaksi poin *(nav: comingSoon)*  
[ ] `app/(admin)/admin/activity-log/page.tsx` — audit log admin *(nav: comingSoon)*  
[ ] Activity audit log — siapa approve/reject apa, kapan  
[ ] Point transaction summary di admin — total per periode, breakdown tipe  
[ ] User growth tracking — grafik registrasi per hari/minggu

### 8. Notifikasi portal *(Fase C′ + E2)*

[x] Navbar bell UI placeholder (`NavbarNotifications.tsx`)  
[x] Sembunyikan bell untuk guest (`Navbar.tsx`)  
[ ] Model `Notification` + API read/mark-read
[ ] Modal daily poin (first session/hari)
[ ] Welcome user baru
[ ] Notif kontributor approved *(butuh Fase A″)*
[ ] Navbar bell fungsional — artikel approve/reject, komentar

### 9. Newsletter *(Fase E1)*

[ ] Model `NewsletterSubscription`  
[ ] Footer form + `POST /api/newsletter/subscribe`  
[ ] Admin CRUD `/admin/newsletter`  
[ ] Halaman unsubscribe (wajib login akun yang sama)  
[ ] Email template + SMTP

### 10. Integrasi LMS live *(Fase D, koordinasi jepangkuLMS)*

[x] LMS teaser statis — `HomeLmsTeaser.tsx` + `GET /api/home/lms-teaser`
[ ] `GET /api/public/courses` di jepangkuLMS  
[ ] News proxy `/api/home/lms-teaser` baca live dari LMS  
[ ] Katalog publik `/kursus` di LMS baca Prisma (single source of truth)

### 11. Engagement lanjutan *(Fase E)*

[ ] Follow / subscribe kategori + notifikasi artikel baru  
[ ] Export riwayat poin CSV milik user  
[ ] Monthly / all-time quiz leaderboard per quiz  
[ ] Riwayat aktivitas lengkap di `/activity`

### 12. Soft launch konten *(Prio 16 — ditunda)*

[ ] Riset topik dan sumber per kategori  
[ ] Penulisan draft artikel (minimal 30 artikel)  
[ ] Penyuntingan dan quality check  
[ ] Thumbnail/cover image  
[ ] Konfigurasi kategori dan tag di admin  
[ ] Publikasi artikel  
[ ] Testing: homepage, search, filter, leaderboard, quiz, poll

### 13. Ekosistem lanjutan *(Fase D/E)*

[ ] LMS integration penuh — shared user Clerk/Core di `kursus.jepangku.com`  
[ ] Super-admin / role hierarchy (`editor`, `moderator`, `instructor`, `student`)  
[ ] Membership & payment global  
[ ] Admin pusat lintas aplikasi  
[ ] Multi-app deployment (subdomain production)  
[ ] CI/CD pipeline otomatis  
[ ] Mobile app / PWA  
[ ] Username global di Core *(sementara News DB)*  
[ ] Profil extended (bio) di Core *(sementara `user_profiles` News)*  
[ ] Spend poin, membership, notifikasi global — fase lanjutan

---

## Sudah Diimplementasi — Verified

### Homepage ekosistem — jepangku.com

[x] `lib/home/queries/*` — feed, categories-editorial, tv, ads, lms-teaser, reactions, engagement  
[x] `GET /api/home/feed` — Wave 1: featured, trending, todayArticles (Asia/Jakarta)  
[x] `GET /api/home/categories-editorial` — Wave 2 lazy  
[x] `GET /api/home/tv`, `/ads`, `/lms-teaser`, `/reactions` — Wave 3 lazy  
[x] `GET /api/home/engagement` — Wave 4 lazy (poll, quiz, leaderboard)  
[x] Monolit `/api/homepage` dihapus (`bun run verify:home`)  
[x] `hooks/useLazySection.ts`, `LazySectionShell`, `LazySectionSkeleton`  
[x] §1 Featured + Trending — carousel, grid proporsional  
[x] §2 Hero ekosistem — `HomeHero.tsx`, quick links, search, CTA auth/guest  
[x] §3 Hari Ini — label `今日 / HARI INI`, fallback `< 3` artikel  
[x] §4 Kategori editorial — `CategoryEditorialSection.tsx`, `lib/home/editorial-groups.ts`  
[x] §5 Jepangku TV — model `Video`, admin `/admin/videos`, `/tv`, `/tv/[slug]`  
[x] §6 Advertisement — model `AdSlot`, admin `/admin/ads`, `AdBannerSlot.tsx`  
[x] §7 LMS teaser — static cards Fase 1  
[x] §8 Reaksi komunitas — `HomeReactionsSection.tsx`  
[x] §9–10 Poll, Kuis, Leaderboard — `HomeEngagementSection.tsx`

### Revisi UI/UX *(Tier 1–4, Juni 2026)*

[x] Logo & warna brand baru  
[x] Navbar redesign + drawer sidebar (`NavbarSidebar.tsx`)  
[x] Share flow & leaderboard layout  
[x] Kategori editorial & info sidebar  
[x] Sidebar iklan artikel (`ArticleSidebarAd.tsx`)

### Poin & leaderboard — News DB *(Fase C′)*

[x] Schema `point_transactions` di News DB  
[x] `lib/points.ts` — tulis ledger lokal (`awardPoints`, `getUserPointBalance`)  
[x] `checkDailyLogin()` — daily login via `point_transactions`  
[x] `GET /api/points/my` — saldo + 100 transaksi terakhir dari News DB  
[x] `GET /api/leaderboard` + `/weekly` — agregasi dari `point_transactions`  
[x] `lib/leaderboard/queries.ts` — weekly, monthly, all-time (Asia/Jakarta)  
[x] `lib/home/queries/engagement.ts` — leaderboard preview dari News DB  
[x] Halaman `/leaderboard` — tab mingguan / bulanan / all-time  
[x] Navbar & profil — saldo dari `/api/user/gamification` (News DB)  
[x] `scripts/verify-core-integration.ts` — verifikasi leaderboard portal  
[x] `awardXp()` Core — tidak dipakai aktivitas portal (hanya `lib/core/gamification.ts`)

### Penyatuan auth & Core — Fase 2 & 3

[x] Env News — `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_JWT_*`  
[x] `lib/core/` — client, auth, gamification, types, activity-map, config  
[x] Migrasi DB — FK Clerk ID; `users.id` = Clerk ID  
[x] Core JWT — cookie `core_session` via `lib/core/session.ts`  
[x] `getCurrentUser()` / `getCurrentAdmin()` / `hasNewsAdminAccess()`  
[x] Skrip sync — `bun run db:sync-clerk` (Clerk → Core + `PORTAL_ADMIN`)  
[x] Seed activity types News di Core  
[x] Smoke test lokal Core + shadow *(historis, pre-cutover)*

### Auth & akun — Clerk bridge

[x] `@clerk/nextjs` + `/sign-in`, `/sign-up`  
[x] JIT user provisioning (`lib/auth/clerk-user.ts`)  
[x] `SessionUser` abstraction + feature flag `AUTH_PROVIDER`  
[x] `proxy.ts` — proteksi route user/admin + logging API  
[x] `/login`, `/register` redirect ke Clerk; API lokal disabled (410)  
[x] Email verification, forgot password, OAuth — via Clerk  
[x] Username change cooldown 14 hari  
[x] `GET /api/auth/me`, logout Clerk/local

### Artikel — publik, user & admin

[x] CRUD API artikel — list, detail, create, update, delete, my-articles  
[x] Read complete (+2 poin), share (+5), bookmark (+1)  
[x] Revisions & review history — penulis + admin  
[x] Admin — create, edit published, archive, bulk, export CSV/JSON  
[x] Draft autosave & preview sebelum submit  
[x] Halaman — `/articles`, `/articles/[slug]`, submit, edit, my-articles  
[x] Scroll detection read complete + banner poin

### Quiz & polling

[x] API quiz — list, detail, attempt (one-attempt, scoring, poin)  
[x] API poll — list, detail, vote (multi-question, duplicate guard, poin)  
[x] Halaman publik `/quizzes`, `/quizzes/[slug]`, `/polls`, `/polls/[slug]`  
[x] Admin CRUD quiz & poll (multi-question builder, image upload)

### Bookmark, komentar & reaksi

[x] Bookmark — API + halaman `/bookmarks`  
[x] Komentar polimorfik — thread 1 level, moderasi admin, +2 poin  
[x] Reaksi 9 emoji (artikel/poll/quiz) + jempol komentar  
[x] Admin moderasi komentar — `/admin/comments`  
[x] Halaman browse reaksi — `/reactions/[type]`

### Search & discovery

[x] `/search?q=` + `GET /api/search` (artikel + quiz + poll)  
[x] `/trending` — sort `weeklyViewCount`  
[x] `/explore` — tag populer + kategori  
[x] `GET /api/tags/popular` + tag klikabel di artikel  
[x] Navbar & hero search → `/search`

### Profile & author discovery

[x] Profil user — `/profile`, `/profile/edit`, avatar upload  
[x] Profil publik penulis — `/profile/[username]`  
[x] `AuthorProfileCard`, `AuthorLink`, statistik penulis publik

### Analytics konten — admin

[x] `/admin/analytics` — ringkasan  
[x] `/admin/analytics/content` — ranking performa artikel  
[x] `/admin/analytics/categories` — statistik per kategori  
[x] `/admin/analytics/articles/[id]` — grafik views harian  
[x] `/admin/analytics/quizzes/[id]` — attempt, skor, pass rate  
[x] `/admin/analytics/polls/[id]` — breakdown vote

### Upload & infrastruktur

[x] `POST /api/upload` — R2 + validasi + moderasi  
[x] `lib/r2.ts`, `lib/db.ts`, `lib/logger.ts`, `lib/monitoring.ts`  
[x] `GET /api/health` — cek DB  
[x] `lib/slug.ts`, `lib/article-tags.ts`, `lib/admin-articles-query.ts`  
[x] `RichTextEditor`, confirm modal, review history modal

### Admin — halaman & API

[x] Dashboard `/admin` — stats, quick actions, pending preview  
[x] Artikel — list, create, edit, review queue, bulk, export  
[x] Kategori, tag, homepage featured/hot, info pages  
[x] Users — list, detail, role/status, transaksi poin di detail  
[x] Videos CRUD, Ads CRUD  
[x] Quizzes & polls CRUD + analytics link

### Halaman publik & statis

[x] Homepage `/`  
[x] About, Contact, Advertise, Media Partner, Career, Internship  
[x] Privacy Policy, Terms of Service, Disclaimer  
[x] `/points` — riwayat transaksi poin user  
[x] `/contributor/apply` — placeholder info (bukan form apply)

### Halaman — checklist path

[x] `app/(public)/page.tsx`  
[x] `app/(public)/articles/page.tsx` · `articles/[slug]/page.tsx`  
[x] `app/(public)/polls/page.tsx` · `polls/[slug]/page.tsx`  
[x] `app/(public)/quizzes/page.tsx` · `quizzes/[slug]/page.tsx`  
[x] `app/(public)/leaderboard/page.tsx`  
[x] `app/(public)/search/page.tsx` · `trending/page.tsx` · `explore/page.tsx`  
[x] `app/(public)/profile/[username]/page.tsx`  
[x] `app/(public)/tv/page.tsx` · `tv/[slug]/page.tsx`  
[x] `app/(user)/bookmarks/page.tsx` · `my-articles/page.tsx` · `points/page.tsx`  
[x] `app/(user)/profile/page.tsx` · `profile/edit/page.tsx`  
[x] `app/(user)/submit-article/page.tsx` · `edit-article/[id]/page.tsx`  
[x] `app/(user)/preview-article/[id]/page.tsx`  
[x] `app/(admin)/admin/**` — dashboard, artikel, kategori, tag, users, quiz, poll, comments, videos, ads, analytics, info-pages, homepage

---

## Referensi

- [`docs/README.md`](./README.md) — indeks dokumentasi  
- [`docs/backlog-plan.md`](./backlog-plan.md) — rencana kontributor, newsletter, notifikasi  
- [`docs/ecosystem-integration.md`](./ecosystem-integration.md) — kontrak Core cutover  
- [`docs/soft-launch-content.md`](./soft-launch-content.md) — guideline konten soft launch  
- `jepangku-core/docs/API.md` · `jepangku-core/docs/ECOSYSTEM.md`
