# Arah Pengembangan Project Jepangku

> **⚠️ Spesifikasi teknis integrasi Core (v2):** Jangan implementasi API/schema dari bagian **8–12**
> dokumen ini tanpa membaca pemetaan v1→v2. Kontrak canonical:
>
> - [`docs/ecosystem-integration.md`](../docs/ecosystem-integration.md) — cutover Portal Berita
> - [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md) — ekosistem 3 app
> - [`jepangku-core/docs/API.md`](../../jepangku-core/docs/API.md) — endpoint HTTP
>
> Bagian **1–7** dan **13–15** tetap valid sebagai **visi produk**. Bagian **8–12** mendeskripsikan
> desain **v1** (`core_*`, `GET /me`, `POST /points/earn`) — digantikan oleh schema v2 di repo Core
> (`users.id` = Clerk ID, `POST /api/v1/gamification/award`).

> **Dokumen arah utama** untuk fase pasca-MVP. Rencana pengerjaan berfase (Fase 0–E) ada di
> `docs/development-roadmap.md`. Konteks: `.agents/01-mvp-scope.md` (scope MVP),
> `.agents/03-database-erd.md` (schema portal saat ini), `.agents/04-project-steering.md` (prioritas).

## 1. Gambaran Umum Project Jepangku

Jepangku adalah platform digital bertema Jepang yang dikembangkan sebagai ekosistem aplikasi, bukan hanya sebagai satu portal berita biasa. Pada tahap saat ini, Jepangku telah memiliki fondasi utama sebagai portal berita dengan fitur manajemen konten, interaksi pengguna, quiz, polling/voting, bookmark, sistem poin, file upload, serta workflow editorial seperti review artikel dan revisi artikel.

Secara arah produk, Jepangku tidak hanya berfungsi sebagai tempat membaca artikel, tetapi juga mulai diarahkan menjadi platform yang memiliki engagement system. Pengguna tidak hanya membaca konten, tetapi juga dapat melakukan aktivitas seperti menyimpan artikel, mengikuti quiz, melakukan voting atau polling, membagikan artikel, dan mendapatkan poin dari aktivitas tertentu.

Ke depannya, Jepangku akan dikembangkan menjadi ekosistem yang terdiri dari beberapa aplikasi berbeda. Dua aplikasi utama yang menjadi fokus adalah:

```txt
jepangku.com
- Portal berita dan konten Jepang

kursus.jepangku.com
- LMS / platform pembelajaran Jepangku
```

Kedua aplikasi tersebut akan berjalan sebagai aplikasi yang berbeda, tetapi tetap berada dalam satu ekosistem Jepangku. Oleh karena itu, beberapa data penting seperti user, profil, role, poin, badge, membership, notification, dan file global perlu dikelola secara terpusat agar dapat digunakan oleh banyak aplikasi.

## 2. Kondisi Schema Jepangku Saat Ini

Pada schema portal berita saat ini, aplikasi masih menggunakan pendekatan monolitik dari sisi database. Artinya, semua kebutuhan utama portal berita disimpan dalam satu schema yang sama.

Schema saat ini sudah mencakup beberapa domain utama:

```txt
User Management
- User
- UserProfile

Content Management
- Category
- Tag
- Article
- ArticleTag
- ArticleReview
- ArticleRevision

User Interaction
- Bookmark
- ArticleShare

Quiz System
- Quiz
- QuizQuestion
- QuizOption
- QuizAttempt
- QuizAttemptAnswer

Poll & Voting System
- Poll
- PollQuestion
- PollOption
- PollVote

Gamification
- PointTransaction
- DailyLoginReward

File Management
- File
```

Struktur ini sudah cukup kuat untuk sebuah portal berita interaktif. Di dalam schema tersebut, model `User` menjadi pusat utama dari banyak relasi. User dapat membuat artikel, menyimpan bookmark, mengikuti quiz, melakukan voting, mendapatkan poin, menerima daily login reward, mengunggah file, melakukan share artikel, mengedit artikel, membuat revisi artikel, dan melakukan review artikel.

