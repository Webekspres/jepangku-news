# 📈 Steering Document

Dokumen ini mengarahkan jalannya proyek agar tetap sesuai dengan rencana MVP dan prioritas saat ini.

## 1. Tujuan Utama

Membangun **Jepangku News MVP** sebagai portal berita dan engagement platform bertema Jepang untuk audiens Indonesia, dengan fokus utama pada:
- Fitur user experience
- Artikel dan konten interaktif
- Gamifikasi sederhana (poin, leaderboard)
- Review dan moderation oleh admin

## 2. Prioritas Saat Ini

### Utama
- User registration, login, profile
- Submit artikel user dan review admin
- Bookmark
- Quiz & polling interaction
- Point reward / leaderboard

### Kedua
- Admin management UI untuk categories, quizzes, polls
- Improved search / discoverability
- UX polish dan mobile responsiveness

### Masa Depan
- Shared auth service multi-app
- Ekosistem `news`, `learn`, `admin`, `landing`
- Self-hosted VPS after org migration

## 3. Deployment Roadmap

1. **Phase 1**: Deploy MVP ke Vercel
2. **Phase 2**: Fork repo ke organisasi GitHub
3. **Phase 3**: Siapkan self-hosted VPS dan CI/CD
4. **Phase 4**: Ekspansi ke multi-app dan shared auth

## 4. Dokumen Referensi

- `.agents/erd.md`: desain database dan model schema
- `.agents/mvp.md`: scope MVP dan batasan fitur
- `.agents/user-flow.md`: role permissions dan user flow
- `docs/TECH_STACK.md`: arsitektur teknis
- `docs/R2_SETUP.md`: setup Cloudflare R2
- `docs/UNCOMPLETED_FEATURE.md`: daftar fitur yang belum selesai

## 5. Kriteria Sukses MVP

- Publik dapat membaca artikel tanpa login
- User terdaftar dapat submit artikel dan mengikuti review flow
- Quiz dan polling bekerja untuk user
- Poin dihitung dan leaderboard tampil
- Admin dapat melakukan review artikel dan manage konten dasar

## 6. Integrasi Shared Service

Arsitektur saat ini sudah menyiapkan atribut seperti `source_app` pada beberapa model untuk mendukung integrasi multi-app di masa datang. Namun, shared auth belum diimplementasikan sekarang.

## 7. Risiko dan Mitigasi

- **Risk**: terlalu banyak fitur admin sebelum user flow selesai
  - **Mitigasi**: utamakan user flow dahulu
- **Risk**: deployment berpindah ke VPS tanpa CI/CD
  - **Mitigasi**: siapkan pipeline deployment sebelum migrasi
- **Risk**: schema berubah saat shared auth nanti
  - **Mitigasi**: gunakan model global-ready dan `source_app`

## 8. Tindakan Selanjutnya

1. Perbaiki dokumentasi utama (`README.md`, `docs/*`)
2. Konfirmasi bahwa Neon DB sudah seeded dan live
3. Verifikasi deployment Vercel saat ini
4. Prioritaskan task user-facing di board / issue
