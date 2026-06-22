# Inventaris Fitur & Rencana Testing — Jepangku News

> **Diperbarui:** Juni 2026  
> **Sumber:** audit kode `jepangku-news` + [`feature-status.md`](./feature-status.md)  
> **Legenda verifikasi:** ✅ route/API/komponen ada di repo · ⏳ belum ada E2E otomatis · 🔒 butuh login · 👑 butuh admin

Dokumen ini menjadi dasar **functional testing** (perilaku fitur) dan **non-functional testing** (performa, keamanan, aksesibilitas, reliabilitas).

---

## Ringkasan eksekusi QA

| Area | Cakupan fungsional | E2E otomatis | Skrip verifikasi |
| :--- | :--- | :--- | :--- |
| Homepage | ✅ | `e2e/homepage.spec.ts` | `bun run verify:home` |
| Notifikasi | ✅ | `e2e/notifications.spec.ts` (parsial) | `bun run verify:notifications` |
| Core integrasi | ✅ | — | `bun run verify:core` |
| Staging cutover | ✅ | — | `bun run verify:staging` |
| Seluruh domain di bawah | ✅ manual | sebagian besar ⏳ | — |

---

## 1. Autentikasi & Akun

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 1.1 | Login via Clerk | `/sign-in` | ✅ | [ ] Email/password · [ ] OAuth · [ ] Redirect setelah login |
| 1.2 | Registrasi via Clerk | `/sign-up` | ✅ | [ ] Buat akun baru · [ ] Verifikasi email · [ ] JIT provisioning News DB |
| 1.3 | Logout | Navbar / API | ✅ `POST /api/auth/logout` | [ ] Session hilang · [ ] Redirect guest |
| 1.4 | Session user | `GET /api/auth/me` | ✅ | [ ] Data user benar · [ ] 401 untuk guest |
| 1.5 | Redirect legacy | `/login`, `/register` | ✅ | [ ] Redirect ke Clerk |
| 1.6 | API auth lokal deprecated | `POST /api/auth/login`, `/register` | ✅ (410) | [ ] Mengembalikan 410 |
| 1.7 | Proteksi route user | `/profile`, `/bookmarks`, dll. | ✅ `proxy.ts` | [ ] Guest diarahkan ke sign-in |
| 1.8 | Proteksi route admin | `/admin/**` | ✅ | [ ] Non-admin ditolak · [ ] Admin masuk |
| 1.9 | Core JWT bridge | cookie `core_session` | ✅ `lib/core/session.ts` | [ ] Token terbit setelah login · [ ] Claims XP/role |
| 1.10 | Core down graceful | — | ✅ runbook | [ ] Portal tetap jalan tanpa Core · [ ] Pesan degrade |

---

## 2. Profil & Data Pengguna

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 2.1 | Profil milik sendiri | `/profile` 🔒 | ✅ | [ ] Tampil nama, username, avatar, poin |
| 2.2 | Edit profil | `/profile/edit` 🔒 | ✅ | [ ] Update display name · [ ] Validasi field |
| 2.3 | Upload avatar (crop) | `/profile/edit` + upload | ✅ `POST /api/upload` | [ ] Crop & simpan · [ ] Tampil di navbar |
| 2.4 | Ganti username | API profile | ✅ cooldown 14 hari | [ ] Sukses · [ ] Tolak jika < 14 hari |
| 2.5 | Profil publik penulis | `/profile/[username]` | ✅ | [ ] Statistik artikel · [ ] Daftar artikel publik |
| 2.6 | API profil publik | `GET /api/profile/[username]` | ✅ | [ ] 404 user tidak ada |
| 2.7 | Gamifikasi user | `GET /api/user/gamification` | ✅ | [ ] Saldo poin · [ ] Sinkron navbar |
| 2.8 | Update profil API | `PATCH /api/user/profile` | ✅ | [ ] Persist ke DB |

---

