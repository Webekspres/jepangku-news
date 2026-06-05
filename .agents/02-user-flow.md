# Scope Fitur  User Flow/Admin Flow MVP Jepangku

## 1. Ringkasan Scope MVP

MVP Jepangku adalah portal berita interaktif bertema Jepang yang dibuat sebagai single app terlebih dahulu. Aplikasi ini memiliki fitur artikel, submit artikel oleh user, review artikel oleh admin, quiz, polling/voting, sistem poin, bookmark, leaderboard mingguan, login/register, profile user, dan admin dashboard dasar.

MVP ini belum mencakup LMS, shared auth service terpisah, admin pusat, komentar artikel, sistem notifikasi, role kompleks, dan deployment multi-app. Namun struktur data dan konsep user tetap disiapkan agar dapat dikembangkan menjadi ekosistem multi-app di masa depan.

## 2. Tujuan MVP

Tujuan utama MVP Jepangku adalah:

1. Membuat portal berita bertema Jepang yang dapat dibaca publik.
2. Menyediakan sistem akun untuk user.
3. Memungkinkan user submit artikel.
4. Menyediakan proses review artikel oleh admin.
5. Menyediakan fitur interaktif berupa quiz dan polling/voting.
6. Memberikan poin dari aktivitas tertentu.
7. Menampilkan weekly leaderboard berdasarkan poin.
8. Menyiapkan struktur awal agar akun, poin, dan leaderboard dapat dikembangkan menjadi global-ready untuk LMS Jepangku.

## 3. Scope Utama MVP

Fitur yang masuk MVP:

1. Public portal.
2. Auth user/admin.
3. Artikel dan kategori.
4. Submit artikel oleh user.
5. Review artikel oleh admin.
6. Bookmark artikel.
7. Quiz pilihan ganda.
8. Polling/voting sederhana.
9. Sistem poin.
10. Weekly leaderboard.
11. Profile user sederhana.
12. Riwayat aktivitas/poin.
13. Admin dashboard dasar.
14. Pengelolaan homepage/banner sederhana.
15. Pengelolaan user dasar.

## 4. Fitur yang Tidak Masuk MVP

Fitur yang ditunda:

1. LMS belajar bahasa Jepang.
2. Shared auth service terpisah.
3. Admin pusat untuk seluruh ekosistem.
4. Multi-app deployment.
5. Komentar artikel.
6. Email verification.
7. Notification system.
8. Role editor, author, moderator, instructor, student.
9. Permission kompleks.
10. Badge/achievement kompleks.
11. Monetization.
12. AI recommendation.
13. API import artikel otomatis.
14. Forum komunitas.
15. Mobile app.
16. Artikel berbayar/premium.
17. Bookmark folder.
18. Report artikel oleh user.
19. Moderasi komentar.
20. Sistem follow author.

## 5. Role MVP

### 5.1 Guest

Guest adalah pengunjung yang belum login.

Guest dapat:

1. Membaca artikel.
2. Melihat daftar artikel.
3. Melihat detail artikel.
4. Melihat kategori.
5. Melihat search result.
6. Melihat leaderboard.
7. Melihat quiz dan polling.
8. Mencoba quiz/polling jika diizinkan, tetapi tidak mendapatkan poin.

Guest tidak dapat:

1. Submit artikel.
2. Bookmark artikel.
3. Mendapatkan poin.
4. Masuk leaderboard.
5. Melihat riwayat aktivitas.
6. Mengakses dashboard user.
7. Mengakses admin dashboard.

### 5.2 User

User adalah pengguna yang sudah login.

User dapat:

1. Membaca artikel.
2. Mendapatkan poin dari aktivitas tertentu.
3. Bookmark artikel.
4. Submit artikel.
5. Melihat artikel miliknya.
6. Mengedit artikel yang masih draft atau rejected.
7. Menghapus artikel miliknya jika belum published.
8. Mengikuti quiz.
9. Mengikuti polling/voting.
10. Melihat hasil quiz.
11. Melihat riwayat poin.
12. Melihat leaderboard.
13. Mengelola profile sederhana.

