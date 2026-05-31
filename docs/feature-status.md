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
- [ ] Tambah email verification / password reset
- [ ] Perbaiki search dan trending artikel
- [ ] Lengkapi admin UI untuk quiz / poll / categories
- [ ] Stabilkan leaderboard dan point transaction reporting