## 3. Konten — Artikel

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 3.1 | Daftar artikel publik | `/articles` | ✅ | [ ] Pagination/filter kategori · [ ] Kartu artikel |
| 3.2 | Detail artikel | `/articles/[slug]` | ✅ | [ ] Konten HTML aman · [ ] Metadata SEO |
| 3.3 | Filter kategori | `/articles?category=` | ✅ | [ ] Filter benar |
| 3.4 | Read complete (+2 poin) | scroll + API | ✅ `POST .../read-complete` | [ ] Sekali per artikel · [ ] Poin masuk ledger |
| 3.5 | Share artikel (+5 poin) | share UI + API | ✅ `POST .../share` | [ ] Idempotensi share |
| 3.6 | Bookmark (+1 poin) | detail + API | ✅ `POST/DELETE /api/bookmarks/[id]` | [ ] Toggle bookmark |
| 3.7 | Tag artikel | tag links di artikel | ✅ | [ ] Navigasi ke search/explore |
| 3.8 | Sidebar iklan artikel | `ArticleSidebarAd` | ✅ | [ ] Slot tampil jika ada iklan aktif |
| 3.9 | Author card | `AuthorProfileCard` | ✅ | [ ] Link ke profil penulis |
| 3.10 | Submit artikel (kontributor) | `/submit-article` 🔒 | ✅ | [ ] Gate role CONTRIBUTOR/ADMIN |
| 3.11 | Edit artikel milik | `/edit-article/[id]` 🔒 | ✅ | [ ] Hanya owner/admin |
| 3.12 | Draft autosave | API drafts | ✅ `PATCH /api/articles/drafts/[id]` | [ ] Autosave · [ ] Restore |
| 3.13 | Preview sebelum publish | `/preview-article/[id]` 🔒 | ✅ | [ ] Hanya author/admin |
| 3.14 | Artikel saya | `/my-articles` 🔒 | ✅ `GET /api/articles/my` | [ ] Status DRAFT/PENDING/PUBLISHED |
| 3.15 | Workflow review | status machine | ✅ | [ ] DRAFT→PENDING→PUBLISHED/REJECTED |
| 3.16 | Admin create/edit artikel | `/admin/articles/**` 👑 | ✅ | [ ] CRUD · [ ] Rich text editor |
| 3.17 | Review queue | `/admin/articles/review` 👑 | ✅ | [ ] Approve/reject + notifikasi |
| 3.18 | Bulk approve/reject | API bulk | ✅ | [ ] Tidak duplikat notifikasi |
| 3.19 | Export artikel | admin export | ✅ | [ ] CSV/JSON |
| 3.20 | Revisi & audit history | modal admin/penulis | ✅ | [ ] Riwayat perubahan tampil |
| 3.21 | Featured / hot artikel | admin toggle | ✅ API hot/featured | [ ] Muncul di homepage feed |
| 3.22 | Hapus artikel | API delete | ✅ | [ ] Soft/hard sesuai aturan |

---

## 4. Konten — Kuis

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 4.1 | Daftar kuis | `/quizzes` | ✅ | [ ] Kartu kuis · [ ] Filter |
| 4.2 | Detail & kerjakan kuis | `/quizzes/[slug]` | ✅ | [ ] Soal tampil · [ ] Timer (jika ada) |
| 4.3 | Submit attempt | `POST /api/quizzes/[slug]/attempt` | ✅ | [ ] One-attempt guard · [ ] Skor benar |
| 4.4 | Poin setelah kuis | ledger | ✅ | [ ] Poin sesuai skor/rules |
| 4.5 | Leaderboard per kuis | API | ✅ `GET .../leaderboard` | [ ] Monthly & all-time |
| 4.6 | Admin CRUD kuis | `/admin/quizzes/**` 👑 | ✅ | [ ] Multi-question builder · [ ] Upload gambar |
| 4.7 | Analytics kuis | `/admin/quizzes/[id]/analytics` 👑 | ✅ | [ ] Attempt, pass rate |

---

## 5. Konten — Poll

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 5.1 | Daftar poll | `/polls` | ✅ | [ ] Kartu poll aktif |
| 5.2 | Detail & vote | `/polls/[slug]` | ✅ | [ ] Multi-question |
| 5.3 | Submit vote | `POST /api/polls/[slug]/vote` | ✅ | [ ] Duplicate guard · [ ] Poin |
| 5.4 | Admin CRUD poll | `/admin/polls/**` 👑 | ✅ | [ ] Builder · [ ] Gambar opsi |
| 5.5 | Analytics poll | `/admin/polls/[id]/analytics` 👑 | ✅ | [ ] Breakdown vote |

---

