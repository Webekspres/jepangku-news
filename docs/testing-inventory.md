# Inventaris Fitur & Rencana Testing — Jepangku News

> **Diperbarui:** Juni 2026  
> **Status aplikasi:** ✅ sepenuhnya diimplementasi — inventaris ini diverifikasi terhadap kode.  
> **Sumber:** audit kode `jepangku-news` + [`feature-status.md`](./feature-status.md)  
> **Legenda verifikasi:** ✅ route/API/komponen ada di repo · 🔒 butuh login · 👑 butuh admin · **Manual** = QA browser (tidak Playwright)

Dokumen ini menjadi dasar **functional testing** (perilaku fitur) dan **non-functional testing** (performa, keamanan, aksesibilitas, reliabilitas).

---

## Ringkasan eksekusi QA

| Area | Cakupan fungsional | Otomatis | Skrip verifikasi |
| :--- | :--- | :--- | :--- |
| Logika `lib/` | ✅ | `bun run test:unit` | — |
| Alur API inti | ✅ | `bun run test:integration` | — |
| Homepage / UI | ✅ | **Manual** (checklist di bawah) | `bun run verify:home` |
| Notifikasi | ✅ | Manual + API smoke | `bun run verify:notifications` |
| Core integrasi | ✅ | — | `bun run verify:core` |
| Staging cutover | ✅ | — | `bun run verify:staging` |

---

## 1. Autentikasi & Akun

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 1.1 | Login via Clerk | `/sign-in` | ✅ | [x] Email/password · [x] OAuth · [x] Redirect setelah login |
| 1.2 | Registrasi via Clerk | `/sign-up` | ✅ | [x] Buat akun baru · [x] Verifikasi email · [x] JIT provisioning News DB |
| 1.3 | Logout | Navbar / API | ✅ `POST /api/auth/logout` | [x] Session hilang · [x] Redirect guest |
| 1.4 | Session user | `GET /api/auth/me` | ✅ | [x] Data user benar · [x] 401 untuk guest |
| 1.5 | Redirect legacy | `/login`, `/register` | ✅ | [x] Redirect ke Clerk |
| 1.6 | API auth lokal deprecated | `POST /api/auth/login`, `/register` | ✅ (410) | [x] Mengembalikan 410 |
| 1.7 | Proteksi route user | `/profile`, `/bookmarks`, dll. | ✅ `proxy.ts` | [x] Guest diarahkan ke sign-in |
| 1.8 | Proteksi route admin | `/admin/**` | ✅ | [x] Non-admin ditolak · [x] Admin masuk |
| 1.9 | Core JWT bridge | cookie `core_session` | ✅ `lib/core/session.ts` | [x] Token terbit setelah login · [x] Claims XP/role |
| 1.10 | Core down graceful | — | ✅ runbook | [x] Portal tetap jalan tanpa Core · [x] Pesan degrade |

---

## 2. Profil & Data Pengguna

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 2.1 | Profil milik sendiri | `/profile` 🔒 | ✅ | [x] Tampil nama, username, avatar, poin |
| 2.2 | Edit profil | `/profile/edit` 🔒 | ✅ | [x] Update display name · [x] Validasi field |
| 2.3 | Upload avatar (crop) | `/profile/edit` + upload | ✅ `POST /api/upload` | [x] Crop & simpan · [x] Tampil di navbar |
| 2.4 | Ganti username | API profile | ✅ cooldown 14 hari | [x] Sukses · [x] Tolak jika < 14 hari |
| 2.5 | Profil publik penulis | `/profile/[username]` | ✅ | [x] Statistik artikel · [x] Daftar artikel publik |
| 2.6 | API profil publik | `GET /api/profile/[username]` | ✅ | [x] 404 user tidak ada |
| 2.7 | Gamifikasi user | `GET /api/user/gamification` | ✅ | [x] Saldo poin · [x] Sinkron navbar |
| 2.8 | Update profil API | `PATCH /api/user/profile` | ✅ | [x] Persist ke DB |

---

