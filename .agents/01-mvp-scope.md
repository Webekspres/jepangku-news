# Dokumen Konsep Aplikasi Jepangku

> **Status:** Scope MVP single-app ini **sudah tercapai**. Dokumen tetap dipertahankan sebagai
> acuan batasan fitur MVP. Arah lanjutan (ekosistem multi-app + Core Service) ada di
> `.agents/05-ecosystem-strategy.md`, dan rencana pengerjaan berfase ada di
> `docs/development-roadmap.md`.

## 1. Ringkasan Produk

Jepangku adalah portal media interaktif bertema Jepang untuk pembaca Indonesia. Platform ini menyediakan berita, artikel ringan, quiz, polling, voting, leaderboard, dan sistem poin untuk meningkatkan interaksi pengguna.

Pada tahap jangka panjang, Jepangku direncanakan menjadi satu ekosistem digital yang memiliki beberapa aplikasi, yaitu portal berita, LMS belajar bahasa Jepang, website utama, dan admin dashboard. Namun untuk tahap MVP, pengembangan akan difokuskan terlebih dahulu pada portal berita sebagai single app.

MVP ini tetap disiapkan agar struktur user, auth, poin, dan leaderboard dapat dikembangkan menjadi sistem yang global-ready ketika nanti digabungkan dengan LMS Jepangku.

## 2. Visi Produk

Jepangku bertujuan menjadi platform digital bertema Jepang untuk pengguna Indonesia yang ingin membaca konten seputar budaya Jepang, anime, manga, lifestyle, event, edukasi, dan hiburan, sekaligus berinteraksi melalui fitur quiz, polling, voting, dan leaderboard.

Platform ini tidak hanya berfungsi sebagai portal berita pasif, tetapi juga sebagai media interaktif yang mendorong user untuk aktif membaca, mengikuti quiz, mengikuti polling, menyimpan artikel, dan membangun aktivitas melalui sistem poin.

## 3. Target Pengguna

Target pengguna utama Jepangku adalah:

1. Pengguna umum yang tertarik dengan budaya Jepang.
2. Penggemar anime, manga, pop culture, kuliner, travel, dan event Jepang.
3. Calon pengguna LMS Jepangku.
4. Pengguna yang ingin menikmati konten ringan, interaktif, dan informatif tentang Jepang.

Pada MVP, pengguna tidak wajib login untuk membaca artikel. Namun, login dibutuhkan jika pengguna ingin mendapatkan poin, menyimpan artikel, mengikuti quiz dengan pencatatan hasil, mengikuti polling/voting secara tercatat, dan masuk ke leaderboard.

## 4. Konsep Ekosistem Jangka Panjang

Pada tahap akhir, Jepangku akan diarahkan menjadi ekosistem multi-app dengan shared auth.

Struktur jangka panjang yang direncanakan:

```txt
jepangku.com          → Website utama / landing ekosistem Jepangku
news.jepangku.com     → Portal berita, artikel, quiz, polling, voting, leaderboard
learn.jepangku.com    → LMS belajar bahasa Jepang
admin.jepangku.com    → Admin dashboard pusat atau dashboard per aplikasi
```

Namun untuk MVP, sistem belum dipisahkan menjadi banyak aplikasi. MVP cukup dibuat sebagai single app portal berita.

Struktur MVP:

```txt
Jepangku News MVP
├── Public Portal
├── Auth
├── User Area
├── Admin Area
├── Article Management
├── Quiz / Polling / Voting
├── Point System
└── Leaderboard
```

## 5. Prinsip Arsitektur MVP

MVP Jepangku dibuat sederhana, tetapi tidak boleh menutup kemungkinan untuk dikembangkan menjadi multi-app.

Prinsip yang digunakan:

1. MVP dibuat sebagai single app.
2. Admin MVP berada di aplikasi yang sama.
3. User yang daftar di News dianggap sebagai user pusat Jepangku.
4. Auth dibuat lokal terlebih dahulu, tetapi struktur user disiapkan agar dapat menjadi shared auth.
5. Poin dibuat global-ready.
6. Leaderboard dibuat global-ready.
7. Quiz News dan Quiz LMS dianggap berbeda.
8. Belum ada admin pusat pada MVP.
9. Admin News hanya mengelola fitur News.
10. Admin LMS akan mengelola fitur LMS ketika LMS dikembangkan.

