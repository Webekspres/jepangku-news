# Status Fitur & Checklist — Jepangku News

> **Diperbarui:** Juni 2026 (audit kode `jepangku-news`)  
> **Legenda:** `[ ]` belum · `[~]` sebagian / ops / QA manual · `[x]` selesai (verified)  
> **Rincian teknis:** [`backlog-plan.md`](./backlog-plan.md) · [`ecosystem-integration.md`](./ecosystem-integration.md) · [`development-roadmap.md`](./development-roadmap.md)

---

## Belum Selesai — Urut Prioritas

### 1. Verifikasi staging E2E *(Fase B–C, ops)*

[x] Staging end-to-end sebelum production cutover — `bun run verify:staging` + checklist manual [`docs/runbooks/core-service-down.md`](./runbooks/core-service-down.md) *(jalankan di URL staging)*  
[x] Lighthouse production build — `bun run build && bun start` incognito (baseline post-ngrok dev: Mobile 34 / Desktop 53)

---

### 2. Soft launch konten *(ditunda)*

[ ] Riset topik dan sumber per kategori  
[ ] Penulisan draft artikel (minimal 30 artikel)  
[ ] Penyuntingan dan quality check  
[ ] Thumbnail/cover image  
[ ] Konfigurasi kategori dan tag di admin  
[ ] Publikasi artikel  
[ ] Testing: homepage, search, filter, leaderboard, quiz, poll

---

### 3. Ekosistem lanjutan *(Fase D/E)*

[ ] LMS integration penuh — shared user Clerk/Core di `kursus.jepangku.com`  
[ ] `GET /api/public/courses` di jepangkuLMS + katalog `/kursus` baca Prisma (single source of truth)  
[ ] Super-admin / role hierarchy (`editor`, `moderator`, `instructor`, `student`)  
[ ] Profil extended (bio) di Core *(sementara `user_profiles` News)*  
[ ] Spend poin, membership — fase lanjutan apabila ada

---

## Sudah Diimplementasi — Verified

### Newsletter *(Fase E1)*

[x] Model `NewsletterSubscription`  
[x] Footer form + `POST /api/newsletter/subscribe`  
[x] Admin CRUD `/admin/newsletter`  
[x] Halaman unsubscribe (wajib login akun yang sama)  
[x] Email template + Resend outbox *(shared dengan outbox § Notifikasi)*

### Engagement lanjutan *(Fase E)*

[x] Follow / subscribe kategori + notifikasi artikel baru  
[x] Export riwayat poin CSV milik user  
[x] Monthly / all-time quiz leaderboard per quiz  
[x] Riwayat aktivitas lengkap di `/activity` (di luar ledger poin)

### Integrasi LMS — News consumer *(Fase D, koordinasi jepangkuLMS)*

[x] Domain LMS — staging `dev.kursus.jepangku.com`, prod `kursus.jepangku.com` (`lib/lms/constants.ts`)  
[x] News proxy `/api/home/lms-teaser` — fetch live `GET /api/public/courses`, fallback placeholder (`HomeLmsTeaser.tsx`)  
[x] `lib/lms/client.ts` + tipe kontrak `lib/lms/types.ts`

### Notifikasi portal *(Fase E2 — News DB only, tanpa Core)*

**Prinsip:** inbox persisten di News Prisma; event dispatcher terpusat; modal sesi terpisah dari bell; realtime via Redis/Upstash + SSE; email async untuk event penting.

#### Infrastruktur data & service

[x] Model `Notification` + migrasi Prisma (`userId`, `type`, `title`, `body`, `link`, `metadata`, `readAt`, `createdAt`, `dedupeKey`, `groupKey`, `priority`, `expiresAt`)  
[x] Relasi `User.notifications` + index `(userId, readAt, createdAt DESC)` + unique `(userId, dedupeKey)`  
[x] `lib/notifications/` — `create.ts`, `dispatch.ts`, `types.ts`, `handlers/` (article, contributor, comment, admin)  
[x] `UserProfile` — `welcomedAt`, `lastDailyPointsModalAt`  
[x] Logger — `notification.dispatched` / `notification.deduped` / `notification.failed`  
[x] Retention — `expiresAt` default 90 hari; `bun run purge:notifications` / `purge:notifications:apply`  
[x] `lib/jakarta-calendar.ts` — tanggal & bounds Asia/Jakarta  
[x] `lib/notifications/queries.ts` — list, unread count, mark read, session bootstrap

#### REST API