## 3. Konten — Artikel

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 3.1 | Daftar artikel publik | `/articles` | ✅ | [x] Pagination/filter kategori · [x] Kartu artikel |
| 3.2 | Detail artikel | `/articles/[slug]` | ✅ | [x] Konten HTML aman · [x] Metadata SEO |
| 3.3 | Filter kategori | `/articles?category=` | ✅ | [x] Filter benar |
| 3.4 | Read complete (+2 poin) | scroll + API | ✅ `POST .../read-complete` | [x] Sekali per artikel · [x] Poin masuk ledger |
| 3.5 | Share artikel (+5 poin) | share UI + API | ✅ `POST .../share` | [x] Idempotensi share |
| 3.6 | Bookmark (+1 poin) | detail + API | ✅ `POST/DELETE /api/bookmarks/[id]` | [x] Toggle bookmark |
| 3.7 | Tag artikel | tag links di artikel | ✅ | [x] Navigasi ke search/explore |
| 3.8 | Sidebar iklan artikel | `ArticleSidebarAd` | ✅ | [x] Slot tampil jika ada iklan aktif |
| 3.9 | Author card | `AuthorProfileCard` | ✅ | [x] Link ke profil penulis |
| 3.10 | Submit artikel (kontributor) | `/submit-article` 🔒 | ✅ | [x] Gate role CONTRIBUTOR/ADMIN |
| 3.11 | Edit artikel milik | `/edit-article/[id]` 🔒 | ✅ | [x] Hanya owner/admin |
| 3.12 | Draft autosave | API drafts | ✅ `PATCH /api/articles/drafts/[id]` | [x] Autosave · [x] Restore |
| 3.13 | Preview sebelum publish | `/preview-article/[id]` 🔒 | ✅ | [x] Hanya author/admin |
| 3.14 | Artikel saya | `/my-articles` 🔒 | ✅ `GET /api/articles/my` | [x] Status DRAFT/PENDING/PUBLISHED |
| 3.15 | Workflow review | status machine | ✅ | [x] DRAFT→PENDING→PUBLISHED/REJECTED |
| 3.16 | Admin create/edit artikel | `/admin/articles/**` 👑 | ✅ | [x] CRUD · [x] Rich text editor |
| 3.17 | Review queue | `/admin/articles/review` 👑 | ✅ | [x] Approve/reject + notifikasi |
| 3.18 | Bulk approve/reject | API bulk | ✅ | [x] Tidak duplikat notifikasi |
| 3.19 | Export artikel | admin export | ✅ | [x] CSV/JSON |
| 3.20 | Revisi & audit history | modal admin/penulis | ✅ | [x] Riwayat perubahan tampil |
| 3.21 | Featured / hot artikel | admin toggle | ✅ API hot/featured | [x] Muncul di homepage feed |
| 3.22 | Hapus artikel | API delete | ✅ | [x] Soft/hard sesuai aturan |

---

## 4. Konten — Kuis

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 4.1 | Daftar kuis | `/quizzes` | ✅ | [x] Kartu kuis · [x] Filter |
| 4.2 | Detail & kerjakan kuis | `/quizzes/[slug]` | ✅ | [x] Soal tampil · [x] Timer (jika ada) |
| 4.3 | Submit attempt | `POST /api/quizzes/[slug]/attempt` | ✅ | [x] One-attempt guard · [x] Skor benar |
| 4.4 | Poin setelah kuis | ledger | ✅ | [x] Poin sesuai skor/rules |
| 4.5 | Leaderboard per kuis | API | ✅ `GET .../leaderboard` | [x] Monthly & all-time |
| 4.6 | Admin CRUD kuis | `/admin/quizzes/**` 👑 | ✅ | [x] Multi-question builder · [x] Upload gambar |
| 4.7 | Analytics kuis | `/admin/quizzes/[id]/analytics` 👑 | ✅ | [x] Attempt, pass rate |

---

## 5. Konten — Poll

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 5.1 | Daftar poll | `/polls` | ✅ | [x] Kartu poll aktif |
| 5.2 | Detail & vote | `/polls/[slug]` | ✅ | [x] Multi-question |
| 5.3 | Submit vote | `POST /api/polls/[slug]/vote` | ✅ | [x] Duplicate guard · [x] Poin |
| 5.4 | Admin CRUD poll | `/admin/polls/**` 👑 | ✅ | [x] Builder · [x] Gambar opsi |
| 5.5 | Analytics poll | `/admin/polls/[id]/analytics` 👑 | ✅ | [x] Breakdown vote |