## 6. Konten — Video (Jepangku TV)

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 6.1 | Daftar video | `/tv` | ✅ | [ ] Grid video |
| 6.2 | Detail video | `/tv/[slug]` | ✅ | [ ] Lazy YouTube embed |
| 6.3 | API video publik | `GET /api/videos`, `/[slug]` | ✅ | [ ] Data lengkap |
| 6.4 | Homepage TV section | Wave 3 lazy | ✅ `GET /api/home/tv` | [ ] Load on scroll |
| 6.5 | Admin CRUD video | `/admin/videos/**` 👑 | ✅ | [ ] Create/edit/delete |

---

## 7. Engagement & Interaksi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 7.1 | Komentar artikel | `POST /api/comments` | ✅ | [ ] Thread 1 level · [ ] +2 poin |
| 7.2 | Balas komentar | API comments | ✅ | [ ] Notif ke pemilik parent |
| 7.3 | Edit/hapus komentar | `PATCH/DELETE /api/comments/[id]` | ✅ | [ ] Owner only |
| 7.4 | Moderasi komentar admin | `/admin/comments` 👑 | ✅ | [ ] Hide/show |
| 7.5 | Reaksi 9 emoji | `POST /api/reactions` | ✅ | [ ] Artikel/poll/quiz |
| 7.6 | Browse reaksi | `/reactions/[type]` | ✅ | [ ] Filter per tipe |
| 7.7 | Homepage reaksi | `GET /api/home/reactions` | ✅ | [ ] Section lazy |
| 7.8 | Bookmark list | `/bookmarks` 🔒 | ✅ | [ ] Daftar artikel tersimpan |
| 7.9 | Subscribe kategori | `POST/DELETE /api/category-subscriptions` | ✅ | [ ] Notif artikel baru kategori |
| 7.10 | Share flow UI | artikel/quiz/poll | ✅ | [ ] Native share / copy link |

---

## 8. Gamifikasi — Poin & Leaderboard

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 8.1 | Saldo & riwayat poin | `GET /api/points/my` | ✅ | [ ] 100 transaksi terakhir |
| 8.2 | Export CSV poin | `GET /api/points/export` 🔒 | ✅ | [ ] Download milik sendiri |
| 8.3 | Daily login poin | session modal | ✅ Asia/Jakarta | [ ] Sekali per hari Jakarta |
| 8.4 | Leaderboard mingguan | `/leaderboard` + API | ✅ `/weekly` | [ ] Tab switch |
| 8.5 | Leaderboard bulanan | `/leaderboard` | ✅ | [ ] Ranking benar |
| 8.6 | Leaderboard all-time | `/leaderboard` | ✅ | [ ] Ranking benar |
| 8.7 | Homepage leaderboard preview | Wave 4 | ✅ `engagement` API | [ ] Top users |
| 8.8 | Activity feed user | `/activity` 🔒 | ✅ `GET /api/activity/feed` | [ ] Campuran aktivitas |
| 8.9 | Redirect `/points` | → `/activity` | ✅ | [ ] 307/redirect |
| 8.10 | Admin monitor poin | `/admin/points` 👑 | ✅ | [ ] Filter periode · [ ] Detail modal |
| 8.11 | Admin monitor leaderboard | `/admin/leaderboard` 👑 | ✅ | [ ] Snapshot ranking |

**Sumber poin (anti-duplikasi):** baca artikel +2 · share +5 · bookmark +1 · komentar +2 · kuis (skor) · poll vote · daily login.

---

## 9. Notifikasi & Email

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 9.1 | Inbox bell | Navbar `NotificationBellMenu` | ✅ | [ ] Guest: bell hidden |
| 9.2 | List notifikasi | `GET /api/notifications` | ✅ | [ ] Pagination cursor |
| 9.3 | Unread count | `GET /api/notifications/unread-count` | ✅ | [ ] Badge update |
| 9.4 | Mark read | `PATCH .../[id]/read` | ✅ | [ ] Badge berkurang |
| 9.5 | Mark all read | `POST /read-all` | ✅ | [ ] Semua read |
| 9.6 | SSE realtime | `GET /api/notifications/stream` | ✅ | [ ] Badge update live |
| 9.7 | SSE fallback poll | client hook | ✅ | [ ] Poll saat disconnect |
| 9.8 | Welcome modal | `WelcomeModal` | ✅ | [ ] User baru saja |
| 9.9 | Daily points modal | `DailyPointsModal` | ✅ | [ ] Sekali/hari Jakarta |
| 9.10 | Notif artikel publish/reject | event hooks | ✅ | [ ] Ke penulis |
| 9.11 | Notif review pending | event hooks | ✅ | [ ] Ke admin |
| 9.12 | Notif kontributor | event hooks | ✅ | [ ] Approved/rejected |
| 9.13 | Notif komentar | agregasi | ✅ | [ ] Cap anti-spam |
| 9.14 | Email async outbox | Resend + QStash | ✅ | [ ] Welcome · reject · kontributor |
| 9.15 | Retention 90 hari | purge script | ✅ | [ ] `purge:notifications` |

