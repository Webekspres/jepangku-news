# 📌 Fitur Tidak Selesai / Prioritas

Dokumen ini mencatat fitur yang saat ini belum lengkap dan yang perlu diprioritaskan.

## 🎯 Prioritas Pengembangan

1. User-facing features terlebih dahulu
2. Kemudian admin management
3. Baru setelah itu implementasi multi-app / shared auth

## ✅ Fitur yang Sudah Implementasi Dasar

- Auth: register, login, logout, `auth/me`
- Article CRUD dasar untuk user/admin
- Submit artikel user dengan workflow review admin
- Bookmark artikel
- Quiz list, detail, submit quiz
- Poll list, detail, vote
- Weekly leaderboard
- User profile sederhana
- Cloudflare R2 utility untuk upload file

## 🔧 Fitur User yang Belum Lengkap

- Email verification
- Forgot password / reset password
- Avatar upload terintegrasi profile
- Share article + poin reward
- Full-text search dan filter artikel yang lebih kuat
- Trending algorithm dan weekly view reset
- Reading progress page / UI indicator
- Profile edit dan username update

## 🗃️ Fitur Admin yang Belum Lengkap

- Manage categories UI / endpoints lengkap
- Manage quiz list dan edit quiz
- Manage poll list dan edit poll
- Activity log viewer admin
- Point transaction viewer admin
- Bulk actions untuk artikel, users, reviews
- Export data CSV/JSON untuk users / articles / transactions

## 🧩 Fitur Engagement & Gamification yang Belum Lengkap

- Share tracking + daily share limit
- Badge / achievement system
- Monthly leaderboard / all-time leaderboard
- Poll result page terpisah dengan grafik
- Notification system
- Comment system

## 🌐 Fitur Ekosistem & Integrasi Masa Depan

- Shared auth service terpisah
- Multi-app deployment: news, learn, admin, main
- Subdomain routing untuk `news.jepangku.com`, `learn.jepangku.com`
- LMS integration
- Multi-language support

## 🛠️ Prioritas Jangka Pendek

- [ ] Selesaikan user profile editing dan avatar upload
- [ ] Tambah email verification dan forgot/reset password
- [ ] Tambahkan reading progress / halaman baca selesai dan reward poin
- [ ] Perbaiki search, kategori/tag filter, dan discovery homepage
- [ ] Lengkapi admin UI untuk quiz / poll / categories / tags
- [ ] Tambahkan activity log admin dan point transaction viewer
- [ ] Stabilkan leaderboard, analytics, dan poin reward
- [ ] Siapkan arsitektur shared auth readiness / source_app global-ready

### 📌 Urutan Fitur Prioritas dari Awal sampai Selesai

1. Selesaikan profile user: edit profile, username update, dan avatar upload terintegrasi.
2. Implementasikan email verification serta forgot password / password reset.
3. Bangun reading progress page atau indicator, dan pastikan poin baca selesai diberikan sekali per artikel.
4. Perbaiki search artikel secara menyeluruh: full-text search, filter kategori/tag, sort latest/popular/trending.
5. Perbaiki discovery homepage: featured article, hot article, trending, popular, dan leaderboard preview.
6. Tambahkan share article tracking + reward poin + daily share limit.
7. Lengkapi admin kategori & tag management dengan UI, API, dan CRUD penuh.
8. Lengkapi admin quiz management: list, detail, create, edit, delete, dan publikasi.
9. Lengkapi admin poll management: list, detail, create, edit, delete, dan tampilan hasil.
10. Bangun admin user management yang menyertakan activity log dan point transaction viewer.
11. Tambahkan bulk actions admin untuk artikel, users, review, serta export CSV/JSON.
12. Tingkatkan engagement dengan notification system dasar dan comment system roadmap.
13. Tambahkan badge/achievement groundwork untuk gamifikasi dan retention.
14. Tambahkan monthly leaderboard dan all-time leaderboard di samping leaderboard mingguan.
15. Stabilkan point transaction reporting, leaderboard reset, dan analytics user activity.
16. Siapkan shared auth service terpisah secara arsitektural dengan model global-ready.
17. Rencanakan dan mulai implementasi multi-app deployment untuk `news`, `learn`, `admin`, dan landing.
18. Siapkan subdomain routing untuk `news.jepangku.com`, `learn.jepangku.com`, `admin.jepangku.com`.
19. Tambahkan dukungan multi-language sebagai fitur ekosistem.
20. Lakukan audit dokumentasi dan roadmap transisi dari single-app ke multi-app.

### 🧭 Sumber Analisis Prioritas

- `README.md`
- `docs/technical-architecture.md`
- `.agents/mvp.md`
- `.agents/user-flow.md`
- `.agents/project-steering.md`