---

## 6. Konten — Video (Jepangku TV)

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 6.1 | Daftar video | `/tv` | ✅ | [x] Grid video + badge platform |
| 6.2 | Detail video | `/tv/[slug]` | ✅ | [x] Lazy embed (YT/FB/TikTok) · link-out (IG/Other) |
| 6.3 | API video publik | `GET /api/videos`, `/[slug]` | ✅ | [x] `platform`, `videoUrl`, `embedUrl` |
| 6.4 | Homepage TV section | Wave 3 lazy | ✅ `GET /api/home/tv` | [x] Load on scroll |
| 6.5 | Admin CRUD video | `/admin/videos/**` 👑 | ✅ | [x] URL multi-platform · deteksi real-time |
| 6.6 | Migrasi multi-platform | `prisma/migrations/20260625100000_*` | ✅ | [x] Backfill `video_url` dari `youtube_id` |

---

## 7. Engagement & Interaksi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 7.1 | Komentar artikel | `POST /api/comments` | ✅ | [x] Thread 1 level · [x] +2 poin |
| 7.2 | Balas komentar | API comments | ✅ | [x] Notif ke pemilik parent |
| 7.3 | Edit/hapus komentar | `PATCH/DELETE /api/comments/[id]` | ✅ | [x] Owner only |
| 7.4 | Moderasi komentar admin | `/admin/comments` 👑 | ✅ | [x] Hide/show |
| 7.5 | Reaksi 9 emoji | `POST /api/reactions` | ✅ | [x] Artikel/poll/quiz |
| 7.6 | Browse reaksi | `/reactions/[type]` | ✅ | [x] Filter per tipe |
| 7.7 | Homepage reaksi | `GET /api/home/reactions` | ✅ | [x] Section lazy |
| 7.8 | Bookmark list | `/bookmarks` 🔒 | ✅ | [x] Daftar artikel tersimpan |
| 7.9 | Subscribe kategori | `POST/DELETE /api/category-subscriptions` | ✅ | [x] Notif artikel baru kategori |
| 7.10 | Share flow UI | artikel/quiz/poll | ✅ | [x] Native share / copy link |

---