[x] `GET /api/notifications` — list + cursor pagination + filter `unreadOnly`  
[x] `GET /api/notifications/unread-count` — ringan untuk badge  
[x] `PATCH /api/notifications/[id]/read`  
[x] `POST /api/notifications/read-all`  
[x] `GET /api/notifications/session` — bootstrap modal: `showDailyPoints`, `dailyPoints`, `showWelcome` (timezone Asia/Jakarta)  
[x] `PATCH /api/notifications/session` — dismiss welcome / daily modal

#### Event hooks (write path)

[x] Artikel — hook di `recordStatusReview()` (`lib/article-audit.ts`): `PUBLISHED` / `REJECTED` → notif penulis; `PENDING_REVIEW` → broadcast admin  
[x] `dedupeKey` — cegah duplikat bulk approve/reject (`article:{id}:{status}`)  
[x] Kontributor — hook di `reviewContributorApplication()`: approved / rejected → notif applicant  
[x] Komentar — hook di `POST /api/comments`: notif penulis artikel & pemilik komentar induk; skip self; agregasi `groupKey` + cap `COMMENT_GROUP_MAX_COUNT`  
[x] `link` — pakai `getArticleViewHref()` (`lib/article-view-url.ts`)  
[x] Submit review tanpa `recordStatusReview` — `POST /api/articles/create` & `PATCH /api/articles/drafts/[id]` saat → `PENDING_REVIEW`  
[x] User baru — `notifyWelcomeUser()` + email welcome di `lib/auth/clerk-user.ts`

#### Realtime (badge)

[x] Redis pub/sub — publish `notif:{userId}` saat dispatch (Upstash production)  
[x] `GET /api/notifications/stream` — SSE subscribe per user  
[x] Client fallback — poll `unread-count` saat SSE putus / tab background

#### UI — bell inbox

[x] `NotificationBellMenu.tsx` — list unread, badge count, mark read, navigasi `link`  
[x] `NavbarNotifications.tsx` + `AdminTopbar.tsx` — bell fungsional (user + admin)  
[x] Sembunyikan bell untuk guest (`Navbar.tsx`)  
[x] `hooks/useNotifications.ts` + `client-invalidate` (fetch + SSE + invalidate)

#### UI — modal sesi (bukan bell)

[x] `DailyPointsModal.tsx` — sekali per hari per sesi; trigger dari `/api/notifications/session` + `point_transactions`  
[x] `WelcomeModal.tsx` — user baru; set `welcomedAt` saat dismiss  
[x] Mount modal di `Providers.tsx` setelah auth loaded (`NotificationSessionModals`)  
[x] Selaraskan daily login — `checkDailyLogin` `sourceId` tanggal **Asia/Jakarta** (`getJakartaDateKey`)

#### Email async

[x] Outbox `EmailOutbox` + `lib/email/` (queue, templates, SMTP transport)  
[x] `POST /api/internal/email/process` — QStash atau fire-and-forget lokal (`EMAIL_QUEUE_SECRET`)  
[x] Template — artikel ditolak, kontributor approved/rejected, welcome user  
[x] Hooks — `lib/notifications/email-hooks.ts` terhubung ke artikel reject, kontributor review, registrasi

#### QA

[x] `bun run verify:notifications` — Jakarta session, dedupe, group cap, email hooks  
[x] E2E Playwright — `e2e/notifications.spec.ts` (API 401, guest bell hidden)  
[x] Daily modal sekali per hari (Jakarta); welcome hanya user baru  
[x] Bulk approve tidak duplikat notif  
[x] Komentar spam tidak membanjiri inbox (agregasi + rate limit)

---

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
[x] §7 LMS teaser — live proxy + placeholder fallback (`HomeLmsTeaser.tsx`, `lib/lms/`)  
[x] §8 Reaksi komunitas — `HomeReactionsSection.tsx`  
[x] §9–10 Poll, Kuis, Leaderboard — `HomeEngagementSection.tsx`

### Homepage QA & performa

[x] Mobile: `overflow-x-clip` homepage + body; section tidak overflow horizontal  
[x] Lighthouse perbaikan kode: `fetchPriority=high` LCP featured, `sizes` gambar, AVIF/WebP, preconnect Clerk, touch target carousel, kontras a11y, `inert` search overlay, `robots.ts`, manifest  
[x] E2E otomatis homepage — `e2e/homepage.spec.ts`, `bun run test:e2e`  
[x] Empty state tiap section — feed, hari ini, TV, reaksi, poll/kuis/leaderboard, iklan partner  
[x] Network: Wave 1 saat load; Wave 2–4 lazy scroll (`useLazySection`)  
[x] Section error isolated — satu API gagal tidak kosongkan halaman  
[x] Lazy-load YouTube embed (`LazyYoutubeEmbed` di `/tv/[slug]`)  
[x] Skeleton height fixed (`LazySectionSkeleton` + `minHeight`)  
[x] `data-testid` section & wave (`LazySectionShell`, `data-home-wave`)