User tidak dapat:

1. Publish artikel secara langsung.
2. Approve/reject artikel.
3. Mengubah poin secara manual.
4. Mengelola user lain.
5. Mengelola kategori.
6. Mengelola quiz/polling dari admin panel.
7. Mengakses halaman admin.

### 5.3 Admin

Admin adalah pengelola portal news.

Admin dapat:

1. Login ke admin area.
2. Mengelola artikel.
3. Membuat artikel langsung sebagai admin.
4. Review artikel dari user.
5. Approve artikel.
6. Reject artikel dengan catatan.
7. Arsipkan artikel.
8. Mengelola kategori.
9. Mengelola tag.
10. Mengelola quiz.
11. Mengelola polling/voting.
12. Melihat daftar user.
13. Melihat aktivitas user.
14. Melihat transaksi poin.
15. Melihat leaderboard.
16. Mengelola banner/homepage sederhana.
17. Melihat statistik dasar.

Admin tidak perlu mengelola LMS pada MVP.

## 6. Modul Public Portal

### 6.1 Homepage

Homepage adalah halaman utama portal berita.

Komponen homepage:

1. Header/navbar.
2. Hero featured article.
3. Latest articles.
4. Trending articles.
5. Popular articles.
6. Hot article/manual editor pick.
7. Active polling/voting.
8. Latest quiz.
9. Weekly leaderboard preview.
10. Category section.
11. Footer.

Aturan:

1. Artikel yang tampil di homepage hanya artikel dengan status `published`.
2. Featured article dipilih oleh admin.
3. Hot article pada MVP menggunakan manual flag dari admin.
4. Latest berdasarkan tanggal publish terbaru.
5. Popular berdasarkan total views.
6. Trending berdasarkan views dalam 7 hari terakhir.
7. Leaderboard preview menampilkan beberapa user teratas minggu ini.

### 6.2 Article List

Halaman daftar artikel menampilkan semua artikel published.

Fitur:

1. Pagination atau load more.
2. Filter kategori.
3. Search sederhana.
4. Sort latest/popular/trending.
5. Badge kategori.
6. Thumbnail artikel.
7. Judul artikel.
8. Ringkasan artikel.
9. Author.
10. Tanggal publish.
11. Jumlah views.

### 6.3 Article Detail

Halaman detail artikel menampilkan isi artikel lengkap.

Fitur:

1. Judul artikel.
2. Thumbnail/cover.
3. Author.
4. Tanggal publish.
5. Kategori.
6. Tag.
7. Konten artikel.
8. Jumlah views.
9. Bookmark button.
10. Share button.
11. Related articles.
12. Reading progress atau deteksi baca selesai untuk poin.

Aturan poin:

1. User login mendapatkan +2 poin setelah membaca artikel sampai selesai.
2. Poin membaca artikel hanya diberikan satu kali per artikel.
3. Guest dapat membaca artikel tetapi tidak mendapat poin.
4. View tetap dihitung untuk guest dan user.
5. Poin bookmark hanya diberikan pada bookmark pertama.

## 7. Modul Auth

### 7.1 Register

Fitur register:

1. Name/display name.
2. Username.
3. Email.
4. Password.
5. Confirm password.

Aturan:

1. Email harus unik.
2. Username harus unik.
3. User baru otomatis mendapat role `user`.
4. Email verification ditunda pada MVP.
5. User yang register dianggap sebagai akun Jepangku pusat.

### 7.2 Login

Fitur login:

1. Email atau username.
2. Password.
3. Remember session jika diperlukan.

Aturan:

1. User biasa diarahkan ke halaman utama/profile.
2. Admin diarahkan ke admin dashboard.
3. Login harian memberikan +3 poin satu kali per hari untuk user.

