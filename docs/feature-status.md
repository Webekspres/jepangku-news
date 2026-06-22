# Status Fitur & Checklist — Jepangku News

> **Diperbarui:** Juni 2026 (audit kode `jepangku-news`)  
> **Status aplikasi:** ✅ **Sepenuhnya diimplementasi** — portal production-ready.  
> **Sisa rencana:** hanya **§ Rencana Lanjutan** di bawah (ekosistem lintas-app; bisa nanti, bukan blokir rilis).  
> **Legenda:** `[ ]` belum · `[x]` selesai (verified)  
> **Rincian teknis:** [`backlog-plan.md`](./backlog-plan.md) · [`ecosystem-integration.md`](./ecosystem-integration.md) · [`development-roadmap.md`](./development-roadmap.md)  
> **Entry point per fitur:** [`testing-inventory.md`](./testing-inventory.md)

---

## Checklist Testing — Kerjakan

> **160 fitur · ~197 kondisi fungsional · 29 non-functional.** Centang `[x]` saat otomatis atau manual QA lulus.  
> **Target akhir:** `bun run test` = unit + integration + E2E.

### Fase 0 — Infrastruktur

[x] Setup Vitest atau `bun:test` + folder `tests/unit/`  
[x] Script `bun run test` (gabung unit + integration + E2E)  
[x] Script `bun run test:unit` · `test:integration` · `test:e2e` · `test:smoke`  
[x] Env test (`.env.test`) — DB, Clerk, Redis opsional  
[x] Akun uji Clerk: guest · USER · CONTRIBUTOR · ADMIN  
[x] `db:seed` konsisten untuk CI lokal  
[x] Dokumentasi cara jalankan satu perintah di `README.md`

### Fase 1 — Unit test `lib/` *(target ~80–100 kasus)*

[x] `tests/unit/points.test.ts` — `awardPoints`, `checkDailyLogin`, anti-duplikat  
[x] `tests/unit/article-workflow.test.ts` — transisi status DRAFT→PENDING→PUBLISHED/REJECTED  
[x] `tests/unit/sanitizer.test.ts` — XSS payload HTML  
[x] `tests/unit/jakarta-calendar.test.ts` — bounds harian Asia/Jakarta  
[x] `tests/unit/notifications-dispatch.test.ts` — dedupe, group cap  
[x] `tests/unit/contributor.test.ts` — `canCreateArticles`, `getContributorCta`  
[x] `tests/unit/slug.test.ts` · `username.test.ts` — validasi & cooldown  
[x] `tests/unit/article-view-url.test.ts` — preview vs publik  
[x] `tests/unit/newsletter.test.ts` — normalisasi email, duplikat  
[x] `tests/unit/leaderboard-period.test.ts` — mingguan/bulanan/all-time

### Fase 2 — API integration *(target ~200 kasus)*

[x] `tests/api/auth.test.ts` — me, logout, 401/410  
[x] `tests/api/articles.test.ts` — CRUD, workflow, read-complete, share, bookmark  
[x] `tests/api/points.test.ts` — ledger, export CSV  
[x] `tests/api/quizzes.test.ts` — attempt, one-attempt, skor  
[x] `tests/api/polls.test.ts` — vote, duplicate guard  
[x] `tests/api/comments.test.ts` — thread, owner, moderasi  
[x] `tests/api/notifications.test.ts` — list, read, dedupe, session Jakarta  
[x] `tests/api/newsletter.test.ts` — subscribe, unsubscribe, duplikat  
[x] `tests/api/contributor.test.ts` — apply, status, gate  
[x] `tests/api/home.test.ts` — wave 1–4, cache headers  
[x] `tests/api/admin.test.ts` — boundary 403 non-admin

### Fase 3 — E2E Playwright *(perluas dari 54 → ~150 kasus)*

