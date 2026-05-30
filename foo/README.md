Here's a list of features that are **not yet implemented** in my Japanese project, separated by module:

---

## 📰 Modul Artikel
- **Article Views table tracking** (`article_views` collection) — belum ada record per-view, hanya counter di articles
- **Share tracking** (`share_events` collection) + endpoint `POST /api/articles/{id}/share` dengan reward +5 poin + daily limit
- **Search dengan full-text** — saat ini hanya regex sederhana
- **Trending algorithm yang akurat** — `weekly_view_count` saat ini tidak di-reset mingguan
- **Article visibility** (`private`, `unlisted`) — hanya `public` yang berfungsi
- **Article archive flow** — endpoint admin untuk archive artikel
- **Article revision history** — tidak ada tracking edit history
- **Article reading time estimation** (e.g. "5 min read")

## 👤 Modul User Area
- **Edit Profile page** — endpoint `PUT /api/profile` (display_name, bio, headline, location, website_url)
- **Avatar upload** — meskipun ada `/api/upload`, tidak ter-wire ke profile
- **Username change** dengan validasi
- **Activity Log page** (`/profile/activity`) — terpisah dari Points History
- **Edit Article page UI flow** sudah ada tapi belum test penuh (load existing article into form)

## 🎯 Modul Quiz
- **Quiz retry logic** (`allow_retry` field) — saat ini selalu single-attempt
- **Quiz statistics for admin** — total peserta, rata-rata skor per quiz
- **Quiz with start/end date** (`started_at`, `ended_at`) — field ada tapi tidak dipakai
- **Personality quiz type** — saat ini hanya trivia/knowledge
- **Quiz attempt review** — user lihat jawaban yang benar setelah selesai

## 🗳️ Modul Polling/Voting
- **Poll start/end date enforcement** — field ada tapi auto-close belum jalan
- **Guest voting** (`allow_guest_vote` field) — selalu butuh login
- **Edit/Close poll** dari admin
- **Show result before vote** (`show_result_before_vote` field)
- **Poll results page** terpisah dengan chart visualisasi

## 🏆 Modul Gamifikasi & Poin
- **Share article +5 poin** — endpoint share belum ada
- **Daily share limit anti-spam**
- **Point spending/redemption** (future)
- **Badge/Achievement system** berdasarkan threshold poin
- **Monthly leaderboard** + **all-time leaderboard** — hanya weekly yang jalan
- **Leaderboard snapshots** (`leaderboard_snapshots` table untuk performance)

## 🔐 Modul Auth
- **Email verification** — field `email_verified_at` ada di schema tapi tidak ada flow
- **Forgot password / Password reset**
- **Change password** dari profile
- **Last login tracking** — `last_login_at` tidak di-update saat login
- **Remember me** functionality (extended session)
- **Session/device management**

## ⚙️ Modul Admin
- **Manage Categories page** (UI) — API ada (`POST /api/admin/categories`) tapi belum lengkap (GET/PUT/DELETE) + halaman frontend
- **Manage Polls list page** — hanya create yang ada, belum list/edit/close
- **Manage Quizzes list page** — hanya create yang ada
- **Activity Logs viewer** untuk admin
- **Point Transactions viewer** untuk admin (filter per user/activity)
- **Admin Settings page** (`admin_settings` collection) — manage point rules, site name, dll dari UI
- **Article admin actions**: archive, unarchive, manual edit dari admin panel
- **Bulk actions** (bulk approve, bulk ban, bulk delete)
- **Export data** (CSV/JSON) untuk users, articles, transactions

## 💬 Fitur Engagement Tertunda
- **Comments artikel** — disebut di problem statement sebagai ditunda
- **Notification system** (toast realtime untuk admin saat ada artikel pending)
- **Follow author** system
- **Report artikel** oleh user (flagging system)
- **Newsletter subscription**

## 🌐 Global-Ready / Future Ecosystem
- **LMS sub-app** (`learn.jepangku.com`) — fondasi `source_app` sudah siap
- **Shared auth service** terpisah
- **Subdomain routing** (news.jepangku.com vs jepangku.com)
- **Admin pusat** untuk multi-app
- **Multi-language support** (i18n)

## 🎨 UI/UX Polish
- **Reading progress bar** visual di article detail (logic sudah ada untuk award poin, tapi tidak ada UI bar)
- **Skeleton loaders** saat loading data
- **Empty states yang lebih ilustratif**
- **Mobile bottom navigation** untuk akses cepat
- **Dark mode toggle**
- **Animations on engagement** (confetti saat selesai quiz, dll)
- **SEO meta tags** dinamis per artikel (og:image, description)
- **Sitemap.xml & robots.txt**

## 📊 Analytics & Monitoring
- **Page view tracking**
- **Admin dashboard statistik lanjutan** (chart views per hari/minggu, top categories, dll)
- **Top articles by engagement** (bukan hanya views)
- **User retention metrics**

## 🛡️ Production-Ready
- **Rate limiting** pada endpoints sensitif (login, register, vote)
- **CAPTCHA** untuk register
- **Input sanitization** untuk HTML content artikel (XSS protection)
- **Image optimization** (thumbnail generation, WebP conversion)
- **CDN integration** untuk static assets
- **Logging & monitoring** (Sentry, structured logs)
- **Database migrations** strategy
- **Automated backups**

## 📱 Out of MVP Scope (sesuai dokumen)
- Mobile app native
- AI content recommendation
- Article berbayar/premium
- Monetization (ads, subscription)
- Forum komunitas
- Bookmark folder/collections
- API import artikel otomatis

---

**Total estimate untuk lengkapi semua P0+P1:** ~30-40 jam dev work tambahan, dengan prioritas tertinggi:
1. ⭐ Edit Profile + avatar upload
2. ⭐ Email verification + password reset
3. ⭐ Comments artikel
4. ⭐ Share tracking + poin
5. ⭐ Manage Categories/Quizzes/Polls list di admin