### 7.3 Logout

User/admin dapat logout dari sistem dan session dihapus.

## 8. Modul User Area

### 8.1 Profile

Profile user menampilkan data dasar.

Fitur:

1. Avatar.
2. Display name.
3. Username.
4. Bio singkat.
5. Total poin.
6. Weekly points.
7. Jumlah artikel dibaca.
8. Jumlah quiz diikuti.
9. Jumlah polling/voting diikuti.
10. Artikel yang disubmit.
11. Bookmark.
12. Riwayat poin.

### 8.2 Edit Profile

User dapat mengubah:

1. Display name.
2. Avatar.
3. Bio.
4. Username jika diizinkan.

Email sebaiknya tidak mudah diubah pada MVP, atau jika diizinkan, perlu validasi tambahan.

### 8.3 My Articles

Halaman ini menampilkan artikel yang dibuat oleh user.

Status artikel:

1. Draft.
2. Pending Review.
3. Published.
4. Rejected.
5. Archived.

Aksi yang tersedia:

1. Buat artikel baru.
2. Edit draft.
3. Submit draft.
4. Edit artikel rejected.
5. Submit ulang artikel rejected.
6. Hapus artikel jika belum published.
7. Lihat catatan reject dari admin.

User tidak dapat mengedit artikel yang sudah published pada MVP, kecuali sistem nanti menyediakan request revision.

### 8.4 Bookmark

Halaman bookmark menampilkan artikel yang disimpan user.

Aturan:

1. User login bisa bookmark artikel.
2. Bookmark pertama memberikan +1 poin.
3. Jika bookmark dihapus lalu ditambahkan lagi, poin tidak diberikan ulang.
4. Guest tidak bisa bookmark.

### 8.5 Point History

Halaman ini menampilkan riwayat transaksi poin user.

Data yang ditampilkan:

1. Aktivitas.
2. Jumlah poin.
3. Sumber aktivitas.
4. Tanggal.
5. Status jika diperlukan.

Contoh aktivitas:

1. Membaca artikel.
2. Mengikuti quiz.
3. Jawaban quiz benar.
4. Mengikuti polling.
5. Login harian.
6. Share artikel.
7. Bookmark artikel.

## 9. Modul Submit Artikel User

### 9.1 Form Submit Artikel

Field artikel:

1. Title.
2. Slug otomatis.
3. Excerpt/ringkasan.
4. Content.
5. Cover image.
6. Category.
7. Tags.
8. Source/reference jika ada.
9. Status draft atau submit.

Aturan:

1. User harus login untuk submit artikel.
2. Artikel dari user tidak langsung publish.
3. Artikel masuk status `pending_review` setelah disubmit.
4. User dapat menyimpan sebagai draft.
5. User dapat mengedit artikel jika status `draft` atau `rejected`.
6. User dapat menghapus artikel yang belum published.

### 9.2 Status Flow Artikel User

```txt id="2ezpnz"
Draft
↓
Submit
↓
Pending Review
↓
Admin Review
↓
Approved → Published
↓
Rejected → User Edit Ulang → Submit Ulang
```

### 9.3 Reject Flow

Jika artikel ditolak:

1. Status artikel berubah menjadi `rejected`.
2. Admin memberikan catatan.
3. User dapat melihat catatan.
4. User dapat mengedit artikel.
5. User dapat submit ulang.
6. User dapat menghapus artikel untuk membatalkan.

## 10. Modul Quiz

### 10.1 Konsep Quiz News

Quiz pada news bukan bagian dari progress LMS. Quiz hanya digunakan sebagai fitur engagement.

Jenis quiz MVP:

1. Trivia budaya Jepang.
2. Quiz anime/manga.
3. Quiz pengetahuan umum Jepang.
4. Quiz fun personality sederhana jika memungkinkan.

Untuk MVP, prioritas utamanya adalah quiz pilihan ganda biasa.