Namun, ketika Jepangku mulai berkembang menjadi lebih dari satu aplikasi, pendekatan ini mulai memiliki risiko. Jika LMS juga membutuhkan user, poin, badge, membership, dan notification yang sama, maka data tersebut tidak ideal jika hanya berada di database portal berita.

## 3. Masalah Jika Portal dan LMS Berjalan Sendiri-sendiri

Jika portal berita dan LMS dikembangkan sebagai aplikasi berbeda dengan database dan sistem user masing-masing, maka akan muncul beberapa masalah.

Pertama, user bisa terduplikasi. Satu orang mungkin memiliki akun di portal berita dan akun berbeda di LMS, padahal secara produk seharusnya dia adalah user Jepangku yang sama.

Kedua, sistem poin menjadi tidak konsisten. Jika user mendapatkan poin dari membaca artikel di portal berita, lalu mendapatkan poin dari menyelesaikan lesson di LMS, kedua poin tersebut harus digabung dalam satu sistem poin global. Jika poin disimpan di database masing-masing aplikasi, maka akan sulit membuat leaderboard global, badge global, atau sistem reward lintas aplikasi.

Ketiga, role dan permission menjadi sulit dikontrol. Satu user bisa menjadi editor di portal berita dan instructor di LMS. Jika role disimpan terpisah, maka manajemen akses akan menjadi lebih rumit.

Keempat, notifikasi, membership, pembayaran, badge, dan file global juga akan menjadi tersebar. Hal ini dapat menyebabkan duplikasi logic, duplikasi data, serta risiko data tidak sinkron antar aplikasi.

Karena itu, Jepangku membutuhkan satu layanan pusat yang mengelola data bersama lintas aplikasi.

## 4. Arah Baru: Shared Core Service

Arah pengembangan Jepangku saat ini adalah memisahkan data shared/global ke dalam layanan khusus bernama **Jepangku Core Service**.

Jepangku Core Service adalah aplikasi backend khusus yang bertugas mengelola data yang digunakan oleh banyak aplikasi dalam ekosistem Jepangku. Core service tidak bertugas mengelola artikel atau course secara langsung. Core service hanya mengelola data yang sifatnya lintas aplikasi.

Arsitektur yang dituju adalah:

```txt
Clerk
- Authentication
- Session
- OAuth
- Email verification
- MFA

Jepangku Core Service
- User global
- Profile global
- Role & permission global
- Poin global
- Badge
- Membership
- Payment global
- Notification
- File global
- Activity log

Jepangku Portal
- Artikel
- Kategori
- Tag
- Bookmark
- Share artikel
- Quiz berita
- Polling / voting
- Review artikel
- Revisi artikel

Jepangku LMS
- Course
- Section
- Lesson
- Enrollment
- Progress belajar
- Quiz course
- Certificate
```

Dengan pendekatan ini, portal berita dan LMS dapat memiliki schema masing-masing sesuai domain aplikasinya, tetapi tetap menggunakan user dan poin yang sama melalui Core Service.

## 5. Peran Clerk dalam Arsitektur Jepangku

Clerk digunakan sebagai layanan authentication. Artinya, Clerk bertugas mengelola proses login, register, session, OAuth login, email verification, password, MFA, dan identitas authentication user.

Namun, Clerk tidak menjadi tempat penyimpanan semua data bisnis aplikasi. Data seperti poin, role internal, badge, membership, bookmark, progress LMS, quiz attempt, dan aktivitas user tetap disimpan di database milik Jepangku.

Dengan Clerk, field seperti `password_hash` tidak perlu lagi disimpan di database Jepangku. Password dan mekanisme login akan dikelola oleh Clerk. Database Jepangku hanya perlu menyimpan `clerk_id` sebagai penghubung antara user di Clerk dan user global di Jepangku Core.

Contoh konsep user:

```txt
Clerk User
- id: user_xxxxx
- email
- authentication provider
- session
- verification

Core User Jepangku
- id: uuid internal Jepangku
- clerk_id: user_xxxxx
- email
- username
- name
- avatar_url
- role
- status
- total_points
```

Aplikasi portal dan LMS tidak perlu mengenal password user. Keduanya cukup menerima session dari Clerk, lalu memanggil Core Service untuk mendapatkan data user global berdasarkan token Clerk.

## 6. Konsep User Global

Dalam arsitektur baru, user tidak lagi dianggap sebagai milik portal berita. User adalah milik Jepangku Core.

Portal berita dan LMS cukup menyimpan referensi berupa:

```txt
core_user_id
```

Contohnya, pada portal berita:

```txt
articles.author_core_user_id
bookmarks.core_user_id
quiz_attempts.core_user_id
poll_votes.core_user_id
article_reviews.reviewer_core_user_id
```

Pada LMS:

```txt
courses.instructor_core_user_id
course_enrollments.core_user_id
lesson_progress.core_user_id
course_quiz_attempts.core_user_id
certificates.core_user_id
```

Dengan cara ini, semua aplikasi tetap mengacu ke user yang sama tanpa harus menyimpan tabel user lengkap di setiap aplikasi.

## 7. Konsep Poin Global

Salah satu kebutuhan utama Jepangku adalah sistem poin yang berlaku secara global. Artinya, poin dari portal berita dan poin dari LMS harus masuk ke saldo yang sama.

Contoh aktivitas yang menghasilkan poin dari portal berita:

```txt
Membaca artikel
Membagikan artikel
Bookmark artikel
Mengikuti quiz berita
Vote polling
Login harian
```

Contoh aktivitas yang menghasilkan poin dari LMS:

```txt
Menyelesaikan lesson
Menyelesaikan course
Mengikuti quiz course
Mendapat nilai tinggi
Mendapat certificate
Login harian
```

Semua aktivitas tersebut tidak boleh menghasilkan saldo poin yang terpisah. Karena itu, transaksi poin harus disimpan di Core Service melalui tabel `core_point_transactions`.

Aplikasi portal dan LMS tidak langsung mengubah saldo poin di database masing-masing. Keduanya harus memanggil Core API, misalnya:

```txt
POST /points/earn
POST /points/spend
GET /points/me
GET /leaderboard
```

Dengan pendekatan ini, Core Service menjadi satu-satunya sumber kebenaran untuk poin user.

## 8. Tabel yang Disimpan di Jepangku Core Service

Berikut adalah tabel yang direkomendasikan untuk disimpan di Jepangku Core Service.

### 8.1 `core_users`

Menyimpan data user global Jepangku.

```txt
core_users
- id
- clerk_id
- email
- username
- name
- avatar_url
- status
- total_points
- username_changed_at
- last_login_at
- created_at
- updated_at
```

Tabel ini menjadi pusat identitas user di seluruh aplikasi Jepangku. Portal berita dan LMS akan menggunakan `core_user_id` dari tabel ini.

### 8.2 `core_user_profiles`

Menyimpan profil tambahan user.

```txt
core_user_profiles
- id
- user_id
- display_name
- bio
- headline
- phone
- country
- city
- website_url
- social_links
- created_at
- updated_at
```

Profil ini dapat digunakan oleh portal berita, LMS, dan aplikasi Jepangku lain di masa depan.

### 8.3 `core_roles`

Menyimpan daftar role global.

```txt
core_roles
- id
- code
- name
- description
- created_at
- updated_at
```

Contoh role:

```txt
USER
ADMIN
EDITOR
INSTRUCTOR
MODERATOR
SUPER_ADMIN
```

### 8.4 `core_permissions`

Menyimpan daftar permission granular.

```txt
core_permissions
- id
- code
- name
- description
- created_at
- updated_at
```

Contoh permission:

```txt
article.create
article.review
article.publish
course.create
course.publish
user.ban
points.adjust
membership.manage
```

### 8.5 `core_role_permissions`

Menyimpan relasi antara role dan permission.