### Revisi UI/UX *(Tier 1–4, Juni 2026)*

[x] Logo & warna brand baru  
[x] Navbar redesign + drawer sidebar (`NavbarSidebar.tsx`)  
[x] Share flow & leaderboard layout  
[x] Kategori editorial & info sidebar  
[x] Sidebar iklan artikel (`ArticleSidebarAd.tsx`)  
[x] Social media links — `SiteSocialLink`, `SocialMediaLinks.tsx`, admin CRUD

### Poin & leaderboard — News DB *(Fase C′)*

[x] Schema `point_transactions` di News DB  
[x] `lib/points.ts` — `awardPoints`, `getUserPointBalance`, `checkDailyLogin`  
[x] `GET /api/points/my` — saldo + 100 transaksi terakhir  
[x] `GET /api/leaderboard` + `/weekly` — agregasi `point_transactions`  
[x] `lib/leaderboard/queries.ts` — weekly, monthly, all-time (Asia/Jakarta)  
[x] `lib/home/queries/engagement.ts` — leaderboard preview homepage  
[x] Halaman `/leaderboard` — tab mingguan / bulanan / all-time  
[x] Navbar & profil — saldo dari `/api/user/gamification`  
[x] `app/(user)/activity/page.tsx` — riwayat aktivitas user  
[x] `/points` → redirect ke `/activity`  
[x] `scripts/verify-core-integration.ts` — verifikasi ledger & leaderboard  
[x] `awardXp()` Core — tidak dipakai aktivitas portal

### Auth, Core & deploy production

[x] Env News — `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_JWT_*`  
[x] Deploy Core prod — `GET https://core.jepangku.com/health` OK  
[x] News env prod — `CORE_API_URL`, `CORE_JWT_PUBLIC_KEY`, `CORE_JWT_ISSUER`  
[x] `lib/core/` — client, auth, gamification, types, activity-map, config, session  
[x] Migrasi DB — FK Clerk ID; `users.id` = Clerk ID  
[x] Core JWT — cookie `core_session` via `lib/core/session.ts`  
[x] `getCurrentUser()` / `getCurrentAdmin()` / `hasNewsAdminAccess()`  
[x] Skrip sync — `bun run db:sync-clerk` (Clerk → Core + `PORTAL_ADMIN`)  
[x] Verifikasi integrasi — `bun run verify:core` (registrasi, poin, daily login, admin, leaderboard, Core down)  
[x] Sync dokumen — `ecosystem-integration.md` §5 Juni 2026  
[x] Core down graceful degrade + runbook [`docs/runbooks/core-service-down.md`](./runbooks/core-service-down.md)

### Auth & akun — Clerk bridge

[x] `@clerk/nextjs` + `/sign-in`, `/sign-up`  
[x] JIT user provisioning (`lib/auth/clerk-user.ts`)  
[x] `SessionUser` abstraction + feature flag `AUTH_PROVIDER`  
[x] `proxy.ts` — proteksi route user/admin + logging API  
[x] `/login`, `/register` redirect ke Clerk; API lokal disabled (410)  
[x] Email verification, forgot password, OAuth — via Clerk  
[x] Username change cooldown 14 hari  
[x] `GET /api/auth/me`, logout Clerk/local  
[x] Kebijakan akun legacy — `isClerkUserId` guard, relink email, `purge:legacy-users`

### Keamanan & kualitas production

[x] Rate limiting — Upstash / Redis / in-memory (`lib/rate-limit.ts`, `lib/rate-limit-store.ts`)  
[x] Redis/Upstash — `UPSTASH_REDIS_REST_*` / `REDIS_URL` di production  
[x] Input sanitasi HTML (`lib/sanitizer.ts`)  
[x] Backfill sanitasi konten lama — `backfill:sanitize` / `backfill:sanitize:apply`  
[x] Image moderation — validasi file + AI opsional (`lib/image-moderation.ts`, `POST /api/upload`)  
[x] Error monitoring — `captureException` → `MONITORING_WEBHOOK_URL`  
[x] Log drain — structured JSON logger + `LOG_DRAIN_URL`  
[x] `GET /api/health` — cek DB

### Kontributor & gate upload *(Fase A″)*