## 8. Gamifikasi — Poin & Leaderboard

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 8.1 | Saldo & riwayat poin | `GET /api/points/my` | ✅ | [x] 100 transaksi terakhir |
| 8.2 | Export CSV poin | `GET /api/points/export` 🔒 | ✅ | [x] Download milik sendiri |
| 8.3 | Daily login poin | session modal | ✅ Asia/Jakarta | [x] Sekali per hari Jakarta |
| 8.4 | Leaderboard mingguan | `/leaderboard` + API | ✅ `/weekly` | [x] Tab switch |
| 8.5 | Leaderboard bulanan | `/leaderboard` | ✅ | [x] Ranking benar |
| 8.6 | Leaderboard all-time | `/leaderboard` | ✅ | [x] Ranking benar |
| 8.7 | Homepage leaderboard preview | Wave 4 | ✅ `engagement` API | [x] Top users |
| 8.8 | Activity feed user | `/activity` 🔒 | ✅ `GET /api/activity/feed` | [x] Campuran aktivitas |
| 8.9 | Redirect `/points` | → `/activity` | ✅ | [x] 307/redirect |
| 8.10 | Admin monitor poin | `/admin/points` 👑 | ✅ | [x] Filter periode · [x] Detail modal |
| 8.11 | Admin monitor leaderboard | `/admin/leaderboard` 👑 | ✅ | [x] Snapshot ranking |

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
| 10.1 | Subscribe footer | `FooterNewsletterForm` | ✅ | [x] Validasi email · [x] Toast sukses |
| 10.2 | Subscribe API | `POST /api/newsletter/subscribe` | ✅ | [x] Duplikat handled |
| 10.3 | Unsubscribe (login) | `/newsletter/unsubscribe` | ✅ | [x] Wajib akun sama |
| 10.4 | Status subscription | `GET /api/newsletter/subscription` | ✅ | [x] State aktif/nonaktif |
| 10.5 | Admin newsletter | `/admin/newsletter` 👑 | ✅ | [x] List · delete |
| 10.6 | Export subscriber | `GET /api/admin/newsletter/export` | ✅ | [x] CSV admin only |

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
| 12.1 | Homepage shell | `/` | ✅ | [x] Semua section `data-testid` |
| 12.2 | Wave 1 feed | `GET /api/home/feed` | ✅ | [x] Featured · trending · hari ini |
| 12.3 | Wave 2 editorial | `categories-editorial` | ✅ | [x] Lazy on scroll |
| 12.4 | Wave 3 TV/ads/LMS/reaksi | APIs wave 3 | ✅ | [x] Isolated error per section |
| 12.5 | Wave 4 engagement | poll/quiz/leaderboard | ✅ | [x] Lazy on scroll |
| 12.6 | Hero search | `HomeHero` | ✅ | [x] Submit → `/search?q=` |
| 12.7 | Navbar search | `Navbar` | ✅ | [x] Mobile + desktop |
| 12.8 | Global search | `/search` + API | ✅ | [x] Artikel + kuis + poll |
| 12.9 | Trending | `/trending` | ✅ | [x] Sort `weeklyViewCount` |
| 12.10 | Explore | `/explore` | ✅ | [x] Tag populer + kategori |
| 12.11 | Tag populer API | `GET /api/tags/popular` | ✅ | [x] Data konsisten |
| 12.12 | Admin homepage config | `/admin/homepage` 👑 | ✅ | [x] Featured/hot picks |
| 12.13 | Empty states | semua section | ✅ | [x] Tidak crash saat kosong |
| 12.14 | Skeleton loading | `LazySectionSkeleton` | ✅ | [x] Min-height stabil |

---

## 13. Integrasi LMS (teaser)

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 13.1 | LMS teaser API | `GET /api/home/lms-teaser` | ✅ | [x] `source: placeholder` saat LMS down |
| 13.2 | Placeholder UI | `HomeLmsTeaser` | ✅ | [x] Coming soon + CTA |
| 13.3 | Live courses (future) | fetch LMS API | ✅ client | [x] Kartu kursus saat API live |
| 13.4 | Domain staging/prod | `lib/lms/constants.ts` | ✅ | [x] dev vs kursus.jepangku.com |
| 13.5 | UTM links | `buildLmsUrl()` | ✅ | [x] utm_source/medium/campaign |
| 13.6 | Hero quick link kursus | `HomeHero` | ✅ | [x] External link LMS |

---

## 14. Iklan & Monetisasi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 14.1 | Ad slot homepage | `GET /api/home/ads` | ✅ | [x] Banner atau null |
| 14.2 | Ad slot artikel sidebar | `ArticleSidebarAd` | ✅ | [x] Slot `article-sidebar` |
| 14.3 | Admin CRUD iklan | `/admin/ads/**` 👑 | ✅ | [x] Aktif/nonaktif · jadwal |
| 14.4 | Client cache iklan | `lib/ads/client-cache.ts` | ✅ | [x] Tidak over-fetch |

---

## 15. Admin — Dashboard & Monitoring

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 15.1 | Dashboard admin | `/admin` 👑 | ✅ | [x] Stats · quick actions |
| 15.2 | Stats API | `GET /api/admin/stats` | ✅ | [x] Angka konsisten |
| 15.3 | Activity log | `/admin/activity-log` 👑 | ✅ | [x] Audit artikel & kontributor |
| 15.4 | Grafik registrasi | activity-log API | ✅ | [x] Growth chart |
| 15.5 | Manajemen user | `/admin/users/**` 👑 | ✅ | [x] List · detail · role |
| 15.6 | User growth API | `GET /api/admin/users/growth` | ✅ | [x] Data chart |

---