```txt
core_role_permissions
- id
- role_id
- permission_id
- created_at
```

Tabel ini digunakan untuk menentukan permission apa saja yang dimiliki oleh sebuah role.

### 8.6 `core_user_roles`

Menyimpan role yang dimiliki oleh user.

```txt
core_user_roles
- id
- user_id
- role_id
- source_app
- created_at
- updated_at
```

Dengan tabel ini, satu user dapat memiliki role berbeda di aplikasi berbeda.

Contoh:

```txt
User A
- EDITOR di NEWS
- INSTRUCTOR di LMS
```

### 8.7 `core_point_transactions`

Menyimpan semua transaksi poin global.

```txt
core_point_transactions
- id
- user_id
- source_app
- activity_type
- source_type
- source_id
- points
- description
- metadata
- occurred_at
- created_at
```

Contoh transaksi:

```txt
source_app: NEWS
activity_type: ARTICLE_SHARE
source_type: ARTICLE
source_id: article_id
points: 5
```

```txt
source_app: LMS
activity_type: LESSON_COMPLETED
source_type: LESSON
source_id: lesson_id
points: 20
```

Tabel ini menjadi sumber kebenaran utama untuk riwayat poin.

### 8.8 `core_point_balances`

Menyimpan saldo poin terkini untuk akses cepat.

```txt
core_point_balances
- id
- user_id
- total_earned
- total_spent
- current_balance
- updated_at
```

Tabel ini berguna untuk leaderboard, dashboard user, dan tampilan saldo poin tanpa harus selalu menghitung ulang seluruh transaksi.

### 8.9 `core_point_rules`

Menyimpan aturan pemberian poin.

```txt
core_point_rules
- id
- source_app
- activity_type
- source_type
- points
- max_per_day
- max_per_source
- cooldown_seconds
- is_active
- created_at
- updated_at
```

Dengan tabel ini, aturan poin tidak perlu di-hardcode di portal atau LMS.

### 8.10 `core_daily_login_rewards`

Menyimpan reward login harian.

```txt
core_daily_login_rewards
- id
- user_id
- reward_date
- points_awarded
- point_transaction_id
- source_app
- created_at
```

Jika reward login bersifat global, maka user hanya boleh mendapatkan reward satu kali per hari, meskipun login dari portal berita dan LMS.

### 8.11 `core_badges`

Menyimpan master badge atau achievement.

```txt
core_badges
- id
- code
- name
- description
- icon_url
- source_app
- requirement_type
- requirement_value
- is_active
- created_at
- updated_at
```

Badge dapat berasal dari portal berita, LMS, atau aktivitas global.

### 8.12 `core_user_badges`

Menyimpan badge yang telah diperoleh user.

```txt
core_user_badges
- id
- user_id
- badge_id
- source_app
- earned_at
- created_at
```

### 8.13 `core_notifications`

Menyimpan notifikasi global untuk user.

```txt
core_notifications
- id
- user_id
- source_app
- type
- title
- message
- action_url
- metadata
- read_at
- created_at
```

Notifikasi ini dapat digunakan untuk informasi seperti artikel disetujui, course selesai, poin bertambah, badge diperoleh, atau membership aktif.

### 8.14 `core_membership_plans`

Menyimpan daftar plan membership.

```txt
core_membership_plans
- id
- code
- name
- description
- price
- currency
- duration_days
- features
- is_active
- created_at
- updated_at
```

Contoh plan:

```txt
FREE
PREMIUM
STUDENT
PRO
```

### 8.15 `core_memberships`

Menyimpan membership user.

```txt
core_memberships
- id
- user_id
- plan_id
- status
- started_at
- ended_at
- cancelled_at
- created_at
- updated_at
```

Membership disimpan di core karena akses premium dapat berlaku di portal berita dan LMS.

### 8.16 `core_subscriptions`

Menyimpan data subscription jika membership menggunakan sistem langganan.