[x] `e2e/contributor.spec.ts` — apply, gate submit, my-articles  
[x] `e2e/gamification.spec.ts` — daily modal, leaderboard tab, activity  
[x] `e2e/newsletter.spec.ts` — footer subscribe, unsubscribe  
[x] `e2e/engagement.spec.ts` — komentar, reaksi, bookmark list  
[x] `e2e/article-workflow.spec.ts` — submit→review→publish (CONTRIBUTOR + ADMIN)  
[x] `e2e/notifications.spec.ts` — perluas: bell login, SSE, welcome/daily modal  
[x] `e2e/tv.spec.ts` — daftar, detail, lazy embed  
[x] `e2e/search.spec.ts` — hero, navbar, global search  
[x] `e2e/admin-crud.spec.ts` — smoke CRUD kategori, tag, video, iklan  
[x] Login Clerk di fixture E2E (USER / CONTRIBUTOR / ADMIN)

### §1 Autentikasi & akun *(10 fitur · 19 kondisi)*

[ ] **1.1** Login Clerk — email/password  
[ ] **1.1** Login Clerk — OAuth  
[ ] **1.1** Login Clerk — redirect setelah login  
[ ] **1.2** Registrasi — buat akun baru  
[ ] **1.2** Registrasi — verifikasi email  
[ ] **1.2** Registrasi — JIT provisioning News DB  
[ ] **1.3** Logout — session hilang  
[ ] **1.3** Logout — redirect guest  
[ ] **1.4** `GET /api/auth/me` — data user benar  
[ ] **1.4** `GET /api/auth/me` — 401 untuk guest  
[ ] **1.5** `/login`, `/register` — redirect ke Clerk  
[ ] **1.6** `POST /api/auth/login`, `/register` — mengembalikan 410  
[ ] **1.7** Route user — guest diarahkan ke sign-in  
[ ] **1.8** Route admin — non-admin ditolak  
[ ] **1.8** Route admin — admin masuk  
[ ] **1.9** Core JWT — token terbit setelah login  
[ ] **1.9** Core JWT — claims XP/role  
[ ] **1.10** Core down — portal tetap jalan tanpa Core  
[ ] **1.10** Core down — pesan degrade

### §2 Profil & data user *(8 fitur · 13 kondisi)*

[ ] **2.1** `/profile` — tampil nama, username, avatar, poin  
[ ] **2.2** Edit profil — update display name  
[ ] **2.2** Edit profil — validasi field  
[ ] **2.3** Avatar — crop & simpan  
[ ] **2.3** Avatar — tampil di navbar  
[ ] **2.4** Username — sukses ganti  
[ ] **2.4** Username — tolak jika < 14 hari  
[ ] **2.5** Profil publik — statistik artikel  
[ ] **2.5** Profil publik — daftar artikel publik  
[ ] **2.6** `GET /api/profile/[username]` — 404 user tidak ada  
[ ] **2.7** Gamifikasi — saldo poin  
[ ] **2.7** Gamifikasi — sinkron navbar  
[ ] **2.8** `PATCH /api/user/profile` — persist ke DB

### §3 Artikel *(22 fitur · 28 kondisi)*

[ ] **3.1** Daftar artikel — pagination/filter kategori  
[ ] **3.1** Daftar artikel — kartu artikel  
[ ] **3.2** Detail — konten HTML aman  
[ ] **3.2** Detail — metadata SEO  
[ ] **3.3** Filter kategori — filter benar  
[ ] **3.4** Read complete — sekali per artikel  
[ ] **3.4** Read complete — poin masuk ledger  
[ ] **3.5** Share — idempotensi share  
[ ] **3.6** Bookmark — toggle bookmark  
[ ] **3.7** Tag — navigasi ke search/explore  
[ ] **3.8** Sidebar iklan — slot tampil jika aktif  
[ ] **3.9** Author card — link ke profil penulis  
[ ] **3.10** Submit — gate role CONTRIBUTOR/ADMIN  
[ ] **3.11** Edit — hanya owner/admin  
[ ] **3.12** Draft — autosave  
[ ] **3.12** Draft — restore  
[ ] **3.13** Preview — hanya author/admin  
[ ] **3.14** My articles — status DRAFT/PENDING/PUBLISHED  
[ ] **3.15** Workflow — DRAFT→PENDING→PUBLISHED/REJECTED  
[ ] **3.16** Admin CRUD artikel  
[ ] **3.16** Admin — rich text editor  
[ ] **3.17** Review queue — approve/reject + notifikasi  
[ ] **3.18** Bulk approve/reject — tidak duplikat notifikasi  
[ ] **3.19** Export — CSV/JSON  
[ ] **3.20** Revisi & audit — riwayat perubahan tampil  
[ ] **3.21** Featured/hot — muncul di homepage feed  
[ ] **3.22** Hapus — soft/hard sesuai aturan

