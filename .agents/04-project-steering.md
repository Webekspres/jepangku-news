# 📈 Steering Document

Dokumen ini mengarahkan jalannya proyek agar tetap sesuai dengan arah ekosistem dan prioritas saat ini.

> **Status:** MVP portal berita sudah tercapai. Integrasi ekosistem mengikuti kontrak Core v2
> di `docs/ecosystem-integration.md` dan `jepangku-core/docs/ECOSYSTEM.md`. Rencana berfase:
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

### Ditunda — menunggu Core Service (Fase B–C)
- Cutover poin & identitas global → **Core API** (`gamification/award`, Core JWT)
- Variasi leaderboard global, badge lintas app → **Core** (Fase E sebagian sudah ada schema)

### Selesai / bridge
- Clerk di portal (Fase B2) — login, OAuth, verifikasi email, session UI

### Masa Depan
- Cutover penuh News → Core (Fase C); FK user = Clerk ID
- LMS `kursus.jepangku.com` (Fase D) — consumer Core dari awal

## 3. Deployment & Development Roadmap

Detail checklist per fase ada di `docs/development-roadmap.md`.

1. **Fase 0**: Selaraskan dokumentasi & kontrak Core v2 — *selesai*
2. **Fase A**: Stabilkan MVP portal (user-facing + hardening + soft launch) — *aktif*
3. **Fase B**: Core siap + News bridge (shadow token, `lib/core/`)
4. **Fase C**: Cutover News → consumer Core (FK Clerk ID, poin via API)
5. **Fase D**: Bangun LMS — consumer Core dari hari pertama
6. **Fase E**: Fitur ekosistem global (membership, notifikasi, admin pusat)

Deployment infra: Vercel → fork repo ke organisasi GitHub → self-hosted VPS + CI/CD → multi-app.

## 4. Dokumen Referensi

- `docs/README.md` — indeks dokumentasi
- `docs/ecosystem-integration.md` — kontrak cutover News ↔ Core (v2)
- `jepangku-core/docs/ECOSYSTEM.md` · `jepangku-core/docs/API.md` — spesifikasi Core
- `.agents/01-mvp-scope.md`: scope MVP dan batasan fitur
- `.agents/02-user-flow.md`: role permissions dan user/admin flow
- `.agents/03-database-erd.md`: desain database portal (catatan migrasi Clerk ID)
- `.agents/05-ecosystem-strategy.md`: visi ekosistem (bagian 8–12 = desain v1)
- `docs/development-roadmap.md`: rencana pengerjaan berfase (Fase 0–E)
- `docs/feature-status.md`: status aktual per fitur
- `docs/technical-architecture.md`: arsitektur teknis

## 5. Kriteria Sukses MVP

- Publik dapat membaca artikel tanpa login
- User terdaftar dapat submit artikel dan mengikuti review flow
- Quiz dan polling bekerja untuk user
- Poin dihitung dan leaderboard tampil
- Admin dapat melakukan review artikel dan manage konten dasar

## 6. Integrasi Shared Core Service

Kontrak teknis canonical: **`docs/ecosystem-integration.md`** dan **`jepangku-core/docs/ECOSYSTEM.md`**.

- **Clerk** — authentication (login, OAuth, MFA); webhook user **hanya ke Core**
- **Core** — identitas global, XP/poin, role, badge, leaderboard (`users.id` = Clerk ID)
- **Portal** — consumer Core untuk poin/role; username/bio tetap di DB News sampai Core siap

Prinsip transisi: jangan membangun fitur Core-dependent baru di portal (badge global, membership,
notifikasi) sebelum cutover Fase C. Detail pemetaan fase: `docs/development-roadmap.md`.

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