```txt
core_subscriptions
- id
- user_id
- membership_id
- provider
- provider_customer_id
- provider_subscription_id
- status
- current_period_start
- current_period_end
- created_at
- updated_at
```

### 8.17 `core_payments`

Menyimpan pembayaran global.

```txt
core_payments
- id
- user_id
- provider
- provider_invoice_id
- source_app
- source_type
- source_id
- amount
- currency
- status
- paid_at
- expired_at
- created_at
- updated_at
```

Pembayaran bisa berasal dari pembelian course, membership, atau fitur premium lain.

### 8.18 `core_files`

Menyimpan file global.

```txt
core_files
- id
- user_id
- source_app
- usage_type
- storage_provider
- storage_path
- public_url
- original_filename
- content_type
- size
- metadata
- is_deleted
- created_at
- updated_at
```

File yang bersifat global seperti avatar, sertifikat, atau attachment lintas aplikasi sebaiknya disimpan melalui Core Service.

### 8.19 `core_user_settings`

Menyimpan preferensi user global.

```txt
core_user_settings
- id
- user_id
- language
- theme
- email_notification_enabled
- push_notification_enabled
- created_at
- updated_at
```

### 8.20 `core_auth_logs`

Menyimpan log authentication dan aktivitas keamanan.

```txt
core_auth_logs
- id
- user_id
- clerk_id
- event_type
- ip_address
- user_agent
- source_app
- created_at
```

### 8.21 `core_activity_logs`

Menyimpan audit log global.

```txt
core_activity_logs
- id
- actor_user_id
- target_user_id
- source_app
- action
- entity_type
- entity_id
- metadata
- created_at
```

Audit log penting untuk aktivitas admin seperti mengubah role, banned user, adjustment poin, atau mengaktifkan membership manual.

## 9. Tabel yang Tetap Ada di Portal Berita

Setelah data shared dipindahkan ke Core Service, portal berita tetap memiliki tabel domain berita. Tabel-tabel ini tidak perlu dipindahkan ke Core karena sifatnya spesifik untuk aplikasi portal berita.

Tabel portal berita:

```txt
categories
tags
articles
article_tags
article_reviews
article_revisions
bookmarks
article_shares
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
polls
poll_questions
poll_options
poll_votes
```

Namun, semua relasi yang sebelumnya mengarah ke `users` perlu diubah menjadi `core_user_id`.

Contoh perubahan:

```txt
author_id
menjadi:
author_core_user_id
```

```txt
user_id
menjadi:
core_user_id
```

```txt
reviewer_id
menjadi:
reviewer_core_user_id
```

```txt
editor_id
menjadi:
editor_core_user_id
```

## 10. Struktur Portal Berita Setelah Dipisah dari Core

### 10.1 `categories`

Menyimpan kategori artikel.

```txt
categories
- id
- name
- slug
- description
- icon_url
- color
- is_active
- sort_order
- created_at
- updated_at
```

### 10.2 `tags`

Menyimpan tag artikel.

```txt
tags
- id
- source_app
- name
- slug
- created_at
```

### 10.3 `articles`

Menyimpan artikel portal berita.

```txt
articles
- id
- source_app
- author_core_user_id
- category_id
- title
- slug
- excerpt
- content
- cover_image_url
- status
- visibility
- is_featured
- is_hot
- published_at
- view_count
- weekly_view_count
- bookmark_count
- share_count
- created_at
- updated_at
- last_edited_by_core_user_id
- last_edited_at
```

### 10.4 `article_tags`

Menyimpan relasi artikel dan tag.

```txt
article_tags
- id
- article_id
- tag_id
- created_at
```

### 10.5 `article_reviews`

Menyimpan riwayat review artikel.

```txt
article_reviews
- id
- article_id
- reviewer_core_user_id
- previous_status
- new_status
- note
- reviewed_at
- created_at
```

### 10.6 `article_revisions`

Menyimpan revisi artikel.

```txt
article_revisions
- id
- article_id
- revision_number
- editor_core_user_id
- change_note
- title
- excerpt
- content
- cover_image_url
- category_id
- status
- created_at
```