### §4 Kuis *(7 fitur · 11 kondisi)*

[ ] **4.1** Daftar kuis — kartu kuis  
[ ] **4.1** Daftar kuis — filter  
[ ] **4.2** Detail — soal tampil  
[ ] **4.2** Detail — timer (jika ada)  
[ ] **4.3** Attempt — one-attempt guard  
[ ] **4.3** Attempt — skor benar  
[ ] **4.4** Poin setelah kuis — sesuai skor/rules  
[ ] **4.5** Leaderboard per kuis — monthly & all-time  
[ ] **4.6** Admin CRUD — multi-question builder  
[ ] **4.6** Admin CRUD — upload gambar  
[ ] **4.7** Analytics — attempt, pass rate

### §5 Poll *(5 fitur · 7 kondisi)*

[ ] **5.1** Daftar poll — kartu poll aktif  
[ ] **5.2** Detail — multi-question  
[ ] **5.3** Vote — duplicate guard  
[ ] **5.3** Vote — poin  
[ ] **5.4** Admin CRUD — builder  
[ ] **5.4** Admin CRUD — gambar opsi  
[ ] **5.5** Analytics — breakdown vote

### §6 Video — Jepangku TV *(5 fitur · 5 kondisi)*

[ ] **6.1** `/tv` — grid video  
[ ] **6.2** Detail — lazy YouTube embed  
[ ] **6.3** API video — data lengkap  
[ ] **6.4** Homepage TV — load on scroll  
[ ] **6.5** Admin CRUD video — create/edit/delete

### §7 Engagement & interaksi *(10 fitur · 11 kondisi)*

[ ] **7.1** Komentar — thread 1 level  
[ ] **7.1** Komentar — +2 poin  
[ ] **7.2** Balas komentar — notif ke pemilik parent  
[ ] **7.3** Edit/hapus — owner only  
[ ] **7.4** Moderasi admin — hide/show  
[ ] **7.5** Reaksi 9 emoji — artikel/poll/quiz  
[ ] **7.6** Browse reaksi — filter per tipe  
[ ] **7.7** Homepage reaksi — section lazy  
[ ] **7.8** Bookmark list — daftar artikel tersimpan  
[ ] **7.9** Subscribe kategori — notif artikel baru  
[ ] **7.10** Share flow — native share / copy link

### §8 Gamifikasi — poin & leaderboard *(11 fitur · 12 kondisi)*

[ ] **8.1** `GET /api/points/my` — 100 transaksi terakhir  
[ ] **8.2** Export CSV — download milik sendiri  
[ ] **8.3** Daily login — sekali per hari Jakarta  
[ ] **8.4** Leaderboard mingguan — tab switch  
[ ] **8.5** Leaderboard bulanan — ranking benar  
[ ] **8.6** Leaderboard all-time — ranking benar  
[ ] **8.7** Homepage preview — top users  
[ ] **8.8** Activity feed — campuran aktivitas  
[ ] **8.9** Redirect `/points` → `/activity`  
[ ] **8.10** Admin poin — filter periode  
[ ] **8.10** Admin poin — detail modal  
[ ] **8.11** Admin leaderboard — snapshot ranking

### §9 Notifikasi & email *(15 fitur · 16 kondisi)*

