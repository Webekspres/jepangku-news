# Rencana Backlog & Revisi Produk — Jepangku News

> **Status Juni 2026:** ✅ Semua backlog di dokumen ini **telah diimplementasi**.  
> **Rencana aktif:** hanya [`feature-status.md`](./feature-status.md#rencana-lanjutan--bisa-nanti-ekosistem-fase-de) (ekosistem lintas-app).

Dokumen **arsip rencana teknis** untuk revisi UI/UX (Juni 2026), kontributor, newsletter, dan notifikasi.  
**Status implementasi** ada di [`feature-status.md`](./feature-status.md).  
**Roadmap fase produk** selaras dengan [`development-roadmap.md`](./development-roadmap.md).

---

## 1. Revisi UI/UX *(Juni 2026)*

Sumber awal: `revisi.txt` (isi dipindahkan ke sini + status di `feature-status.md`).

### Tier 1–4 — ✅ Selesai

| Tier | Ringkasan | File utama |
| :---: | :--- | :--- |
| 1 | Logo, lapisan 3 merah, footer CTA kontributor, header/gradient section, bullet list | `Navbar.tsx`, `NavbarCategoryBar.tsx`, `Footer.tsx`, `globals.css`, `CategoryListColumn.tsx`, komponen home |
| 2 | Sosial media navbar, share multi-platform artikel | `SocialMediaLinks.tsx`, `lib/social-links.ts`, Admin `/admin/social-links`, `ArticleShareButtons.tsx`, `lib/share.ts` |
| 3 | Sidebar iklan, iklan artikel, leaderboard sidebar, kategori soft launch, info page sidebar | `SidebarAdSlot.tsx`, `HomeEngagementSection.tsx`, `nav-config.ts`, `InfoPageSidebar.tsx` |
| 4 | Hapus lapisan 1, drawer sidebar + animasi slide, CTA kontributor conditional | `NavbarSidebar.tsx`, `lib/contributor.ts` |

CTA kontributor saat ini **UI-only**: `getContributorCta()` menganggap hanya `ADMIN` yang boleh submit; gate API belum aktif (§2).

---

## 2. Kontributor & Gate Upload — *Fase A″*

**Prioritas:** tinggi (blokir alur produk revisi). **Dependensi:** Clerk auth ✅. **Gate upload:** Fase A″ (Prio 6).

### Tujuan

User biasa tidak bisa upload artikel; harus daftar kontributor → antrian admin → approve → baru bisa submit.

### Tugas

#### 2.1 Schema & migrasi

- [ ] Tambah enum `Role.CONTRIBUTOR` **atau** model `ContributorApplication`:
  - `userId`, `status` (`PENDING` | `APPROVED` | `REJECTED`), `message`, `reviewedBy`, `reviewedAt`, `createdAt`
- [ ] Migrasi Prisma + seed contoh (opsional)
- [ ] Keputusan: enum `CONTRIBUTOR` vs flag `contributorApprovedAt` — rekomendasi **model application** + field `users.contributorStatus` untuk query cepat

#### 2.2 API

- [ ] `POST /api/contributor/apply` — auth required, cegah duplikat PENDING/APPROVED
- [ ] `GET /api/contributor/status` — status permohonan user saat ini
- [ ] Gate `POST /api/articles/create` — tolak non-kontributor (403 + pesan apply)
- [ ] Gate halaman `/submit-article`, `/edit-article/*` — middleware atau server check

#### 2.3 Admin

- [ ] Halaman `/admin/contributors` — antrian PENDING, approve/reject + catatan
- [ ] `POST /api/admin/contributors/[id]/approve` · `.../reject`
- [ ] Notifikasi ke user saat approve *(terkait §4)*

#### 2.4 UI & entry point

- [ ] Ganti placeholder `/contributor/apply` → form apply (motivasi, portfolio link opsional)
- [ ] Update `lib/contributor.ts` — `isApprovedContributor()` baca DB, bukan hardcode ADMIN
- [ ] Semua entry point: `NavbarSidebar`, Footer, mobile menu, profile quick action, `my-articles` — konsisten dengan helper
- [ ] Admin tetap bypass via `PORTAL_ADMIN` / `role ADMIN`

#### 2.5 QA

- [ ] User apply → PENDING → tidak bisa POST artikel
- [ ] Admin approve → user bisa submit
- [ ] Reject → user bisa apply ulang (kebijakan produk)

**Estimasi:** 3–5 hari.

---

## 3. Newsletter Subscription — *Fase E1*

**Prioritas:** menengah. **Dependensi:** SMTP/env email (opsional Fase 1 tanpa email = DB-only subscribe).

### Tujuan

Footer: input email newsletter; admin: CRUD subscriber; unsubscribe wajib login akun yang sama.

### Tugas

#### 3.1 Schema

- [ ] Model `NewsletterSubscription`: `email`, `userId` (nullable jika guest subscribe), `isActive`, `unsubscribeToken`, `subscribedAt`, `unsubscribedAt`

#### 3.2 API publik & user

- [ ] `POST /api/newsletter/subscribe` — validasi email, idempoten, rate limit
- [ ] `GET /api/newsletter/unsubscribe` — halaman konfirmasi (token + login required)
- [ ] `DELETE /api/newsletter/subscription` — auth user, hapus milik sendiri

#### 3.3 Admin

- [ ] `/admin/newsletter` — list, filter, export CSV, hapus manual
- [ ] CRUD API admin dengan guard `PORTAL_ADMIN`

#### 3.4 UI

- [ ] Komponen `FooterNewsletterForm.tsx` — input + feedback
- [ ] Halaman `/newsletter/unsubscribe` — login gate + konfirmasi

#### 3.5 Email *(fase lanjutan)*

- [ ] Template email konfirmasi subscribe
- [ ] Link unsubscribe di email → halaman §3.2
- [ ] Env: `SMTP_*` (lihat `.env.example`)

**Estimasi:** 4–6 hari (tanpa email); +2 hari dengan SMTP.

---

## 4. Notifikasi Portal — *Fase C′ + E2*

**Prioritas:** menengah–tinggi untuk engagement. **Dependensi:** §2 untuk notif approve kontributor; **C′** untuk daily poin akurat.

### Tujuan

- Modal daily poin (bukan bell) saat sesi aktif pertama per hari
- Welcome user baru & kontributor baru
- Notif approve kontributor
- *(Lanjutan Fase E)* artikel approve/reject, komentar, dll.

### Tugas

#### 4.1 Infrastruktur

- [ ] Model `Notification`: `userId`, `type`, `title`, `body`, `link`, `readAt`, `createdAt`
- [ ] `GET /api/notifications` · `PATCH /api/notifications/[id]/read` · `POST /api/notifications/read-all`
- [ ] Helper `createNotification(userId, payload)` — dipanggil dari event (approve artikel, kontributor, dll.)

#### 4.2 Daily poin modal *(C′)*

- [ ] Hook/session: deteksi first active session per hari (tanpa logout-login paksa)
- [ ] Integrasi `checkDailyLogin()` / `daily_login_rewards` News DB
- [ ] Komponen `DailyPointsModal.tsx` — tampil sekali per hari, bukan bell Navbar
- [ ] Trigger: setelah auth loaded + poin hari ini > 0

#### 4.3 Welcome & kontributor

- [ ] Event registrasi pertama → notif/modal selamat datang
- [ ] Event approve kontributor (§2.3) → notif + optional modal
- [ ] `WelcomeModal.tsx` / reuse pattern modal daily poin

#### 4.4 Navbar bell *(Fase E lanjutan)*

- [ ] Ganti placeholder `NavbarNotifications` → list unread + mark read
- [ ] Badge count; guest tetap disembunyikan ✅

#### 4.5 QA

- [ ] Daily modal sekali per hari timezone Asia/Jakarta
- [ ] Welcome hanya user baru
- [ ] Approve kontributor → notif muncul

**Estimasi:** 5–8 hari (modal + infra); +3 hari bell fungsional penuh.

---

## 5. Pemetaan ke Fase Roadmap

| Backlog | Fase roadmap | Catatan |
| :--- | :---: | :--- |
| Revisi UI Tier 1–4 | **A** | ✅ Selesai |
| Kontributor + gate upload | **A″** | Baru — sebelum soft launch |
| Migrasi poin + daily login modal | **C′** | Prasyarat notif poin |
| Newsletter | **E1** | Portal-only, terpisah follow kategori |
| Notifikasi in-app lengkap | **E2** | Portal DB; Core notif global tetap Fase E ekosistem |
| Homepage QA, Core cutover | **A / B / C** | Lihat `feature-status.md` prio 1–5 |

---

## 6. Referensi

- [`feature-status.md`](./feature-status.md) — daftar prioritas & checklist status
- [`development-roadmap.md`](./development-roadmap.md) — fase A–E
- [`ecosystem-integration.md`](./ecosystem-integration.md) — Core cutover
- [`soft-launch-content.md`](./soft-launch-content.md) — kategori konten