### 10.7 `bookmarks`

Menyimpan artikel yang disimpan user.

```txt
bookmarks
- id
- core_user_id
- article_id
- first_bookmarked_at
- deleted_at
- created_at
- updated_at
```

### 10.8 `article_shares`

Menyimpan aktivitas share artikel.

```txt
article_shares
- id
- core_user_id
- article_id
- share_method
- points_awarded
- is_point_awarded
- point_transaction_id
- shared_at
- created_at
```

`point_transaction_id` mengarah ke transaksi poin yang dibuat di Core Service.

### 10.9 `quizzes`

Menyimpan quiz berita.

```txt
quizzes
- id
- source_app
- created_by_core_user_id
- title
- slug
- description
- thumbnail_url
- quiz_type
- status
- points_reward
- correct_answer_points
- allow_retry
- show_result_immediately
- created_at
- updated_at
```

### 10.10 `quiz_questions`

Menyimpan pertanyaan quiz.

```txt
quiz_questions
- id
- quiz_id
- question_text
- image_url
- sort_order
- created_at
- updated_at
```

### 10.11 `quiz_options`

Menyimpan pilihan jawaban quiz.

```txt
quiz_options
- id
- question_id
- option_text
- image_url
- is_correct
- sort_order
- created_at
- updated_at
```

### 10.12 `quiz_attempts`

Menyimpan percobaan user saat mengerjakan quiz.

```txt
quiz_attempts
- id
- quiz_id
- core_user_id
- score
- total_questions
- correct_answers
- points_awarded
- is_point_awarded
- point_transaction_id
- started_at
- submitted_at
- created_at
```

### 10.13 `quiz_attempt_answers`

Menyimpan jawaban user pada quiz attempt.

```txt
quiz_attempt_answers
- id
- attempt_id
- question_id
- selected_option_id
- is_correct
- created_at
```

### 10.14 `polls`

Menyimpan polling atau voting.

```txt
polls
- id
- source_app
- created_by_core_user_id
- title
- slug
- description
- poll_type
- status
- thumbnail_url
- points_reward
- allow_guest_vote
- show_result_before_vote
- created_at
- updated_at
```

### 10.15 `poll_questions`

Menyimpan pertanyaan polling.

```txt
poll_questions
- id
- poll_id
- question_text
- image_url
- sort_order
- created_at
- updated_at
```

### 10.16 `poll_options`

Menyimpan opsi polling.

```txt
poll_options
- id
- question_id
- option_text
- image_url
- vote_count
- sort_order
- created_at
- updated_at
```

### 10.17 `poll_votes`

Menyimpan vote user.

```txt
poll_votes
- id
- poll_id
- question_id
- option_id
- core_user_id
- points_awarded
- is_point_awarded
- point_transaction_id
- voted_at
- created_at
```

## 11. Tabel yang Dihapus dari Portal Berita

Setelah Shared Core Service diterapkan, tabel berikut tidak lagi menjadi milik portal berita:

```txt
users
user_profiles
point_transactions
daily_login_rewards
files
```

Tabel tersebut dipindahkan menjadi:

```txt
core_users
core_user_profiles
core_point_transactions
core_daily_login_rewards
core_files
```

Portal berita tidak lagi menjadi pemilik data user dan poin. Portal hanya menjadi consumer dari data user dan poin melalui Core API.

## 12. Cara Portal Berita Menggunakan Core Service

Saat user membuka portal berita, alurnya adalah:

```txt
1. User login melalui Clerk.
2. Portal mendapatkan session/token Clerk.
3. Portal memanggil Core API: GET /me.
4. Core API memverifikasi token Clerk.
5. Core API mencari user berdasarkan clerk_id.
6. Jika user belum ada, Core API membuat core user baru.
7. Core API mengembalikan core_user_id, username, role, permission, avatar, dan total_points.
8. Portal menggunakan core_user_id untuk aktivitas artikel, bookmark, quiz, polling, dan share.
```