[ ] **9.1** Bell — guest: bell hidden  
[ ] **9.2** List — pagination cursor  
[ ] **9.3** Unread count — badge update  
[ ] **9.4** Mark read — badge berkurang  
[ ] **9.5** Mark all read — semua read  
[ ] **9.6** SSE — badge update live  
[ ] **9.7** SSE fallback — poll saat disconnect  
[ ] **9.8** Welcome modal — user baru saja  
[ ] **9.9** Daily points modal — sekali/hari Jakarta  
[ ] **9.10** Notif artikel — publish/reject ke penulis  
[ ] **9.11** Notif review — pending ke admin  
[ ] **9.12** Notif kontributor — approved/rejected  
[ ] **9.13** Notif komentar — cap anti-spam  
[ ] **9.14** Email outbox — welcome · reject · kontributor  
[ ] **9.15** Retention — `purge:notifications`

### §10 Newsletter *(6 fitur · 8 kondisi)*

[ ] **10.1** Footer subscribe — validasi email  
[ ] **10.1** Footer subscribe — toast sukses  
[ ] **10.2** Subscribe API — duplikat handled  
[ ] **10.3** Unsubscribe — wajib akun sama  
[ ] **10.4** Status subscription — aktif/nonaktif  
[ ] **10.5** Admin newsletter — list · delete  
[ ] **10.6** Export subscriber — CSV admin only

### §11 Kontributor *(5 fitur · 6 kondisi)*

[ ] **11.1** Apply — form submit  
[ ] **11.2** Status — pending/approved/rejected  
[ ] **11.3** Admin review — approve/reject + notif  
[ ] **11.4** Gate submit — USER ditolak  
[ ] **11.4** Gate submit — CONTRIBUTOR lolos  
[ ] **11.5** CTA navbar — label sesuai role

### §12 Homepage & discovery *(14 fitur · 17 kondisi)*

[ ] **12.1** Shell — semua section `data-testid`  
[ ] **12.2** Wave 1 — featured · trending · hari ini  
[ ] **12.3** Wave 2 — lazy on scroll  
[ ] **12.4** Wave 3 — isolated error per section  
[ ] **12.5** Wave 4 — lazy on scroll  
[ ] **12.6** Hero search — submit → `/search?q=`  
[ ] **12.7** Navbar search — mobile + desktop  
[ ] **12.8** Global search — artikel + kuis + poll  
[ ] **12.9** Trending — sort `weeklyViewCount`  
[ ] **12.10** Explore — tag populer + kategori  
[ ] **12.11** Tag populer API — data konsisten  
[ ] **12.12** Admin homepage — featured/hot picks  
[ ] **12.13** Empty states — tidak crash saat kosong  
[ ] **12.14** Skeleton — min-height stabil

### §13 Integrasi LMS teaser *(6 fitur · 7 kondisi)*

[ ] **13.1** LMS teaser API — `source: placeholder` saat LMS down  
[ ] **13.2** Placeholder UI — coming soon + CTA  
[ ] **13.3** Live courses — kartu kursus saat API live  
[ ] **13.4** Domain — dev vs kursus.jepangku.com  
[ ] **13.5** UTM links — utm_source/medium/campaign  
[ ] **13.6** Hero — external link LMS

### §14 Iklan & monetisasi *(4 fitur · 5 kondisi)*

[ ] **14.1** Homepage ad slot — banner atau null  
[ ] **14.2** Artikel sidebar — slot `article-sidebar`  
[ ] **14.3** Admin CRUD — aktif/nonaktif · jadwal  
[ ] **14.4** Client cache — tidak over-fetch

### §15 Admin — dashboard & monitoring *(6 fitur · 9 kondisi)*

[ ] **15.1** Dashboard — stats · quick actions  
[ ] **15.2** Stats API — angka konsisten  
[ ] **15.3** Activity log — audit artikel & kontributor  
[ ] **15.4** Grafik registrasi — growth chart  
[ ] **15.5** Manajemen user — list · detail · role  
[ ] **15.6** User growth API — data chart

### §16 Admin — konten & taxonomi *(5 fitur · 5 kondisi)*

[ ] **16.1** Kategori CRUD — create/edit/delete  
[ ] **16.2** Tag CRUD — slug unik  
[ ] **16.3** Info pages CMS — edit konten statis  
[ ] **16.4** Social links CMS — tampil di footer  
[ ] **16.5** Footer social — link benar

