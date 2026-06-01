# 📌 Status Fitur & Prioritas (Ringkas)

Dokumen ini merangkum status fitur utama, prioritas, dan perubahan terbaru yang relevan dengan keadaan proyek saat ini.

## 🎯 Prioritas Pengembangan (singkat)

- User-facing features terlebih dahulu
- Admin management berikutnya
- Arsitektur shared auth / multi-app setelah fitur inti stabil

## ✅ Ringkasan Fitur Dasar yang Sudah Ada

- Auth: register, login, logout, `auth/me`
- Article CRUD (user + admin)
- Submit artikel dengan workflow review admin
- Bookmark artikel
- Quiz: list, detail, submit
- Poll: list, detail, vote
- Weekly leaderboard
- User profile dasar
- Cloudflare R2 helper untuk upload

## 🔁 Perubahan Terbaru (sinkron dengan repo sekarang)

- Skeleton placeholders: telah diterapkan pada banyak halaman untuk bagian dinamis (contoh: article detail, polls, quizzes, admin users/tags/homepage, user bookmarks, my-articles, points).
- Perbaikan runtime sederhana: beberapa guard (`?.`) ditambahkan untuk mencegah null-read errors.
- Perbaikan sintaks di beberapa halaman admin (mis. badge variant) dan konsistensi header pada dashboard.

## 🔧 Fitur Penting yang Belum Lengkap

(Prioritas menengah → tinggi)

- Email verification & forgot/reset password
- Avatar upload terintegrasi profile
- Full-text search & filter kategori/tag
- Reading progress + reward points
- Admin: manage categories, quiz management, poll management
- Admin: activity log & point transaction viewer
- Bulk actions & export CSV/JSON

## ✅ Pekerjaan Skeleton (status)

- Skeleton untuk komponen/article card dan detail: ✅
- Skeleton untuk halaman publik (articles, polls, quizzes): ✅
- Skeleton untuk area admin: users, tags, homepage, articles review: ✅
- Skeleton untuk user pages: bookmarks, my-articles, points: ✅

Jika ada halaman publik/admin lain yang perlu di-skeleton-kan, tambahkan ke daftar prioritas.

## 🛠️ Prioritas Jangka Pendek (tindak lanjut)

- [ ] Selesaikan `profile` editing + avatar upload
- [ ] Implementasi email verification + reset password
- [ ] Tingkatkan search & discovery (kategori/tag, trending)
- [ ] Perluas admin UI (categories, quizzes, polls)
- [ ] Tambah activity log + point transaction viewer

## 📌 Catatan Implementasi & Tautan Cepat

- Skeleton components ada di: `components/skeletons/*`
- Halaman admin yang direvisi: `app/(admin)/admin/*`
- Halaman user yang direvisi: `app/(user)/*`

## ✅ Checklist File-by-File (Skeleton)

Berikut status penerapan skeleton pada halaman-halaman utama. Centang menandakan skeleton untuk bagian dinamis sudah diterapkan.

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
- [ ] `app/(user)/profile/page.tsx` — profile (pending)
- [ ] `app/(user)/submit-article/page.tsx` — submit article (pending)
- [ ] `app/(user)/edit-article/[id]/page.tsx` — edit article (pending)

- [x] `app/(admin)/admin/page.tsx` — admin dashboard (stats + pending skeleton)
- [x] `app/(admin)/admin/homepage/page.tsx` — homepage settings (featured/hot skeleton)
- [x] `app/(admin)/admin/tags/page.tsx` — tags management (row skeleton)
- [x] `app/(admin)/admin/users/page.tsx` — users list (table row skeleton)
- [x] `app/(admin)/admin/users/[id]/page.tsx` — user detail (detail skeleton)
- [x] `app/(admin)/admin/articles/page.tsx` — admin articles list (table skeleton)
- [x] `app/(admin)/admin/articles/review/page.tsx` — review queue & detail (skeleton)
- [ ] `app/(admin)/admin/quizzes/create/page.tsx` — quiz create (pending)
- [ ] `app/(admin)/admin/polls/create/page.tsx` — poll create (pending)

Jika ada halaman lain yang ingin dimasukkan, sebutkan path-nya dan saya akan cek status serta menambahkan ke checklist.

## 🧭 Sumber & Referensi

- `README.md`
- `docs/technical-architecture.md`
- kode sumber di `app/`, `components/`, `lib/`