Saat user mendapatkan poin dari portal berita:

```txt
1. User melakukan aktivitas di portal, misalnya share artikel.
2. Portal menyimpan data share di database portal.
3. Portal memanggil Core API: POST /points/earn.
4. Core API mengecek aturan poin.
5. Core API membuat core_point_transactions.
6. Core API memperbarui core_point_balances.
7. Core API mengembalikan total poin terbaru.
```

## 13. Cara LMS Menggunakan Core Service

Saat user membuka LMS, alurnya sama:

```txt
1. User login melalui Clerk.
2. LMS mendapatkan session/token Clerk.
3. LMS memanggil Core API: GET /me.
4. Core API memverifikasi token Clerk.
5. Core API mengembalikan core_user_id.
6. LMS menggunakan core_user_id untuk enrollment, progress, quiz, dan certificate.
```

Saat user mendapatkan poin dari LMS:

```txt
1. User menyelesaikan lesson.
2. LMS menyimpan lesson progress di database LMS.
3. LMS memanggil Core API: POST /points/earn.
4. Core API membuat transaksi poin dengan source_app = LMS.
5. Core API memperbarui saldo poin global.
```

## 14. Alasan Desain Ini Lebih Cocok untuk Tahap Lanjutan

Desain Shared Core Service lebih cocok untuk tahap lanjutan karena Jepangku tidak lagi dianggap sebagai satu aplikasi tunggal. Jepangku mulai menjadi ekosistem aplikasi.

Keuntungan pendekatan ini:

```txt
User tetap satu di semua aplikasi.
Poin tetap global.
Role dan permission lebih mudah dikontrol.
Portal dan LMS dapat berkembang dengan schema masing-masing.
Migration portal dan LMS tidak saling bertabrakan.
Membership dapat berlaku lintas aplikasi.
Badge dan leaderboard bisa bersifat global.
Notifikasi bisa digunakan oleh banyak aplikasi.
Lebih siap jika nanti ada mobile app, forum, atau admin center terpisah.
```

Konsekuensinya, sistem menjadi lebih kompleks karena membutuhkan satu service tambahan. Namun, untuk tahap lanjutan, kompleksitas ini dapat diterima karena memberikan batas tanggung jawab yang lebih jelas.

## 15. Prinsip Pemisahan Data

Prinsip utama pemisahan data Jepangku adalah:

```txt
Jika data digunakan oleh banyak aplikasi, simpan di Core Service.
Jika data hanya milik portal berita, simpan di Portal Database.
Jika data hanya milik LMS, simpan di LMS Database.
```

Contoh data shared:

```txt
User
Profile
Role
Permission
Point
Badge
Membership
Notification
Payment
File global
Audit log
```

Contoh data portal:

```txt
Article
Category
Tag
Bookmark
Article share
News quiz
Polling
Voting
Article review
Article revision
```

Contoh data LMS:

```txt
Course
Section
Lesson
Enrollment
Lesson progress
Course quiz
Certificate
```

## 16. Kesimpulan Arah Project

Arah Jepangku saat ini adalah berubah dari portal berita interaktif menjadi ekosistem platform yang terdiri dari beberapa aplikasi. Portal berita tetap menjadi aplikasi konten utama, sedangkan LMS menjadi aplikasi pembelajaran yang berjalan di subdomain terpisah.

Karena kedua aplikasi membutuhkan user dan poin yang sama, maka data shared tidak boleh lagi diletakkan hanya di portal berita. Data shared harus dikelola oleh Jepangku Core Service.

Dengan arsitektur ini, Jepangku memiliki fondasi yang lebih kuat untuk berkembang menjadi platform yang lebih besar, modular, dan scalable. Portal berita dapat fokus pada konten dan interaksi pembaca, LMS dapat fokus pada pembelajaran dan progress user, sedangkan Core Service bertugas menjaga konsistensi identity, poin, role, membership, badge, notification, dan data global lainnya di seluruh ekosistem Jepangku.