---

## 10. Newsletter

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 10.1 | Subscribe footer | `FooterNewsletterForm` | ✅ | [ ] Validasi email · [ ] Toast sukses |
| 10.2 | Subscribe API | `POST /api/newsletter/subscribe` | ✅ | [ ] Duplikat handled |
| 10.3 | Unsubscribe (login) | `/newsletter/unsubscribe` | ✅ | [ ] Wajib akun sama |
| 10.4 | Status subscription | `GET /api/newsletter/subscription` | ✅ | [ ] State aktif/nonaktif |
| 10.5 | Admin newsletter | `/admin/newsletter` 👑 | ✅ | [ ] List · delete |
| 10.6 | Export subscriber | `GET /api/admin/newsletter/export` | ✅ | [ ] CSV admin only |

---

## 11. Kontributor

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 11.1 | Apply kontributor | `/contributor/apply` | ✅ | [ ] Form submit |
| 11.2 | Status aplikasi | `GET /api/contributor/status` | ✅ | [ ] Pending/approved/rejected |
| 11.3 | Admin review | `/admin/contributors` 👑 | ✅ | [ ] Approve/reject + notif |
| 11.4 | Gate submit artikel | `ContributorGate` | ✅ | [ ] USER ditolak · CONTRIBUTOR lolos |
| 11.5 | CTA dinamis navbar | `getContributorCta()` | ✅ | [ ] Label sesuai role |

---

## 12. Homepage & Discovery

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 12.1 | Homepage shell | `/` | ✅ | [ ] Semua section `data-testid` |
| 12.2 | Wave 1 feed | `GET /api/home/feed` | ✅ | [ ] Featured · trending · hari ini |
| 12.3 | Wave 2 editorial | `categories-editorial` | ✅ | [ ] Lazy on scroll |
| 12.4 | Wave 3 TV/ads/LMS/reaksi | APIs wave 3 | ✅ | [ ] Isolated error per section |
| 12.5 | Wave 4 engagement | poll/quiz/leaderboard | ✅ | [ ] Lazy on scroll |
| 12.6 | Hero search | `HomeHero` | ✅ | [ ] Submit → `/search?q=` |
| 12.7 | Navbar search | `Navbar` | ✅ | [ ] Mobile + desktop |
| 12.8 | Global search | `/search` + API | ✅ | [ ] Artikel + kuis + poll |
| 12.9 | Trending | `/trending` | ✅ | [ ] Sort `weeklyViewCount` |
| 12.10 | Explore | `/explore` | ✅ | [ ] Tag populer + kategori |
| 12.11 | Tag populer API | `GET /api/tags/popular` | ✅ | [ ] Data konsisten |
| 12.12 | Admin homepage config | `/admin/homepage` 👑 | ✅ | [ ] Featured/hot picks |
| 12.13 | Empty states | semua section | ✅ | [ ] Tidak crash saat kosong |
| 12.14 | Skeleton loading | `LazySectionSkeleton` | ✅ | [ ] Min-height stabil |

---

## 13. Integrasi LMS (teaser)

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 13.1 | LMS teaser API | `GET /api/home/lms-teaser` | ✅ | [ ] `source: placeholder` saat LMS down |
| 13.2 | Placeholder UI | `HomeLmsTeaser` | ✅ | [ ] Coming soon + CTA |
| 13.3 | Live courses (future) | fetch LMS API | ✅ client | [ ] Kartu kursus saat API live |
| 13.4 | Domain staging/prod | `lib/lms/constants.ts` | ✅ | [ ] dev vs kursus.jepangku.com |
| 13.5 | UTM links | `buildLmsUrl()` | ✅ | [ ] utm_source/medium/campaign |
| 13.6 | Hero quick link kursus | `HomeHero` | ✅ | [ ] External link LMS |