### §17 Admin — analytics *(5 fitur · 5 kondisi)*

[ ] **17.1** Ringkasan — KPI utama  
[ ] **17.2** Content ranking — sort performa  
[ ] **17.3** Per kategori — breakdown  
[ ] **17.4** Per artikel — grafik views harian  
[ ] **17.5** Artikel stats API — aggregate

### §18 Halaman statis & navigasi *(12 fitur · 14 kondisi)*

[ ] **18.1** `/about` — konten dari CMS/info  
[ ] **18.2** `/contact` — form/link  
[ ] **18.3** `/advertise`  
[ ] **18.4** `/media-partner`  
[ ] **18.5** `/career`  
[ ] **18.6** `/internship`  
[ ] **18.7** `/privacy-policy`  
[ ] **18.8** `/terms-of-service`  
[ ] **18.9** `/disclaimer`  
[ ] **18.10** Navbar & sidebar — mobile drawer · kategori  
[ ] **18.11** Footer — link jelajahi · newsletter  
[ ] **18.12** `GET /api/pages/[slug]` — dynamic content

### §19 Upload & media *(4 fitur · 4 kondisi)*

[ ] **19.1** Upload — validasi MIME/size  
[ ] **19.2** R2 — URL publik accessible  
[ ] **19.3** Image moderation — tolak konten tidak aman  
[ ] **19.4** Rich text editor — embed gambar

### §20 Non-functional *(29 kondisi)*

[ ] **P1** Lighthouse production — Mobile/Desktop baseline  
[ ] **P2** LCP featured — `fetchPriority=high`  
[ ] **P3** Homepage wave lazy — Wave 1 only on load  
[ ] **P4** Image formats — AVIF/WebP + `sizes`  
[ ] **P5** YouTube lazy embed — click-to-play  
[ ] **P6** API cache headers — `s-maxage` home APIs  
[ ] **S1** Rate limiting — flood API publik  
[ ] **S2** HTML sanitasi — XSS komentar/artikel  
[ ] **S3** Auth boundary — API admin 403 untuk user  
[ ] **S4** Upload validation — file type spoofing  
[ ] **S5** Internal email route — `EMAIL_QUEUE_SECRET`  
[ ] **S6** CSRF/session — Clerk + cookie httpOnly  
[ ] **A1** Kontras warna — WCAG AA  
[ ] **A2** Keyboard nav — navbar, modal, form  
[ ] **A3** Touch targets — carousel, mobile nav  
[ ] **A4** `inert` search overlay — hero mobile  
[ ] **A5** Screen reader — bell, modal notifikasi  
[ ] **R1** Health check — `GET /api/health`  
[ ] **R2** Core service down — graceful degrade  
[ ] **R3** DB connection fail — graceful error  
[ ] **R4** Section error isolation — satu home API gagal  
[ ] **R5** Error monitoring webhook  
[ ] **R6** Log drain  
[ ] **R7** Redis fallback — tanpa Upstash lokal  
[ ] **C1** Mobile 375px — no horizontal scroll  
[ ] **C2** Tablet 768px  
[ ] **C3** Desktop 1280px+  
[ ] **C4** Chromium E2E — `bun run test:e2e`  
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

## Sudah Diimplementasi — Verified

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

### Keamanan & kualitas production

[x] Rate limiting — Upstash / Redis / in-memory (`lib/rate-limit.ts`, `lib/rate-limit-store.ts`)  
[x] Redis/Upstash — `UPSTASH_REDIS_REST_*` / `REDIS_URL` di production  
[x] Input sanitasi HTML (`lib/sanitizer.ts`)  
[x] Backfill sanitasi konten lama — `backfill:sanitize` / `backfill:sanitize:apply`  
[x] Image moderation — validasi file + AI opsional (`lib/image-moderation.ts`, `POST /api/upload`)  
[x] Error monitoring — `captureException` → `MONITORING_WEBHOOK_URL`  
[x] Log drain — structured JSON logger + `LOG_DRAIN_URL`  
[x] `GET /api/health` — cek DB

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

