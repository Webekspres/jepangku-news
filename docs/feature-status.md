# 📌 Status Fitur & Prioritas (MVP → Lanjutan)

Dokumen ini menyajikan daftar fitur terperinci yang dapat di-track, diurutkan dari MVP inti sampai lanjutan / future.

## 🎯 Tujuan Utama

- Prioritaskan fitur user-facing terlebih dahulu
- Lengkapi workflow artikel, quiz, polling, poin, dan leaderboard
- Setelah fitur inti stabil, tingkatkan admin management dan sistem global-ready
- Shared auth / multi-app / LMS ditunda ke fase lanjutan

## 🧩 MVP Inti: Sudah Implementasi

- [x] Auth dasar: register, login, logout, `auth/me`
- [x] Publik artikel: homepage, daftar artikel, detail artikel
- [x] Article CRUD untuk admin
- [x] Submit artikel user + workflow review admin
- [x] Bookmark artikel user
- [x] Quiz: halaman list, detail quiz, submit jawaban
- [x] Polling/voting: halaman list, detail, vote
- [x] Weekly leaderboard
- [x] User profile dasar
- [x] User pages: bookmarks, my-articles, points
- [x] Admin dashboard dasar
- [x] Admin tags management
- [x] Admin users list + detail
- [x] Admin articles list + review queue
- [x] Cloudflare R2 upload helper (`lib/r2.ts`)
- [x] Profile edit page / profile update flow
- [x] Avatar upload terintegrasi profile
- [x] Submit article page untuk user (form UI + submit)
- [x] Edit article page untuk user
- [x] Quiz create page admin

## 🚧 MVP In Progress / Partial

- [ ] Poll create page admin
- [ ] Admin category management UI
- [ ] Full-text search dan filter kategori/tag
- [ ] Reading progress detection + reward points
- [ ] Share tracking + poin reward
- [ ] Poin hanya satu kali per activity rule enforcement (quiz, poll, bookmark, read)
- [ ] Review catatan reject / history pada halaman user article
- [ ] Admin homepage section management (featured / hot) — skeleton tersedia

## ❌ MVP Belum Dibangun / Fitur Penting yang Belum Lengkap

- [ ] Email verification
- [ ] Forgot password / password reset
- [ ] Activity log viewer
- [ ] Point transaction viewer
- [ ] Bulk action / export CSV / JSON
- [ ] Advanced admin quiz management (edit/update, status control)
- [ ] Advanced admin poll management (edit/update, status control)
- [ ] Improved search & discovery: kategori, tag, trending
- [ ] Monthly / all-time leaderboard
- [ ] Better author profile / bio / statistics on profile
- [ ] In-app notifications
- [ ] Comments system
- [ ] Rate limiting, sanitasi input, monitoring

## 📦 Fitur User-Facing yang Perlu Di-track

### Guest / publik

- [x] Baca artikel tanpa login
- [x] Lihat daftar artikel
- [x] Lihat detail artikel
- [x] Lihat leaderboard mingguan
- [x] Lihat quiz dan polling
- [ ] Search / filter hasil artikel
- [ ] Trending / popular article discovery

### Pengguna terdaftar

- [x] Bookmark artikel
- [x] Submit artikel untuk review
- [x] Lihat status artikel milik sendiri
- [x] Mengikuti quiz dengan hasil langsung
- [x] Mengikuti polling/vote
- [x] Dapatkan poin untuk aktivitas tertentu
- [x] Lihat halaman my-articles
- [x] Lihat halaman points
- [x] Edit profile / avatar
- [ ] Edit atau submit ulang artikel yang ditolak
- [ ] Booking ulang / kembali bookmark tanpa poin duplikat
- [ ] Login harian + poin login harian
- [ ] Share artikel + poin share
- [ ] Riwayat poin lengkap

### Admin

- [x] Akses admin dashboard
- [x] Review artikel pending
- [x] Publish / reject user article
- [x] Kelola tag
- [x] Kelola user
- [x] Kelola homepage settings dasar
- [ ] Kelola kategori
- [ ] Kelola quiz (create/update/status)
- [ ] Kelola poll (create/update/status)
- [ ] Activity audit / admin log
- [ ] Export data dan bulk action

## ⏱️ Prioritas Jangka Pendek (MVP-focused)

1. Lengkapi `submit-article` dan `edit-article` flow
2. Tambahkan search / category / tag filter
3. Implementasikan reading progress + reward points
4. Perbaiki admin quiz / poll management
5. Tambahkan activity log dan point transaction viewer
6. Tambahkan email verification + password reset

## 🛠️ Checklist File-by-File

- [x] `app/(public)/page.tsx` — homepage (featured, trending, polls/quiz, leaderboard skeleton)
- [x] `app/(public)/articles/page.tsx` — articles list (ArticleCardSkeleton)
- [x] `app/(public)/articles/[slug]/page.tsx` — article detail (ArticleCardSkeleton / content skeleton)
- [x] `app/(public)/polls/page.tsx` — polls list (PollCardSkeleton)
- [x] `app/(public)/polls/[slug]/page.tsx` — poll detail (options & results skeleton)
- [x] `app/(public)/quizzes/page.tsx` — quizzes list (PollQuizCardSkeleton)
- [x] `app/(public)/quizzes/[slug]/page.tsx` — quiz detail (questions/options skeleton)
- [x] `app/(public)/leaderboard/page.tsx` — leaderboard (LeaderboardRowSkeleton)

- [x] `app/(user)/bookmarks/page.tsx` — bookmarks (ArticleCardSkeleton grid)
- [x] `app/(user)/my-articles/page.tsx` — my-articles (compact ArticleCardSkeleton)
- [x] `app/(user)/points/page.tsx` — points (LeaderboardRowSkeleton placeholders)
- [x] `app/(user)/profile/page.tsx` — profile (pending)
- [X] `app/(user)/submit-article/page.tsx` — submit article (pending)
- [X] `app/(user)/edit-article/[id]/page.tsx` — edit article (pending)

- [x] `app/(admin)/admin/page.tsx` — admin dashboard (stats + pending skeleton)
- [x] `app/(admin)/admin/homepage/page.tsx` — homepage settings (featured/hot skeleton)
- [x] `app/(admin)/admin/tags/page.tsx` — tags management (row skeleton)
- [x] `app/(admin)/admin/users/page.tsx` — users list (table row skeleton)
- [x] `app/(admin)/admin/users/[id]/page.tsx` — user detail (detail skeleton)
- [x] `app/(admin)/admin/articles/page.tsx` — admin articles list (table skeleton)
- [x] `app/(admin)/admin/articles/review/page.tsx` — review queue & detail (skeleton)
- [ ] `app/(admin)/admin/quizzes/create/page.tsx` — quiz create (pending)
- [ ] `app/(admin)/admin/polls/create/page.tsx` — poll create (pending)

## 🔭 Lanjutan / Future

- Shared auth / multi-app integration (`news`, `learn`, `admin`, landing)
- LMS integration
- Super-admin / role hierarchy: `editor`, `moderator`, `instructor`, `student`
- Comments system
- Notifications / inbox
- Badge / achievement system
- Monetization / paywall / premium article
- Mobile app
- Monthly / all-time leaderboard
- System monitoring / observability
- Data warehouse / export analytics

## 📌 Referensi

- `README.md`
- `docs/technical-architecture.md`
- `.agents/mvp.md`
- `.agents/user-flow.md`
- kode sumber di `app/`, `components/`, `lib/`