### 10.2 Struktur Quiz

Quiz memiliki:

1. Title.
2. Description.
3. Thumbnail.
4. Questions.
5. Options.
6. Correct answer.
7. Result.
8. Point reward.
9. Status active/inactive.

Aturan:

1. Quiz hanya pilihan ganda.
2. Setiap pertanyaan memiliki satu jawaban benar.
3. Hasil quiz muncul setelah submit.
4. User login mendapat +10 poin setelah mengikuti quiz.
5. Jawaban benar mendapat +5 poin tambahan.
6. Poin hanya diberikan satu kali per quiz per user.
7. User boleh mengulang untuk hiburan jika sistem memungkinkan, tetapi tidak mendapat poin ulang.
8. Untuk MVP paling aman: user hanya bisa submit satu kali.

## 11. Modul Polling / Voting

### 11.1 Konsep Polling dan Voting

Polling dan voting berada di menu quiz/interaktif.

Polling digunakan untuk pertanyaan ringan.

Voting digunakan untuk aktivitas pemilihan yang lebih besar.

Secara teknis, polling dan voting dapat memakai struktur yang mirip, hanya dibedakan dengan tipe.

Tipe:

```txt id="m4lcye"
polling
voting
```

### 11.2 Fitur Polling/Voting

Fitur:

1. Daftar polling/voting aktif.
2. Detail polling/voting.
3. Pilihan jawaban.
4. Submit vote.
5. Hasil persentase.
6. Total vote.
7. Tanggal mulai.
8. Tanggal selesai.
9. Status active/inactive/closed.

Aturan:

1. User login mendapat +5 poin setelah mengikuti polling/voting.
2. Poin hanya diberikan satu kali per polling/voting.
3. User hanya bisa vote satu kali per polling/voting.
4. Guest dapat melihat hasil atau mencoba vote jika diizinkan, tetapi tidak mendapat poin.
5. Admin dapat membuat, mengedit, menutup, dan menghapus polling/voting.

## 12. Modul Poin

### 12.1 Aktivitas yang Menghasilkan Poin

Aturan poin MVP:

```txt id="rm1n54"
Membaca artikel sampai selesai: +2 poin
Mengikuti polling/voting: +5 poin
Mengikuti quiz: +10 poin
Jawaban quiz benar: +5 poin tambahan
Login harian: +3 poin
Membagikan artikel: +5 poin
Bookmark artikel: +1 poin
```

### 12.2 Prinsip Poin

1. Poin hanya diberikan kepada user login.
2. Guest tidak mendapatkan poin.
3. Setiap aktivitas harus tercatat di point transaction.
4. Poin dibuat global-ready menggunakan `source_app`.
5. Pada MVP, `source_app = news`.
6. LMS nanti dapat menggunakan `source_app = learn`.

### 12.3 Anti-Spam Poin

Aturan anti-spam:

1. Membaca artikel hanya dapat poin satu kali per artikel.
2. Quiz hanya dapat poin satu kali per quiz.
3. Polling/voting hanya dapat poin satu kali per polling/voting.
4. Login harian hanya satu kali per hari.
5. Bookmark hanya mendapat poin saat pertama kali bookmark.
6. Share artikel perlu batas harian.
7. User tidak mendapat poin dari submit artikel pada MVP.

## 13. Modul Leaderboard

### 13.1 Konsep Leaderboard

Leaderboard menampilkan user paling aktif berdasarkan poin.

Untuk MVP, leaderboard yang digunakan:

```txt id="xznhdb"
Weekly News Leaderboard
```

Namun struktur dibuat global-ready agar nanti dapat mendukung:

```txt id="gej81r"
News Leaderboard
Learning Leaderboard
Global Leaderboard
```

### 13.2 Data Leaderboard

Data yang ditampilkan:

1. Ranking.
2. Avatar.
3. Display name/username.
4. Weekly points.
5. Total points jika diperlukan.
6. Aktivitas terbanyak.
7. Badge/level sederhana jika tersedia.

### 13.3 Aturan Leaderboard

1. Leaderboard dihitung dari point transaction.
2. Leaderboard MVP menggunakan periode mingguan.
3. Email user tidak boleh ditampilkan.
4. Guest hanya dapat melihat leaderboard.
5. Hanya user login yang dapat masuk leaderboard.

## 14. Modul Admin Dashboard

### 14.1 Admin Dashboard Overview

Dashboard admin menampilkan statistik dasar.

Data yang ditampilkan:

1. Total artikel.
2. Artikel pending review.
3. Artikel published.
4. Total user.
5. Total quiz.
6. Total polling/voting.
7. Total views.
8. Top articles.
9. Top users weekly.
10. Aktivitas terbaru.

### 14.2 Manage Articles

Admin dapat:

1. Melihat semua artikel.
2. Filter artikel berdasarkan status.
3. Membuat artikel.
4. Mengedit artikel.
5. Publish artikel admin.
6. Arsipkan artikel.
7. Hapus artikel jika diperlukan.
8. Set featured article.
9. Set hot article/manual flag.

### 14.3 Review Articles

Admin dapat:

1. Melihat artikel pending review.
2. Membaca detail artikel.
3. Approve artikel.
4. Reject artikel.
5. Memberikan catatan reject.
6. Melihat riwayat revisi jika tersedia.

### 14.4 Manage Categories

Admin dapat:

1. Membuat kategori.
2. Mengedit kategori.
3. Menghapus kategori jika belum dipakai.
4. Mengatur slug kategori.
5. Mengatur status kategori active/inactive.

Kategori awal:

```txt id="9zsbft"
Anime
Manga
Culture
Travel
Food
Event
Technology
Lifestyle
Education
Fun
```

### 14.5 Manage Tags

Admin dapat:

1. Membuat tag.
2. Mengedit tag.
3. Menghapus tag jika belum dipakai.
4. Mengelola tag artikel.

### 14.6 Manage Quiz

Admin dapat:

1. Membuat quiz.
2. Mengedit quiz.
3. Menambah pertanyaan.
4. Menambah pilihan jawaban.
5. Menentukan jawaban benar.
6. Mengatur status quiz active/inactive.
7. Melihat jumlah peserta quiz.
8. Melihat statistik hasil quiz sederhana.

### 14.7 Manage Polling/Voting

Admin dapat:

1. Membuat polling/voting.
2. Mengedit polling/voting.
3. Menambah opsi.
4. Menentukan tanggal mulai.
5. Menentukan tanggal selesai.
6. Mengaktifkan/menonaktifkan polling/voting.
7. Menutup voting.
8. Melihat hasil voting.

### 14.8 Manage Users

Admin dapat:

1. Melihat daftar user.
2. Melihat detail user.
3. Melihat aktivitas user.
4. Melihat poin user.
5. Mengubah role user jika diperlukan.
6. Menonaktifkan user jika diperlukan.

Untuk MVP, pengelolaan user cukup sederhana. Tidak perlu permission kompleks.

### 14.9 Manage Homepage

Admin dapat:

1. Mengatur featured article.
2. Mengatur hot article.
3. Mengatur banner sederhana.
4. Mengatur artikel pilihan admin.

## 15. User Flow

### 15.1 Flow Guest Membaca Artikel

```txt id="mpnnk7"
Guest membuka homepage
↓
Guest memilih artikel
↓
Sistem menampilkan detail artikel
↓
Sistem menambah view artikel
↓
Guest membaca artikel
↓
Guest dapat melihat related articles
↓
Jika ingin bookmark/point, guest diarahkan login
```

### 15.2 Flow User Register