---

## 14. Iklan & Monetisasi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 14.1 | Ad slot homepage | `GET /api/home/ads` | ✅ | [ ] Banner atau null |
| 14.2 | Ad slot artikel sidebar | `AdBannerSlot` | ✅ | [ ] Slot `article-sidebar` |
| 14.3 | Admin CRUD iklan | `/admin/ads/**` 👑 | ✅ | [ ] Aktif/nonaktif · jadwal |
| 14.4 | Client cache iklan | `lib/ads/client-cache.ts` | ✅ | [ ] Tidak over-fetch |

---

## 15. Admin — Dashboard & Monitoring

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 15.1 | Dashboard admin | `/admin` 👑 | ✅ | [ ] Stats · quick actions |
| 15.2 | Stats API | `GET /api/admin/stats` | ✅ | [ ] Angka konsisten |
| 15.3 | Activity log | `/admin/activity-log` 👑 | ✅ | [ ] Audit artikel & kontributor |
| 15.4 | Grafik registrasi | activity-log API | ✅ | [ ] Growth chart |
| 15.5 | Manajemen user | `/admin/users/**` 👑 | ✅ | [ ] List · detail · role |
| 15.6 | User growth API | `GET /api/admin/users/growth` | ✅ | [ ] Data chart |

---

## 16. Admin — Manajemen Konten & Taxonomi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 16.1 | Kategori CRUD | `/admin/categories` 👑 | ✅ | [ ] Create/edit/delete |
| 16.2 | Tag CRUD | `/admin/tags` 👑 | ✅ | [ ] Merge slug unik |
| 16.3 | Info pages CMS | `/admin/info-pages` 👑 | ✅ | [ ] Edit konten statis |
| 16.4 | Social links CMS | `/admin/social-links` 👑 | ✅ | [ ] Tampil di footer |
| 16.5 | Footer social display | `SocialMediaLinks` | ✅ | [ ] Link benar |

---

## 17. Admin — Analytics

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 17.1 | Ringkasan analytics | `/admin/analytics` 👑 | ✅ | [ ] KPI utama |
| 17.2 | Content ranking | `/admin/analytics/content` 👑 | ✅ | [ ] Sort performa |
| 17.3 | Per kategori | `/admin/analytics/categories` 👑 | ✅ | [ ] Breakdown |
| 17.4 | Per artikel | `/admin/analytics/articles/[id]` 👑 | ✅ | [ ] Grafik views harian |
| 17.5 | Artikel stats API | `GET /api/admin/articles/stats` | ✅ | [ ] Aggregate |

---

## 18. Halaman Statis & Navigasi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 18.1 | About | `/about` | ✅ | [ ] Konten dari CMS/info |
| 18.2 | Contact | `/contact` | ✅ | [ ] Form/link |
| 18.3 | Advertise | `/advertise` | ✅ | [ ] |
| 18.4 | Media Partner | `/media-partner` | ✅ | [ ] |
| 18.5 | Career | `/career` | ✅ | [ ] |
| 18.6 | Internship | `/internship` | ✅ | [ ] |
| 18.7 | Privacy Policy | `/privacy-policy` | ✅ | [ ] |
| 18.8 | Terms of Service | `/terms-of-service` | ✅ | [ ] |
| 18.9 | Disclaimer | `/disclaimer` | ✅ | [ ] |
| 18.10 | Navbar & sidebar | `Navbar`, `NavbarSidebar` | ✅ | [ ] Mobile drawer · kategori |
| 18.11 | Footer | `Footer` | ✅ | [ ] Link jelajahi · newsletter |
| 18.12 | Info pages API | `GET /api/pages/[slug]` | ✅ | [ ] Dynamic content |

---

## 19. Upload & Media

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 19.1 | Upload gambar | `POST /api/upload` | ✅ | [ ] Validasi MIME/size |
| 19.2 | R2 storage | `lib/r2.ts` | ✅ | [ ] URL publik accessible |
| 19.3 | Image moderation | opsional AI | ✅ | [ ] Tolak konten tidak aman |
| 19.4 | Rich text editor | artikel admin/user | ✅ | [ ] Embed gambar |

---

## 20. Non-Functional Testing

### 20.1 Performa