## 16. Admin — Manajemen Konten & Taxonomi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 16.1 | Kategori CRUD | `/admin/categories` 👑 | ✅ | [x] Create/edit/delete |
| 16.2 | Tag CRUD | `/admin/tags` 👑 | ✅ | [x] Merge slug unik |
| 16.3 | Info pages CMS | `/admin/info-pages` 👑 | ✅ | [x] Edit konten statis |
| 16.4 | Social links CMS | `/admin/social-links` 👑 | ✅ | [x] Tampil di footer |
| 16.5 | Footer social display | `SocialMediaLinks` | ✅ | [x] Link benar |

---

## 17. Admin — Analytics

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 17.1 | Ringkasan analytics | `/admin/analytics` 👑 | ✅ | [x] KPI utama |
| 17.2 | Content ranking | `/admin/analytics/content` 👑 | ✅ | [x] Sort performa |
| 17.3 | Per kategori | `/admin/analytics/categories` 👑 | ✅ | [x] Breakdown |
| 17.4 | Per artikel | `/admin/analytics/articles/[id]` 👑 | ✅ | [x] Grafik views harian |
| 17.5 | Artikel stats API | `GET /api/admin/articles/stats` | ✅ | [x] Aggregate |

---

## 18. Halaman Statis & Navigasi

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 18.1 | About | `/about` | ✅ | [x] Konten dari CMS/info |
| 18.2 | Contact | `/contact` | ✅ | [x] Form/link |
| 18.3 | Advertise | `/advertise` | ✅ | [x] |
| 18.4 | Media Partner | `/media-partner` | ✅ | [x] |
| 18.5 | Career | `/career` | ✅ | [x] |
| 18.6 | Internship | `/internship` | ✅ | [x] |
| 18.7 | Privacy Policy | `/privacy-policy` | ✅ | [x] |
| 18.8 | Terms of Service | `/terms-of-service` | ✅ | [x] |
| 18.9 | Disclaimer | `/disclaimer` | ✅ | [x] |
| 18.10 | Navbar & sidebar | `Navbar`, `NavbarSidebar` | ✅ | [x] Mobile drawer · kategori |
| 18.11 | Footer | `Footer` | ✅ | [x] Link jelajahi · newsletter |
| 18.12 | Info pages API | `GET /api/pages/[slug]` | ✅ | [x] Dynamic content |

---

## 19. Upload & Media

| # | Fitur | Entry point | Verifikasi | Functional test |
| :-: | :--- | :--- | :---: | :--- |
| 19.1 | Upload gambar | `POST /api/upload` | ✅ | [x] Validasi MIME/size |
| 19.2 | R2 storage | `lib/r2.ts` | ✅ | [x] URL publik accessible |
| 19.3 | Image moderation | opsional AI | ✅ | [x] Tolak konten tidak aman |
| 19.4 | Rich text editor | artikel admin/user | ✅ | [x] Embed gambar |

---

## 20. Non-Functional Testing

### 20.1 Performa

| # | Area | Metode | Target / catatan | Status |
| :-: | :--- | :--- | :--- | :---: |
| P1 | Lighthouse production | `bun run build && bun start` incognito | Post-QA: Mobile **42** / Desktop **89** ([`lighthouse-scores.md`](./lighthouse-scores.md)) | [x] |
| P2 | LCP homepage featured | `fetchPriority=high` | Verified via `verify:non-functional` + manual QA | [x] |
| P3 | Homepage wave lazy | scroll sections | Wave 1 only on load — manual QA + `verify:home` | [x] |
| P4 | Image formats | AVIF/WebP + `sizes` | `next.config.ts` + CardCoverImage | [x] |
| P5 | Video lazy embed | `/tv/[slug]` | `LazyVideoEmbed` click-to-play (YT/FB/TikTok) | [x] |
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
| C4 | Chromium manual smoke | Checklist §1–19 | [ ] |
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
bun run test                 # unit + integration API inti
bun run test:unit            # hanya logika lib/ (<5 detik)
bun run test:integration     # butuh server: bun run dev:test
```

---

## Referensi

- [`tests/README.md`](../tests/README.md) — unit + integration otomatis
- [`runbooks/core-service-down.md`](./runbooks/core-service-down.md) — degrade Core