```txt id="k2saz2"
User membuka halaman register
↓
User mengisi name, username, email, password
↓
Sistem validasi data
↓
Sistem membuat akun dengan role user
↓
User login
↓
User diarahkan ke homepage/profile
```

### 15.3 Flow User Login

```txt id="tnkryf"
User membuka halaman login
↓
User memasukkan email/username dan password
↓
Sistem validasi credential
↓
Jika valid, sistem membuat session
↓
Sistem mengecek login harian
↓
Jika belum mendapat poin login hari ini, sistem memberi +3 poin
↓
User diarahkan ke homepage/profile
```

### 15.4 Flow User Membaca Artikel dan Mendapat Poin

```txt id="y2t1l4"
User login
↓
User membuka artikel
↓
Sistem menambah view artikel
↓
User membaca artikel sampai selesai
↓
Sistem mengecek apakah user sudah pernah mendapat poin dari artikel ini
↓
Jika belum, sistem membuat point transaction +2
↓
Poin user bertambah
↓
Aktivitas masuk ke riwayat
```

### 15.5 Flow User Bookmark Artikel

```txt id="tcnsqm"
User login
↓
User membuka artikel
↓
User klik bookmark
↓
Sistem menyimpan bookmark
↓
Sistem mengecek apakah bookmark artikel ini pernah diberi poin
↓
Jika belum, sistem memberi +1 poin
↓
Artikel masuk daftar bookmark user
```

### 15.6 Flow User Submit Artikel

```txt id="fbd4tz"
User login
↓
User masuk ke Submit Article
↓
User mengisi title, excerpt, content, cover, category, tags
↓
User memilih Save Draft atau Submit Review
↓
Jika Save Draft, status artikel menjadi draft
↓
Jika Submit Review, status artikel menjadi pending_review
↓
Admin dapat melihat artikel di review list
```

### 15.7 Flow User Artikel Ditolak

```txt id="8vxclu"
Admin reject artikel
↓
Status artikel menjadi rejected
↓
Admin menulis catatan
↓
User membuka My Articles
↓
User melihat status rejected dan catatan admin
↓
User mengedit artikel
↓
User submit ulang
↓
Status kembali menjadi pending_review
```

### 15.8 Flow User Mengikuti Quiz

```txt id="5jz62g"
User login
↓
User membuka daftar quiz
↓
User memilih quiz
↓
User menjawab pertanyaan pilihan ganda
↓
User submit jawaban
↓
Sistem menghitung hasil
↓
Sistem menampilkan skor
↓
Sistem mengecek apakah user sudah pernah mendapat poin dari quiz ini
↓
Jika belum, sistem memberi +10 poin
↓
Untuk setiap jawaban benar, sistem memberi +5 poin tambahan sesuai aturan
↓
Riwayat quiz dan poin disimpan
```

### 15.9 Flow Guest Mengikuti Quiz

```txt id="3g91pl"
Guest membuka quiz
↓
Guest menjawab quiz
↓
Sistem menampilkan hasil
↓
Guest tidak mendapat poin
↓
Sistem menampilkan ajakan login/register untuk menyimpan hasil dan mendapat poin
```

### 15.10 Flow User Mengikuti Polling/Voting

```txt id="r4l2uq"
User login
↓
User membuka polling/voting aktif
↓
User memilih opsi
↓
User submit vote
↓
Sistem mengecek apakah user sudah pernah vote
↓
Jika belum, vote disimpan
↓
Sistem memberi +5 poin jika belum pernah mendapat poin dari polling/voting ini
↓
Sistem menampilkan hasil persentase
```

### 15.11 Flow User Melihat Leaderboard

```txt id="d6giwp"
User/Guest membuka leaderboard
↓
Sistem mengambil point transaction periode minggu ini
↓
Sistem menghitung total poin user
↓
Sistem mengurutkan ranking
↓
Sistem menampilkan ranking, avatar, username/display name, dan poin
```

## 16. Admin Flow

### 16.1 Flow Admin Login

