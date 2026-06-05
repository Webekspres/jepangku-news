# 📈 Steering Document

Dokumen ini mengarahkan jalannya proyek agar tetap sesuai dengan arah ekosistem dan prioritas saat ini.

> **Status:** MVP portal berita sudah tercapai. Arah berikutnya adalah ekosistem multi-app
> (lihat `.agents/05-ecosystem-strategy.md`). Rencana pengerjaan berfase ada di
> `docs/development-roadmap.md`.

## 1. Tujuan Utama

Mengembangkan **Jepangku** dari portal berita single-app menjadi **ekosistem platform** bertema
Jepang untuk audiens Indonesia. Tahap saat ini berfokus pada:
- Stabilitas dan kelengkapan portal berita (siap rilis publik)
- Artikel dan konten interaktif
- Gamifikasi (poin, leaderboard) yang global-ready
- Review dan moderation oleh admin
- Persiapan transisi ke Jepangku Core Service + Clerk

## 2. Prioritas Saat Ini

### Utama — Fase A (Stabilkan Portal)
- Hardening keamanan: sanitasi HTML, rate limiting, image moderation, logging, monitoring
- Engagement domain portal: komentar, reaction/like artikel
- Profil publik author + statistik penulis
- Search & discovery: dedicated search page, trending, related/popular tags
- Analytics konten: view analytics artikel, content performance, statistik kategori/quiz/poll
- Soft launch: konten artikel + 9 halaman statis

### Ditunda — menunggu Core Service
- Auth lanjutan (email verification, OAuth, session) → **Clerk**
- Variasi leaderboard, badge, export poin, activity log, notifikasi → **Core Service**

### Masa Depan
- Jepangku Core Service (user/poin/role/badge/membership global)
- LMS `kursus.jepangku.com`
- Ekosistem `news`, `learn`, `admin`, `landing`
- Self-hosted VPS / multi-app deployment after org migration

## 3. Deployment & Development Roadmap

Detail checklist per fase ada di `docs/development-roadmap.md`.

1. **Fase A**: Stabilkan MVP portal (user-facing + hardening + soft launch) — *aktif sekarang*
2. **Fase B**: Bangun Jepangku Core Service + integrasi Clerk
3. **Fase C**: Refactor portal jadi consumer Core (auth Clerk, poin via Core API, FK `core_user_id`)
4. **Fase D**: Bangun LMS (`kursus.jepangku.com`)
5. **Fase E**: Fitur ekosistem global (badge, leaderboard global, membership, notifikasi, admin pusat)

Deployment infra: Vercel → fork repo ke organisasi GitHub → self-hosted VPS + CI/CD → multi-app.

## 4. Dokumen Referensi

- `.agents/01-mvp-scope.md`: scope MVP dan batasan fitur
- `.agents/02-user-flow.md`: role permissions dan user/admin flow
- `.agents/03-database-erd.md`: desain database dan model schema
- `.agents/05-ecosystem-strategy.md`: arsitektur ekosistem & Core Service
- `docs/development-roadmap.md`: rencana pengerjaan berfase (Fase A–E)
- `docs/feature-status.md`: status aktual per fitur
- `docs/technical-architecture.md`: arsitektur teknis
- `docs/cloudflare-r2-setup.md`: setup Cloudflare R2
- `docs/soft-launch-content.md`: checklist konten soft launch

## 5. Kriteria Sukses MVP

- Publik dapat membaca artikel tanpa login
- User terdaftar dapat submit artikel dan mengikuti review flow
- Quiz dan polling bekerja untuk user
- Poin dihitung dan leaderboard tampil
- Admin dapat melakukan review artikel dan manage konten dasar

## 6. Integrasi Shared Core Service

Arsitektur saat ini sudah menyiapkan atribut seperti `source_app` dan poin berbasis transaksi
agar mudah dimigrasikan. Arah lanjutan adalah memindahkan data shared (user, profil, poin, file,
role, badge, membership, notifikasi) ke **Jepangku Core Service**, dengan **Clerk** sebagai layanan
authentication. Portal dan LMS menjadi consumer Core melalui API. Detail di
`.agents/05-ecosystem-strategy.md`.

Prinsip transisi: jangan membangun versi portal untuk fitur yang akan menjadi milik Core (auth
lanjutan, badge, variasi leaderboard, notifikasi, membership) agar tidak terjadi pekerjaan ganda.

## 7. Risiko dan Mitigasi

- **Risk**: membangun fitur auth/poin/badge versi portal yang nanti dibuang Core
  - **Mitigasi**: tunda fitur Core-dependent; lihat pemetaan fase di `docs/development-roadmap.md`
- **Risk**: terlalu banyak fitur admin sebelum portal stabil
  - **Mitigasi**: utamakan hardening + user-facing (Fase A) dahulu
- **Risk**: migrasi user/poin ke Core berisiko kehilangan data
  - **Mitigasi**: siapkan skrip migrasi + mapping `clerk_id`, preservasi `total_points`
- **Risk**: deployment berpindah ke VPS tanpa CI/CD
  - **Mitigasi**: siapkan pipeline deployment sebelum migrasi
- **Risk**: schema berubah saat integrasi Core
  - **Mitigasi**: pertahankan model global-ready dan `source_app`

## 8. Tindakan Selanjutnya

1. Eksekusi Fase A (`docs/development-roadmap.md`): hardening + user-facing + soft launch
2. Konfirmasi bahwa Neon DB sudah seeded dan live
3. Verifikasi deployment Vercel saat ini
4. Mulai perencanaan teknis Core Service + Clerk (Fase B)