| # | Area | Metode | Target / catatan | Status |
| :-: | :--- | :--- | :--- | :---: |
| P1 | Lighthouse production | `bun run build && bun start` incognito | Post-QA: Mobile **42** / Desktop **89** ([`lighthouse-scores.md`](./lighthouse-scores.md)) | [x] |
| P2 | LCP homepage featured | `fetchPriority=high` | Verified via `verify:non-functional` + E2E | [x] |
| P3 | Homepage wave lazy | scroll sections | Wave 1 only on load — E2E + `verify:home` | [x] |
| P4 | Image formats | AVIF/WebP + `sizes` | `next.config.ts` + CardCoverImage | [x] |
| P5 | YouTube lazy embed | `/tv/[slug]` | `LazyYoutubeEmbed` click-to-play | [x] |
| P6 | API cache headers | home APIs | `s-maxage` + SWR on home wave APIs | [x] |

### 20.2 Keamanan

| # | Area | Metode | Status |
| :-: | :--- | :--- | :---: |
| S1 | Rate limiting | flood API publik | [x] |
| S2 | HTML sanitasi | XSS di komentar/artikel | [x] |
| S3 | Auth boundary | API admin 403 untuk user | [x] |
| S4 | Upload validation | file type spoofing | [x] |
| S5 | Internal email route | `EMAIL_QUEUE_SECRET` | [x] |
| S6 | CSRF/session | Clerk + cookie httpOnly | [x] |

### 20.3 Aksesibilitas

| # | Area | Metode | Status |
| :-: | :--- | :--- | :---: |
| A1 | Kontras warna | WCAG AA spot check | [x] |
| A2 | Keyboard nav | navbar, modal, form | [x] |
| A3 | Touch targets | carousel, mobile nav | [x] |
| A4 | `inert` search overlay | hero mobile | [x] |
| A5 | Screen reader | bell, modal notifikasi | [x] |

### 20.4 Reliabilitas & Operasional

| # | Area | Metode | Status |
| :-: | :--- | :--- | :---: |
| R1 | Health check | `GET /api/health` | [x] |
| R2 | Core service down | runbook | [x] |
| R3 | DB connection fail | graceful error | [x] |
| R4 | Section error isolation | matikan 1 home API | [x] |
| R5 | Error monitoring webhook | `MONITORING_WEBHOOK_URL` | [x] |
| R6 | Log drain | `LOG_DRAIN_URL` | [x] |
| R7 | Redis fallback | tanpa Upstash lokal | [x] |

### 20.5 Kompatibilitas

| # | Area | Status |
| :-: | :--- | :---: |
| C1 | Mobile viewport (375px) — no horizontal scroll | [x] |
| C2 | Tablet (768px) | [x] |
| C3 | Desktop (1280px+) | [x] |
| C4 | Chromium E2E | `bun run test:e2e` | [x] |
| C5 | Safari/Firefox manual smoke | [x] |

---

## Matriks role untuk testing

| Role | Akun uji disarankan | Cakupan utama |
| :--- | :--- | :--- |
| **Guest** | tanpa login | Baca artikel, search, homepage, TV, poll/quiz view |
| **USER** | registrasi biasa | Profil, bookmark, komentar, reaksi, poin, notifikasi |
| **CONTRIBUTOR** | user + approve kontributor | Submit/edit artikel, preview, my-articles |
| **ADMIN** | `ADMIN_EMAIL` seed | Semua `/admin/**`, review, moderasi, analytics |

---

## Perintah QA cepat

```bash
bun run verify:home          # smoke homepage APIs
bun run verify:core          # integrasi Core + poin
bun run verify:notifications # notifikasi + Jakarta session
bun run verify:non-functional # keamanan, reliabilitas, a11y source checks
bun run lighthouse:audit     # skor Lighthouse (production build + start)
bun run verify:staging       # cutover staging (set NEWS_BASE_URL)
bun run test:e2e             # Playwright homepage + notifikasi + non-functional
```

---

## Referensi

- [`feature-status.md`](./feature-status.md) — status implementasi
- [`runbooks/core-service-down.md`](./runbooks/core-service-down.md) — degrade Core
- [`e2e/homepage.spec.ts`](../e2e/homepage.spec.ts) · [`e2e/notifications.spec.ts`](../e2e/notifications.spec.ts) · [`e2e/non-functional.spec.ts`](../e2e/non-functional.spec.ts)