```txt id="m0k956"
Admin membuka halaman login
↓
Admin memasukkan credential
↓
Sistem validasi credential
↓
Sistem mengecek role admin
↓
Jika role admin valid, admin diarahkan ke dashboard
↓
Jika bukan admin, akses ditolak
```

### 16.2 Flow Admin Review Artikel

```txt id="t6fa2v"
Admin masuk dashboard
↓
Admin membuka menu Review Articles
↓
Admin memilih artikel pending_review
↓
Admin membaca isi artikel
↓
Admin memilih Approve atau Reject
↓
Jika Approve, status artikel menjadi published
↓
Artikel tampil di portal
↓
Jika Reject, admin mengisi catatan
↓
Status artikel menjadi rejected
↓
User dapat melihat catatan dan submit ulang
```

### 16.3 Flow Admin Membuat Artikel

```txt id="yfgbky"
Admin masuk dashboard
↓
Admin membuka Manage Articles
↓
Admin klik Create Article
↓
Admin mengisi title, content, cover, category, tags
↓
Admin memilih draft atau publish
↓
Jika publish, artikel langsung tampil di portal
```

### 16.4 Flow Admin Mengelola Homepage

```txt id="y3gso0"
Admin masuk dashboard
↓
Admin membuka Manage Homepage
↓
Admin memilih featured article
↓
Admin memilih hot article
↓
Admin mengatur banner jika ada
↓
Sistem menyimpan konfigurasi
↓
Homepage menampilkan konfigurasi terbaru
```

### 16.5 Flow Admin Membuat Quiz

```txt id="n5ebgj"
Admin masuk dashboard
↓
Admin membuka Manage Quiz
↓
Admin klik Create Quiz
↓
Admin mengisi title, description, thumbnail
↓
Admin menambahkan pertanyaan
↓
Admin menambahkan pilihan jawaban
↓
Admin menentukan jawaban benar
↓
Admin mengatur status active
↓
Quiz tampil di halaman quiz
```

### 16.6 Flow Admin Membuat Polling/Voting

```txt id="cq6mrb"
Admin masuk dashboard
↓
Admin membuka Manage Polling/Voting
↓
Admin klik Create
↓
Admin memilih tipe polling atau voting
↓
Admin mengisi pertanyaan/judul
↓
Admin menambahkan opsi
↓
Admin mengatur tanggal mulai dan selesai
↓
Admin mengatur status active
↓
Polling/voting tampil di portal
```

### 16.7 Flow Admin Melihat Leaderboard

```txt id="rj2j5l"
Admin masuk dashboard
↓
Admin membuka menu Leaderboard
↓
Sistem menampilkan ranking user minggu ini
↓
Admin dapat melihat detail aktivitas poin user
```

### 16.8 Flow Admin Melihat Detail User

```txt id="bmr87p"
Admin masuk dashboard
↓
Admin membuka Manage Users
↓
Admin memilih user
↓
Sistem menampilkan profile user
↓
Sistem menampilkan artikel user
↓
Sistem menampilkan riwayat poin
↓
Sistem menampilkan aktivitas quiz/polling
```

## 17. Prioritas Pengembangan MVP

### 17.1 Priority 1 — Core Foundation

Wajib dibuat pertama:

1. Setup project.
2. Database dasar.
3. Auth register/login/logout.
4. Role user/admin.
5. Layout public.
6. Layout admin.
7. Artikel.
8. Kategori.
9. Detail artikel.
10. Admin manage artikel.

### 17.2 Priority 2 — User Contribution

Dibuat setelah fondasi artikel stabil:

1. Submit artikel oleh user.
2. Draft artikel.
3. Pending review.
4. Approve/reject artikel.
5. Catatan reject.
6. My Articles.

### 17.3 Priority 3 — Engagement

Dibuat setelah flow artikel selesai:

1. Bookmark.
2. Quiz.
3. Polling/voting.
4. Article views.
5. Share tracking sederhana.