### Kontributor & gate upload *(Fase A″)*

[x] Role `CONTRIBUTOR` + model `ContributorApplication`  
[x] `lib/contributor.ts` — `canCreateArticles()`, `getContributorCta()`  
[x] API — `POST /api/contributor/apply`, `GET /api/contributor/status`  
[x] Admin — `/admin/contributors` approve/reject + `lib/contributor-applications.ts`  
[x] Gate — `POST /api/articles/create`, submit/edit/my/preview (`ContributorGate`)  
[x] Form `/contributor/apply` — `ContributorApplyForm.tsx` (ganti placeholder)  
[x] CTA kontributor — navbar dropdown, sidebar, profile  
[x] Entry point sinkron — my-articles disembunyikan untuk role `USER`

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
[x] `/admin/quizzes/[id]/analytics` — attempt, skor, pass rate *(redirect dari `/admin/analytics/quizzes/[id]`)*  
[x] `/admin/polls/[id]/analytics` — breakdown vote *(redirect dari `/admin/analytics/polls/[id]`)*

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

### Admin monitoring & audit *(Fase C′)*

[x] `/admin/leaderboard` — monitor leaderboard  
[x] `/admin/points` — transaksi poin + `PointTransactionDetailModal`  
[x] `/admin/activity-log` — audit log + grafik registrasi user  
[x] `lib/admin-monitoring.ts` — agregasi review artikel & kontributor  
[x] Activity audit — `ArticleReview` + `ContributorApplication`  
[x] `GET /api/admin/points` — summary per periode, breakdown tipe

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

#### QA notifikasi

[x] `bun run verify:notifications` — Jakarta session, dedupe, group cap, email hooks  
[x] E2E Playwright — `e2e/notifications.spec.ts` (API 401, guest bell hidden)  
[x] Daily modal sekali per hari (Jakarta); welcome hanya user baru  
[x] Bulk approve tidak duplikat notif  
[x] Komentar spam tidak membanjiri inbox (agregasi + rate limit)

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

### QA & testing aplikasi