## 6. Auth dan Akun Pengguna

Pada MVP, sistem auth digunakan untuk register, login, logout, session, role access, dan pembatasan fitur berdasarkan user.

Konsep auth MVP:

```txt
Register/Login
↓
User masuk ke sistem
↓
Sistem menyimpan session/token
↓
User memiliki role
↓
Role menentukan akses halaman dan fitur
```

Role awal:

```txt
admin
user
```

User yang mendaftar melalui portal berita dianggap sebagai user Jepangku pusat. Artinya, ketika LMS dibuat di masa depan, akun yang sama dapat digunakan untuk mengakses LMS.

Untuk MVP, email verification ditunda. Namun struktur database tetap disiapkan agar email verification bisa ditambahkan di masa depan.

## 7. Role dan Hak Akses

### 7.1 User

User dapat:

1. Membaca artikel.
2. Submit artikel.
3. Melihat status artikel miliknya.
4. Mengedit ulang artikel yang ditolak.
5. Menghapus artikel miliknya jika masih belum published atau ingin membatalkan submit.
6. Mengikuti quiz.
7. Mengikuti polling/voting.
8. Mendapatkan poin dari aktivitas tertentu.
9. Menyimpan artikel/bookmark.
10. Melihat leaderboard.
11. Melihat riwayat aktivitas dan poin.

### 7.2 Admin

Admin dapat:

1. Mengelola artikel.
2. Melakukan review artikel dari user.
3. Approve artikel.
4. Reject artikel dengan catatan.
5. Mengelola kategori.
6. Mengelola tag.
7. Mengelola quiz.
8. Mengelola polling/voting.
9. Mengelola user.
10. Mengelola banner/homepage.
11. Melihat aktivitas user.
12. Melihat leaderboard.
13. Melihat statistik dasar portal.

Pada MVP belum ada super admin atau admin pusat.

## 8. Sumber Konten

Konten utama Jepangku berasal dari admin dan user.

Flow artikel user:

```txt
User login
↓
User submit artikel
↓
Artikel masuk status pending_review
↓
Admin review artikel
↓
Admin approve atau reject
↓
Jika approve, artikel tampil di portal
↓
Jika reject, user menerima catatan dan dapat edit ulang
```

API berita tidak menjadi fitur utama pada MVP. Jika memungkinkan, API hanya digunakan sebagai sumber data awal, referensi, atau dummy content. Jika tidak memungkinkan, data artikel dapat dibuat manual melalui seed/dummy data.

Konten dari API tidak boleh langsung menjadi fondasi utama karena ada batasan legalitas, lisensi, dan kontrol kualitas.

## 9. Legalitas Konten

Untuk MVP, konten artikel dapat menggunakan data dummy, artikel manual, atau referensi dari sumber eksternal yang ditulis ulang secara internal.

Jika menggunakan API berita, artikel tidak boleh langsung disalin penuh tanpa memperhatikan ketentuan dari penyedia API atau pemilik konten.

Pendekatan yang aman:

1. Gunakan artikel manual dari admin/user.
2. Gunakan API hanya untuk data awal atau referensi.
3. Jika menampilkan artikel dari API, tampilkan sumber asli.
4. Hindari copy-paste konten penuh dari media lain tanpa izin.
5. Untuk produksi, konten utama sebaiknya dikelola sendiri.

## 10. Identitas Visual

Jepangku menggunakan gaya visual bertema Jepang dengan warna utama merah, hitam, putih, dan off-white.

Arah visual:

1. Merah sebagai warna aksen utama.
2. Hitam sebagai warna kuat dan profesional.
3. Putih/off-white sebagai background utama agar nyaman dibaca.
4. Card tajam dan rapi.
5. Badge kategori yang jelas.
6. Garis tipis sebagai elemen visual.
7. Ornamen Jepang digunakan secukupnya.
8. Hindari terlalu banyak pattern, sakura, gradient berat, atau dekorasi berlebihan.

Referensi visual:

1. Japanese Station untuk nuansa portal media Jepang/pop culture.
2. Boombox untuk inspirasi fitur interaktif seperti quiz, polling, voting, dan engagement.

## 11. Modul Utama MVP

MVP Jepangku terdiri dari beberapa modul utama.

### 11.1 Modul Artikel / Berita

Fitur:

1. Homepage artikel.
2. Daftar artikel.
3. Detail artikel.
4. Kategori artikel.
5. Tag artikel.
6. Search artikel.
7. Related article.
8. Featured article.
9. Latest article.
10. Popular article.
11. Trending article.
12. Hot article.
13. Bookmark artikel.
14. Submit artikel oleh user.
15. Review artikel oleh admin.

### 11.2 Modul Quiz

Quiz di News bukan bagian dari progress LMS. Quiz News hanya berfungsi sebagai fitur engagement.

Ketentuan quiz MVP:

1. Quiz hanya pilihan ganda.
2. Setiap pertanyaan memiliki satu jawaban benar.
3. Hasil quiz langsung muncul setelah selesai.
4. Poin diberikan satu kali per quiz per user.
5. User boleh mengulang quiz untuk hiburan, tetapi poin hanya diberikan pada percobaan pertama.
6. Untuk MVP, opsi paling aman adalah user hanya boleh submit satu kali.

### 11.3 Modul Polling / Voting

Polling dan voting berada dalam area/menu quiz atau interactive content.

Polling digunakan untuk pertanyaan ringan yang tidak memiliki jawaban benar.

Contoh:

```txt
Anime musim ini paling kamu tunggu yang mana?
```

Voting digunakan untuk event interaktif yang lebih besar.

Contoh:

```txt
Karakter favorit minggu ini
Anime terbaik bulan ini
Artikel pilihan pembaca
```

Pada MVP, polling dan voting dapat menggunakan struktur teknis yang sama, hanya dibedakan dari tipe kontennya.

### 11.4 Modul Gamifikasi dan Poin

Poin digunakan untuk mendorong aktivitas user.

Aktivitas yang menghasilkan poin:

```txt
Membaca artikel sampai selesai: +2 poin
Mengikuti polling: +5 poin
Mengikuti quiz: +10 poin
Jawaban quiz benar: +5 poin tambahan
Login harian: +3 poin
Membagikan artikel: +5 poin
Bookmark artikel: +1 poin
```

Artikel yang dibuat oleh user belum menghasilkan poin pada MVP agar sistem tetap sederhana.

### 11.5 Modul Leaderboard

Leaderboard menampilkan user paling aktif berdasarkan poin.

Untuk MVP, leaderboard yang digunakan adalah weekly leaderboard.

Data yang ditampilkan:

1. Ranking.
2. Avatar.
3. Display name / username.
4. Total poin mingguan.
5. Badge/level jika tersedia.
6. Aktivitas terbanyak.

Leaderboard dibuat global-ready, tetapi pada MVP hanya menghitung aktivitas dari News.

### 11.6 Modul Admin

Admin area digunakan untuk mengelola seluruh kebutuhan News MVP.

Fitur admin:

1. Dashboard statistik dasar.
2. Review artikel user.
3. Manage artikel.
4. Manage kategori.
5. Manage tag.
6. Manage quiz.
7. Manage polling/voting.
8. Manage user.
9. Manage homepage/banner.
10. Monitor leaderboard.
11. Monitor point transaction.

## 12. Kategori Konten

Kategori utama:

```txt
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

Label sistem:

```txt
Latest
Trending
Hot
Popular
```

Latest, Trending, Hot, dan Popular bukan kategori manual, tetapi label/filter berdasarkan data atau pengaturan sistem.

Aturan awal:

1. Latest berdasarkan tanggal publish terbaru.
2. Popular berdasarkan total views.
3. Trending berdasarkan views dalam 7 hari terakhir.
4. Hot berdasarkan manual flag dari admin pada MVP.

Untuk masa depan, Hot dapat dihitung dari kombinasi views, bookmark, share, polling/voting activity, dan engagement lain.

## 13. Status Artikel

Artikel memiliki status berikut:

```txt
draft
pending_review
published
rejected
archived
```

Penjelasan:

1. Draft: artikel masih disimpan oleh user/admin dan belum diajukan.
2. Pending Review: artikel sudah diajukan dan menunggu review admin.
3. Published: artikel sudah disetujui dan tampil di portal.
4. Rejected: artikel ditolak admin dengan catatan.
5. Archived: artikel diarsipkan dan tidak tampil di portal.

Flow status artikel:

```txt
Draft
↓
Pending Review
↓
Published / Rejected
↓
Jika Rejected, user dapat edit ulang dan submit kembali
```

## 14. Sistem Anti-Spam Poin

Agar sistem poin tidak mudah dimanipulasi, MVP perlu memiliki aturan anti-spam.

Aturan:

1. Membaca artikel hanya dapat poin satu kali per artikel.
2. Polling hanya dapat poin satu kali per polling.
3. Quiz hanya dapat poin satu kali per quiz.
4. Bookmark hanya dapat poin pada bookmark pertama.
5. Jika user menghapus bookmark lalu bookmark ulang, poin tidak diberikan lagi.
6. Login harian hanya dihitung satu kali per hari.
7. Share artikel perlu dibatasi agar tidak bisa spam poin.
8. Guest dapat membaca dan mencoba polling/quiz, tetapi tidak mendapat poin.

## 15. Halaman User

Halaman public/user pada MVP:

```txt
/
/articles
/articles/[slug]
/categories/[slug]
/search
/quiz
/quiz/[slug]
/polling
/leaderboard
/login
/register
/profile
/profile/articles
/profile/bookmarks
/profile/activity
/profile/points
/submit-article
```

Prioritas halaman MVP:

1. Homepage.
2. Daftar artikel.
3. Detail artikel.
4. Quiz list.
5. Quiz detail.
6. Polling/voting.
7. Leaderboard.
8. Login/register.
9. Profile sederhana.
10. Submit artikel.

## 16. Halaman Admin

Halaman admin pada MVP:

```txt
/admin
/admin/articles
/admin/articles/review
/admin/articles/create
/admin/articles/[id]/edit
/admin/categories
/admin/tags
/admin/quiz
/admin/quiz/create
/admin/polling
/admin/users
/admin/leaderboard
/admin/settings
```

Prioritas admin MVP:

1. Dashboard.
2. Review artikel.
3. Manage artikel.
4. Manage kategori.
5. Manage quiz.
6. Manage polling/voting.
7. Manage user.
8. Manage homepage/banner.

## 17. Homepage MVP

Homepage Jepangku perlu menampilkan kombinasi artikel dan fitur interaktif.

Struktur homepage:

1. Hero featured article.
2. Latest articles.
3. Trending/Popular articles.
4. Active polling.
5. Quiz terbaru.
6. Weekly leaderboard.
7. Kategori artikel.
8. Artikel pilihan admin.

Homepage tidak hanya fokus pada artikel, tetapi juga memperlihatkan aktivitas interaktif agar Jepangku terasa lebih hidup.

## 18. Struktur Data Konseptual

Data utama yang perlu disiapkan:

```txt
users
roles
articles
article_categories
categories
tags
article_tags
article_views
bookmarks
quizzes
quiz_questions
quiz_answers
quiz_attempts
polls
poll_options
poll_votes
point_transactions
activity_logs
admin_settings
```

Karena MVP disiapkan global-ready, beberapa tabel dapat memiliki field:

```txt
source_app
```

Contoh nilai:

```txt
news
learn
system
```

Pada MVP, sebagian besar data menggunakan:

```txt
source_app = news
```

## 19. Struktur Poin Global-Ready

Tabel poin sebaiknya menggunakan konsep transaksi poin.

Contoh struktur:

```txt
point_transactions
- id
- user_id
- source_app
- activity_type
- source_type
- source_id
- points
- metadata
- created_at
```

Contoh data dari News:

```txt
source_app: news
activity_type: article_read
source_type: article
source_id: 12
points: 2
```

Contoh data dari LMS di masa depan:

```txt
source_app: learn
activity_type: lesson_completed
source_type: lesson
source_id: 44
points: 20
```

Dengan struktur ini, MVP hanya memakai News, tetapi sistem sudah siap dipakai LMS.

## 20. Struktur Leaderboard Global-Ready

Leaderboard tidak harus disimpan sebagai tabel utama. Leaderboard dapat dihitung dari transaksi poin.

Filter leaderboard:

```txt
source_app = news       → leaderboard portal berita
source_app = learn      → leaderboard LMS
source_app = all        → leaderboard global Jepangku
periode = weekly/monthly/all_time
```

Pada MVP:

```txt
source_app = news
periode = weekly
```

## 21. Scope MVP

Fitur yang masuk MVP:

1. Auth register/login/logout.
2. Role user/admin.
3. Homepage portal berita.
4. Artikel dari admin.
5. Submit artikel oleh user.
6. Review artikel oleh admin.
7. Kategori artikel.
8. Tag artikel.
9. Detail artikel.
10. Search sederhana.
11. Bookmark artikel.
12. Quiz pilihan ganda.
13. Polling/voting sederhana.
14. Sistem poin.
15. Weekly leaderboard.
16. Profile user sederhana.
17. Riwayat poin.
18. Admin dashboard dasar.

## 22. Fitur yang Ditunda

Fitur yang tidak masuk MVP:

1. Komentar artikel.
2. Email verification.
3. Admin pusat.
4. Multi-app deployment.
5. Shared auth service terpisah.
6. LMS.
7. Permission kompleks.
8. Role editor/author/moderator.
9. Badge kompleks.
10. Notification system.
11. Advanced recommendation.
12. AI content recommendation.
13. API import artikel otomatis.
14. Monetization.
15. Mobile app.

## 23. Risiko Produk

Beberapa risiko yang perlu diperhatikan:

1. Scope terlalu besar jika semua fitur langsung dibuat detail.
2. Sistem poin bisa dimanipulasi jika anti-spam tidak disiapkan.
3. Konten user perlu review agar kualitas portal tetap terjaga.
4. Jika struktur user terlalu spesifik ke News, integrasi LMS nanti akan sulit.
5. Jika API berita dijadikan sumber utama, bisa terkendala lisensi, limit, dan kualitas konten.
6. Jika admin dashboard terlalu kompleks di awal, MVP akan lambat selesai.
7. Jika quiz, polling, dan voting dibuat terlalu berbeda secara teknis, pengembangan bisa membengkak.

## 24. Rekomendasi Pengembangan Bertahap

### Phase 1 — Core News MVP

Fokus:

1. Auth.
2. Artikel.
3. Kategori.
4. Submit artikel.
5. Review artikel.
6. Homepage.
7. Admin dashboard dasar.

### Phase 2 — Engagement Feature

Fokus:

1. Quiz.
2. Polling/voting.
3. Bookmark.
4. Point transaction.
5. Weekly leaderboard.

### Phase 3 — Polish dan Global-Ready

Fokus:

1. Activity log.
2. Profile user.
3. Anti-spam poin.
4. Homepage refinement.
5. Struktur `source_app`.
6. Persiapan integrasi LMS.

### Phase 4 — Future Ecosystem

Fokus:

1. LMS Jepangku.
2. Shared auth.
3. Admin pusat.
4. Global leaderboard.
5. Multi-app deployment.
6. Subdomain production.

## 25. Kesimpulan

MVP Jepangku akan dibuat sebagai portal berita interaktif bertema Jepang dalam bentuk single app. Walaupun MVP masih sederhana, struktur user, auth, poin, quiz, dan leaderboard akan dibuat global-ready agar dapat dikembangkan menjadi ekosistem Jepangku yang lebih besar.

Keputusan utama MVP:

```txt
MVP = News Portal Single App
Auth = Lokal dulu, shared-ready
User = Akun Jepangku pusat
Admin = Admin News dalam aplikasi yang sama
Poin = Global-ready, MVP hanya News
Leaderboard = Global-ready, MVP hanya Weekly News
Quiz = Engagement, bukan progress LMS
LMS = Ditunda untuk tahap berikutnya
```

Dengan pendekatan ini, Jepangku bisa dikembangkan cepat untuk MVP tanpa mengunci sistem ke struktur yang sulit diperluas.