### 17.4 Priority 4 — Gamification

Dibuat setelah engagement stabil:

1. Point transaction.
2. Anti-spam poin.
3. Point history.
4. Weekly leaderboard.
5. Leaderboard preview homepage.

### 17.5 Priority 5 — Polish MVP

Dibuat menjelang akhir:

1. Homepage refinement.
2. Featured article.
3. Hot article manual flag.
4. Search sederhana.
5. Related articles.
6. Admin statistics.
7. Profile improvement.
8. Empty state.
9. Error state.
10. Responsive design.

## 18. Acceptance Criteria MVP

MVP dianggap selesai jika:

1. Guest bisa membaca artikel published.
2. User bisa register dan login.
3. User bisa submit artikel.
4. Artikel user masuk ke pending review.
5. Admin bisa approve/reject artikel.
6. Artikel approved tampil di portal.
7. Artikel rejected bisa diedit ulang oleh user.
8. User bisa bookmark artikel.
9. User bisa mengikuti quiz.
10. User bisa mengikuti polling/voting.
11. Sistem bisa memberi poin sesuai aturan.
12. Sistem mencegah poin dobel dari aktivitas yang sama.
13. Weekly leaderboard tampil berdasarkan poin.
14. Admin bisa mengelola artikel, kategori, quiz, polling, dan user.
15. Homepage menampilkan artikel, quiz/polling, dan leaderboard.
16. Guest tidak mendapat poin.
17. Email user tidak tampil di leaderboard.
18. Struktur poin memiliki `source_app` agar global-ready.

## 19. Risiko Scope

Risiko utama:

1. Scope terlalu besar jika quiz, polling, voting, poin, dan artikel dikerjakan sekaligus.
2. Review artikel bisa menjadi kompleks jika revisi dibuat terlalu detail.
3. Sistem poin bisa rawan spam jika validasi tidak jelas.
4. Leaderboard bisa salah jika perhitungan point transaction tidak rapi.
5. Quiz dan polling bisa membengkak jika dibuat terlalu fleksibel dari awal.
6. Admin dashboard bisa terlalu luas jika semua statistik dipaksakan.
7. Integrasi LMS bisa sulit jika struktur user terlalu spesifik untuk News.

## 20. Strategi Mengurangi Risiko

Strategi:

1. Bangun artikel dan auth terlebih dahulu.
2. Jangan membuat permission kompleks pada MVP.
3. Gunakan status artikel yang jelas.
4. Buat point transaction sejak awal.
5. Jangan hanya menyimpan total poin di tabel user.
6. Gunakan `source_app` untuk poin dan aktivitas.
7. Buat quiz pilihan ganda sederhana.
8. Satukan struktur polling dan voting dengan tipe berbeda.
9. Batasi poin agar tidak bisa diklaim berkali-kali.
10. Admin dashboard cukup menampilkan data penting dulu.

## 21. Kesimpulan Scope Final

Scope final MVP Jepangku adalah membangun portal berita interaktif bertema Jepang dengan fondasi akun, artikel, kontribusi user, review admin, quiz, polling/voting, poin, dan leaderboard.

MVP dibuat sederhana sebagai single app, tetapi struktur user, poin, leaderboard, dan aktivitas dibuat global-ready agar nanti bisa dikembangkan menjadi ekosistem multi-app bersama LMS Jepangku.

Keputusan final:

```txt id="clyhu2"
MVP App: News Portal
Admin: Dalam aplikasi yang sama
User Account: Akun Jepangku pusat
Auth: Lokal dulu, shared-ready
Poin: Global-ready, MVP source_app = news
Leaderboard: Global-ready, MVP weekly news leaderboard
Quiz News: Engagement, bukan progress LMS
Polling/Voting: Masuk area interaktif/quiz
LMS: Ditunda
Admin Pusat: Ditunda
```