Checklist kerja lengkap ada di **[§ Checklist Testing — Kerjakan](#checklist-testing--kerjakan)** (bagian atas dokumen).  
Inventaris entry point per fitur: **[`testing-inventory.md`](./testing-inventory.md)**.

#### Otomatis & smoke

[x] Perluas E2E Playwright — auth, artikel, kuis, poll, profil, admin smoke  
[x] Homepage E2E — `e2e/homepage.spec.ts`  
[x] Notifikasi E2E (parsial) — `e2e/notifications.spec.ts`  
[x] Non-functional E2E — `e2e/non-functional.spec.ts` (viewport, health, a11y, security headers)  
[x] `bun run verify:home` — wave APIs homepage  
[x] `bun run verify:core` — integrasi Core + ledger poin  
[x] `bun run verify:notifications` — Jakarta session, dedupe, email hooks  
[x] `bun run verify:staging` — cutover staging ([`runbooks/core-service-down.md`](./runbooks/core-service-down.md))  
[x] `bun run verify:non-functional` — 47/47 checks (performa, keamanan, a11y, reliabilitas)  
[x] `bun run lighthouse:audit` — skor terdokumentasi ([`lighthouse-scores.md`](./lighthouse-scores.md))

#### Functional manual (per domain)

[x] **Autentikasi & akun** — login, logout, daftar, proteksi route, Core bridge  
[x] **Profil & data user** — edit profil, avatar, username cooldown, profil publik  
[x] **Artikel** — baca, workflow kontributor, review admin, poin read/share/bookmark  
[x] **Kuis & poll** — attempt/vote, poin, leaderboard kuis  
[x] **Video TV** — daftar, detail, embed lazy  
[x] **Engagement** — komentar, reaksi, bookmark, subscribe kategori  
[x] **Gamifikasi** — poin, daily login, leaderboard, activity, export CSV  
[x] **Notifikasi & email** — bell, SSE, modal welcome/daily, event hooks  
[x] **Newsletter** — subscribe footer, unsubscribe, admin  
[x] **Kontributor** — apply, approve, gate submit  
[x] **Homepage & discovery** — wave lazy, search, trending, explore, empty states  
[x] **LMS teaser** — placeholder + link UTM ke kursus  
[x] **Iklan** — slot homepage & artikel, admin CRUD  
[x] **Admin** — dashboard, users, analytics, moderasi, monitoring poin  
[x] **Halaman statis & navigasi** — footer, navbar, info pages

#### Non-functional

[x] Lighthouse production build — baseline: Mobile 34 / Desktop 53  
[x] Lighthouse re-run post-QA — Mobile **42** / Desktop **89**; P2–P6 verified ([`lighthouse-scores.md`](./lighthouse-scores.md))  
[x] Keamanan — rate limit, sanitasi XSS, boundary admin API, upload spoofing, email queue, Clerk session — `verify:non-functional` (47/47)  
[x] Aksesibilitas — keyboard, kontras, touch target, screen reader bell/modal — E2E + Lighthouse a11y **96**  
[x] Reliabilitas — Core down, section error isolation, health check, monitoring/log drain/Redis fallback — `verify:non-functional`  
[x] Kompatibilitas — mobile/tablet/desktop, Safari/Firefox smoke — Playwright + best-practices headers di `next.config.ts`

### Soft launch konten *(operasional editorial — bukan kode)*

> Alur teknis publish sudah ada; sisa pekerjaan tim konten. Panduan: [`soft-launch-content.md`](./soft-launch-content.md).

[x] Riset topik dan sumber per kategori  
[x] Thumbnail/cover image  
[x] Konfigurasi kategori dan tag di admin  
[x] Testing konten: homepage, search, filter, leaderboard, quiz, poll  
[~] Penulisan draft artikel (minimal 30 artikel) — tim editorial  
[~] Penyuntingan dan quality check — tim editorial  
[~] Publikasi artikel — tim editorial

### TODO dari Kode — Tier A–F *(audit Juni 2026, selesai)*

> **Sumber awal:** komentar `TODO:` di kode `jepangku-news` — tidak ada sisa `TODO:` di kode per verifikasi Juni 2026.

#### Tier A — Perbaikan kecil (CSS / teks / satu komponen)

[x] **`ArticleCard.tsx`** — gambar ikut `rounded` card; hilangkan overflow di sudut card  
[x] **`admin/users/[id]/page.tsx`** — breadcrumb: `Pengguna > Detail Pengguna > @username`  
[x] **`polls/[slug]/page.tsx`** — opsi poll yang dipilih/aktif lebih menonjol (warna merah, bukan hanya border)  
[x] **`HomeReactionsSection.tsx`** — perbesar icon reaksi, jadikan link, perkecil jarak count & label  
[x] **`HomeLmsTeaser.tsx`** — tambahkan logo Jepangku LMS (`jepangkunihongo`)  
[x] **Semua tabel admin** *(ref: `admin/homepage/page.tsx`)* — perbaiki border header tabel (background + rounded tidak rapi)

#### Tier B — Card stats admin *(polanya sama: query agregat + `AdminCard`)*

[x] **`admin/info-pages/page.tsx`** — total halaman informasi  
[x] **`admin/articles/review/page.tsx`** — total review + total kontributor menunggu review  
[x] **`admin/social-links/page.tsx`** — total link sosial + total yang aktif  
[x] **`admin/homepage/page.tsx`** — total artikel pilihan utama & hot  
[x] **`admin/newsletter/page.tsx`** — total subscriber, subscriber dari user (email match), subscriber non-user  
[x] **`admin/ads/page.tsx`** — total banner + total banner aktif  
[x] **`admin/videos/page.tsx`** — total video, terbit, draft  
[x] **`admin/quizzes/page.tsx`** — total kuis, aktif, draft, tidak aktif  
[x] **`admin/polls/page.tsx`** — total polling, aktif, draft, ditutup  
[x] **`admin/contributors/page.tsx`** — total permohonan, disetujui, ditolak, menunggu  
[x] **`admin/users/page.tsx`** — total pengguna, aktif, diblokir, draft, tidak aktif  
[x] **`admin/comments/page.tsx`** — total komentar (artikel/kuis/poll), disembunyikan, dihapus + link ke komentar di aksi  
[x] **`admin/analytics/page.tsx`** — total views harian & lifetime semua konten  
[x] **`admin/articles/page.tsx`** — card artikel yang kehilangan kategori + filter di tabel

#### Tier C — Perbaikan UX tabel & aksi admin

[x] **`Footer.tsx`** — pindahkan menu Jelajahi ke bawah Akun; form newsletter ke bawah deskripsi logo; kolom logo/deskripsi lebih lebar dari kolom lain; deskripsi kolom pertama lebih lebar & rata kanan  
[x] **`admin/newsletter/page.tsx`** — rapihkan UI tabel subscriber  
[x] **`admin/social-links/page.tsx`** — rapihkan UI tabel link sosial  
[x] **`admin/users/page.tsx`** — tombol jadikan admin untuk user berperan kontributor  
[x] **`admin/contributors/page.tsx`** — tabel dengan lihat detail permohonan + tombol setujui/tolak  
[x] **`admin/homepage/page.tsx`** — sederhanakan UX kurangi scroll berlebihan  
[x] **`admin/tags/page.tsx`** — modal create/edit, stat cards, UX selaras halaman kategori

#### Tier D — Layout publik (aside / breadcrumb / section homepage)

[x] **`polls/[slug]/page.tsx`** — breadcrumb seperti artikel + aside: rekomendasi polling lain, artikel trending, iklan  
[x] **`quizzes/[slug]/page.tsx`** — aside: rekomendasi kuis lain, artikel trending, iklan  
[x] **`HomeTodaySection.tsx`** — tag popular lebih besar & menonjol; tampilkan `TrendingArticlesPanel` di aside

#### Tier E — Fitur admin menengah *(form, preview, filter)*

[x] **`admin/info-pages/page.tsx`** — tombol preview di tabel + halaman preview admin  
[x] **`admin/categories/page.tsx`** — modal create/edit; hilangkan input hex & URL icon; toggle tampil di navbar (maks 9, sisanya disabled); card stats total kategori & `X/9` di navbar; rapihkan layout  
[x] **`NavbarCategoryBar.tsx`** — batasi kategori navbar maks 9 sesuai pengaturan admin *(terkait toggle kategori di admin)*  
[x] **`admin/ads/page.tsx`** — tabel: waktu aktif–berakhir, sisa hari, ukuran lebar/tinggi jelas; crop gambar saat upload (3 ukuran, seperti avatar); pisahkan komponen jelas

#### Tier F — Refactor & bug besar

[x] **`admin/quizzes/page.tsx`** — pindahkan analytics ke `admin/quizzes/[id]/analytics`  
[x] **`admin/polls/page.tsx`** — pindahkan analytics ke `admin/polls/[id]/analytics`  
[x] **`admin/analytics/page.tsx`** — jadikan hub analytics lengkap: ringkasan + performa artikel, kuis, polling, pengguna (masing-masing halaman punya card stats); klik drill-down ke analytics per konten di menu masing-masing; hapus submenu lama di bawah ringkasan  
[x] **`admin/videos/page.tsx`** — **BUG:** video baru tidak muncul di `/admin/videos` & section homepage TV; featured tidak berfungsi; hanya satu video featured (pindah bintang ke video lain); debounce toggle featured agar tidak selalu skeleton

---

## Referensi

- [`docs/README.md`](./README.md) — indeks dokumentasi  
- [`docs/testing-inventory.md`](./testing-inventory.md) — inventaris fitur & QA  
- [`docs/backlog-plan.md`](./backlog-plan.md) — arsip rencana teknis (selesai)  
- [`docs/ecosystem-integration.md`](./ecosystem-integration.md) — kontrak Core cutover  
- [`docs/soft-launch-content.md`](./soft-launch-content.md) — guideline konten soft launch  
- `jepangku-core/docs/API.md` · `jepangku-core/docs/ECOSYSTEM.md`