[x] Role `CONTRIBUTOR` + model `ContributorApplication`  
[x] `lib/contributor.ts` — `canCreateArticles()`, `getContributorCta()`  
[x] API — `POST /api/contributor/apply`, `GET /api/contributor/status`  
[x] Admin — `/admin/contributors` approve/reject + `lib/contributor-applications.ts`  
[x] Gate — `POST /api/articles/create`, submit/edit/my/preview (`ContributorGate`)  
[x] Form `/contributor/apply` — `ContributorApplyForm.tsx` (ganti placeholder)  
[x] CTA kontributor — navbar dropdown, sidebar, profile  
[x] Entry point sinkron — my-articles disembunyikan untuk role `USER`

### Admin monitoring & audit *(Fase C′)*

[x] `/admin/leaderboard` — monitor leaderboard  
[x] `/admin/points` — transaksi poin + `PointTransactionDetailModal`  
[x] `/admin/activity-log` — audit log + grafik registrasi user  
[x] `lib/admin-monitoring.ts` — agregasi review artikel & kontributor  
[x] Activity audit — `ArticleReview` + `ContributorApplication`  
[x] `GET /api/admin/points` — summary per periode, breakdown tipe

### Artikel — publik, user & admin

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

### Quiz & polling

[x] API quiz — list, detail, attempt (one-attempt, scoring, poin)  
[x] API poll — list, detail, vote (multi-question, duplicate guard, poin)  
[x] Halaman publik `/quizzes`, `/quizzes/[slug]`, `/polls`, `/polls/[slug]`  
[x] Admin CRUD quiz & poll (multi-question builder, image upload)

### Bookmark, komentar & reaksi

[x] Bookmark — API + halaman `/bookmarks`  
[x] Komentar polimorfik — thread 1 level, moderasi admin, +2 poin (`lib/comments.ts`)  
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

[x] Profil user — `/profile`, `/profile/edit`, avatar upload (crop)  
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
[x] `lib/slug.ts`, `lib/article-tags.ts`, `lib/admin-articles-query.ts`  
[x] `RichTextEditor`, confirm modal, revision/review detail modal

### Admin — halaman & API

[x] Dashboard `/admin` — stats, quick actions, pending preview  
[x] Artikel — list, create, edit, detail, review queue, bulk, export  
[x] Kategori, tag, homepage featured/hot, info pages  
[x] Users — list, detail, role/status, transaksi poin di detail  
[x] Videos CRUD, Ads CRUD, site social links  
[x] Quizzes & polls CRUD + analytics link

### Halaman publik & statis

[x] Homepage `/`  
[x] About, Contact, Advertise, Media Partner, Career, Internship  
[x] Privacy Policy, Terms of Service, Disclaimer  
[x] `/contributor/apply` — form apply kontributor  
[x] `/activity` — riwayat poin & aktivitas user

### Halaman — checklist path

[x] `app/(public)/page.tsx`  
[x] `app/(public)/articles/page.tsx` · `articles/[slug]/page.tsx`  
[x] `app/(public)/polls/page.tsx` · `polls/[slug]/page.tsx`  
[x] `app/(public)/quizzes/page.tsx` · `quizzes/[slug]/page.tsx`  
[x] `app/(public)/leaderboard/page.tsx`  
[x] `app/(public)/search/page.tsx` · `trending/page.tsx` · `explore/page.tsx`  
[x] `app/(public)/profile/[username]/page.tsx`  
[x] `app/(public)/tv/page.tsx` · `tv/[slug]/page.tsx`  
[x] `app/(public)/contributor/apply/page.tsx`  
[x] `app/(public)/reactions/[type]/page.tsx`  
[x] `app/(user)/activity/page.tsx` · `bookmarks/page.tsx` · `my-articles/page.tsx`  
[x] `app/(user)/profile/page.tsx` · `profile/edit/page.tsx`  
[x] `app/(user)/submit-article/page.tsx` · `edit-article/[id]/page.tsx`  
[x] `app/(user)/preview-article/[id]/page.tsx`  
[x] `app/(admin)/admin/**` — dashboard, artikel, review, kategori, tag, users, contributors, quiz, poll, comments, videos, ads, analytics, info-pages, homepage, points, leaderboard, activity-log

---

## Referensi

- [`docs/README.md`](./README.md) — indeks dokumentasi  
- [`docs/backlog-plan.md`](./backlog-plan.md) — rencana kontributor, newsletter, notifikasi  
- [`docs/ecosystem-integration.md`](./ecosystem-integration.md) — kontrak Core cutover  
- [`docs/soft-launch-content.md`](./soft-launch-content.md) — guideline konten soft launch  
- `jepangku-core/docs/API.md` · `jepangku-core/docs/ECOSYSTEM.md`
