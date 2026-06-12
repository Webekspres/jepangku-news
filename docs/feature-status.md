# 📌 Status Fitur & Prioritas — Jepangku News

Dokumen ini menyajikan status aktual implementasi fitur berdasarkan audit kode sumber, diurutkan dari
yang masih perlu dibangun hingga yang sudah selesai. Diperbarui secara manual setiap ada perubahan
signifikan pada fitur.

> **Dokumentasi integrasi Core:** mulai dari [`docs/README.md`](./README.md) →
> [`ecosystem-integration.md`](./ecosystem-integration.md). Kontrak API:
> `jepangku-core/docs/API.md`. Roadmap: [`development-roadmap.md`](./development-roadmap.md).

---

## ✅ Daftar Pekerjaan — Prioritas Teratas

> **Diperbarui:** Juni 2026 — hasil briefing landing page ekosistem jepangku.com  
> Detail rencana teknis: [§ Rencana Landing Page](#-rencana-landing-page-ekosistem--jepangkucom) di bawah.

### 🏠 Homepage jepangku.com *(Landing Page Ekosistem)* — **FASE AKTIF**

Transformasi `app/(public)/page.tsx` menjadi hub ekosistem (Berita · TV · LMS · Interaktif).  
**Arsitektur data:** API terpisah per wave + lazy load saat section mendekati viewport — **bukan** monolit `/api/homepage`.

#### Quick win *(bisa dikerjakan terpisah)*

[x] **Navbar** — sembunyikan bell notifikasi saat guest (`components/Navbar.tsx`, render `NavbarNotifications` hanya jika auth)

#### Fase 0 — Perencanaan

[x] Briefing & dokumen rencana landing page ekosistem  
[x] Keputusan arsitektur: API terpisah + lazy load per section (§3.1)  
[x] Review desain / sign-off urutan section — `lib/home/sections.ts` + `page.tsx` struktur §1–§10 + placeholder §4–§8  
[x] `hooks/useLazySection.ts` + `LazySectionShell` + `HomeHero` + `HomePlaceholderSection`  
[x] Hero ekosistem: headline, quick links, search, `asanoha-bg`  
[x] Label §3: `今日 / HARI INI` (ganti “Artikel Terbaru”)  
[x] Hapus grid kategori lama (§11) — digantikan placeholder §4 editorial

#### Fase 1 — Fondasi data + above-the-fold *(1–2 hari)*

**Backend & infra**

[x] Ekstrak query dari `app/api/homepage/route.ts` → `lib/home/queries/feed.ts`  
[x] `GET /api/home/feed` — Wave 1: `featuredArticles`, `trending`, `todayArticles` (timezone Asia/Jakarta)  
[x] Hook `hooks/useLazySection.ts` — wired Wave 1 (immediate) + Wave 4 (lazy engagement)  
[x] Komponen `LazySectionSkeleton.tsx` (tinggi fixed, anti-CLS)  
[x] Refactor `page.tsx`: hapus `loadData()` global; Wave 1 `/api/home/feed` on mount; Wave 4 `/api/home/engagement` lazy  
[x] `GET /api/home/engagement` — poll, quiz, leaderboard (Wave 4)  
[x] `/api/homepage` deprecated — delegasi ke shared queries

**Section UI**

[x] §1 Featured + Trending — polish spacing, section header, carousel dots, grid proporsional  
[x] §2 Hero ekosistem — CTA auth/guest, quick links + UTM kursus, layout mobile  
[x] §3 Hari Ini — label + query timezone Jakarta + fallback `< 3` artikel

#### Fase 2 — Kategori editorial *(2–3 hari)*

[x] Seed kategori: `halal-in-japan`, `entertainment` (`prisma/seeder/data/categories.js`)  
[x] Mapping editorial group → slug (Anime Manga, Entertainment, Lifestyle, Culture, Halal) di `lib/home/editorial-groups.ts` + `lib/home/queries/categories-editorial.ts`  
[x] `GET /api/home/categories-editorial` — Wave 2 lazy (sentinel §4)  
[x] Komponen `CategoryEditorialSection.tsx` — layout 2 kolom featured + 3 kolom list (referensi Japanese Station)  
[x] Keputusan §11 “Jelajahi Kategori” grid — **digabung ke §4** (grid lama dihapus Fase 0; explore via `/explore` + link View More per kolom)

#### Fase 3 — Jepangku TV *(3–5 hari)*

[x] Model Prisma `Video` + migrasi  
[x] Admin CRUD `/admin/videos`  
[x] `GET /api/videos`, `GET /api/videos/[slug]`  
[x] `GET /api/home/tv` — Wave 3 lazy: featured + sidebar 3–4 video  
[x] Komponen `JepangkuTvSection.tsx` — embed YouTube lazy-load  
[x] Halaman dedicated `/tv` atau `/jepangku-tv` (archive + pagination)

#### Fase 4 — Advertisement *(1–2 hari)*

[x] Model Prisma `AdSlot` / `HomepageBanner` + migrasi  
[x] Admin banner/ads (`/admin/ads` atau extend `/admin/homepage`)  
[x] `GET /api/home/ads?slot=homepage-mid` — Wave 3 lazy  
[x] Komponen `AdBannerSlot.tsx` — empty state rapi (sembunyikan jika slot kosong)

#### Fase 5 — Belajar Bahasa Jepang / LMS teaser *(1 hari)*

[x] Komponen `HomeLmsTeaser.tsx` — keunggulan JLPT, 2–3 course card statis  
[x] Link ke `https://dev.kursus.jepangku.com/kursus` + UTM `?utm_source=jepangku.com&utm_medium=homepage`  
[x] `GET /api/home/lms-teaser` — Wave 3 lazy (Fase 1: JSON statis; sinkron manual dengan `jepangkuLMS/.../courses-data.ts`)

#### Fase 6 — Reaksi komunitas emoji *(2 hari)*

[x] Query agregat top reacted articles minggu ini → `lib/home/queries/reactions.ts`  
[x] `GET /api/home/reactions` — Wave 3 lazy
[x] Komponen `HomeReactionsSection.tsx` — showcase 9 emoji + 3–5 kartu “Paling Direaksi”

#### Fase 7 — Engagement bawah fold + migrasi API *(1–2 hari)*

[x] Ekstrak poll/quiz/leaderboard → `lib/home/queries/engagement.ts`  
[x] `GET /api/home/engagement` — Wave 4 lazy  
[x] Komponen `HomeEngagementSection.tsx` — poll/kuis tampil hingga 3 item masing-masing  
[x] Hapus monolit `GET /api/homepage` — migrasi selesai  
[x] Smoke test wave: `bun run verify:home` (`scripts/verify-home-waves.ts`)

#### QA sebelum launch jepangku.com

[ ] Mobile: semua section scrollable, tidak overflow horizontal  
[ ] Empty state tiap section (video / artikel hari ini / iklan / reaksi)  
[ ] Network: Wave 1 saat load; Wave 2–4 hanya setelah scroll
[ ] Section error isolated — satu API gagal tidak kosongkan halaman
[ ] Lighthouse: lazy-load YouTube embed; skeleton height fixed
[ ] `data-testid` untuk section & wave baru (E2E)

#### Integrasi LMS — lanjutan *(koordinasi jepangkuLMS)*

[ ] Fase 2 LMS: `GET /api/public/courses` di jepangkuLMS
[ ] Fase 2 News: proxy `/api/home/lms-teaser` baca live dari LMS (ganti static cards)
[ ] Fase 3 LMS: katalog publik `/kursus` baca Prisma (single source of truth)

**Urutan implementasi disarankan:** Quick win Navbar → Fase 1 → 2 → 5 → 6 → 7 (engagement migrate) → 3 → 4 → LMS Fase 2

---

### 📋 Portal & Ekosistem — Pekerjaan Lain *(paralel / setelah fondasi homepage)*

#### Sekarang — Core, halaman, keamanan

[ ] **Core deploy prod** + Clerk webhook → `POST /api/v1/auth/webhooks/clerk`
[ ] **Verifikasi Fase 4** — registrasi, poin, daily login, admin, leaderboard, staging E2E (`bun run verify:core`)  
[ ] **Kebijakan akun legacy** — user tanpa Clerk ID: force re-login atau hapus  
[ ] **Halaman belum ada** — `/activity`, admin leaderboard/points/activity-log  
[ ] **Keamanan pre-production** — image moderation AI, Redis/Upstash, backfill sanitasi, Sentry, log drain  
[ ] **Gap Core** — endpoint riwayat transaksi user (riwayat `/points` penuh)

#### Berikutnya — Fase E *(Core Service)*

[ ] In-app notifications (fungsional — setelah placeholder Navbar diganti)
[ ] Follow / subscribe kategori  
[ ] Monthly & all-time leaderboard, filter by app, badge/level  
[ ] Export riwayat poin CSV, riwayat aktivitas `/activity`  
[ ] Admin activity audit log  

#### Ditunda — soft launch konten

[ ] Seed 30+ artikel untuk soft launch *(tidak diprioritaskan sementara)*

> Checklist lengkap per area: [§ Belum Diimplementasi](#-belum-diimplementasi) · yang sudah selesai: [§ Sudah Diimplementasi](#-sudah-diimplementasi-verified)

---

## 🏠 Rencana Landing Page Ekosistem — jepangku.com

> **Status:** 📋 Perencanaan — belum diimplementasi (Juni 2026)  
> **Scope:** `app/(public)/page.tsx`, komponen homepage baru, **API terpisah per section + lazy load**, quick fix Navbar  
> **Referensi UI:** [Japanese Station TV](https://japanesestation.com/japanese-station-tv), layout kategori portal berita JS

### 1. Tujuan & Posisi Produk

**jepangku.com** bukan lagi halaman “portal berita saja”, melainkan **pusat ekosistem Jepangku** — gerbang pertama pengunjung sebelum masuk ke produk anak:

| Produk | Domain | Peran di landing |
| :--- | :--- | :--- |
| **Portal Berita** *(repo ini)* | `jepangku.com` | Berita, trending, kategori, interaktif (poll/kuis/reaction) |
| **LMS Kursus Jepang** | `kursus.jepangku.com` / dev: `dev.kursus.jepangku.com` | Belajar bahasa Jepang, JLPT, sertifikat |
| **Core Service** | `core.jepangku.com` | Identitas, poin, leaderboard — *tidak ditampilkan sebagai produk terpisah* |

**Prinsip UX:**

1. **5 detik pertama** — pengunjung paham: “Ini portal Jepang untuk orang Indonesia: baca, tonton, belajar, ikut kuis.”
2. **Satu scroll = satu cerita** — dari headline → konten hari ini → kategori → video → belajar → interaktif → komunitas.
3. **CTA jelas per produk** — setiap section punya satu aksi utama (baca / tonton / daftar kursus / ikut poll).
4. **Tidak overload** — section baru ditambah bertahap; skeleton & empty state harus rapi sebelum konten penuh.

### 2. Alur Pengunjung (User Journey)

```mermaid
flowchart TD
  A[Landing jepangku.com] --> B{Sudah login?}
  B -->|Tidak| C[Hero + search + CTA Gabung]
  B -->|Ya| D[Hero + search + poin badge di Navbar]
  C --> E[Konten Hari Ini]
  D --> E
  E --> F[Kategori editorial JS-style]
  F --> G[Jepangku TV]
  G --> H[Slot Iklan]
  H --> I[Belajar Bahasa Jepang → LMS]
  I --> J[Reaksi komunitas emoji]
  J --> K[Poll & Kuis + Leaderboard]
  K --> L{Minat mendalam?}
  L -->|Berita| M[/articles, /trending]
  L -->|Belajar| N[kursus.jepangku.com]
  L -->|Video| O[/tv atau halaman TV]
```

**Persona utama:**

- **Pembaca casual** — scroll headline & kategori, klik artikel trending.
- **Fan Jepang** — tonton Jepangku TV, reaksi emoji, ikut poll/kuis.
- **Pelajar bahasa** — section LMS → katalog kursus di subdomain kursus.
- **Kontributor** — Navbar “Buat Artikel”, leaderboard, daftar akun.

### 3. Urutan Section Baru (Target)

Menggantikan urutan homepage saat ini (featured → hero → terbaru → poll → leaderboard → kategori grid):

| # | Section | Status saat ini | Aksi rencana |
| :-: | :--- | :---: | :--- |
| 1 | **Featured + Trending** | ✅ Ada | Pertahankan; polish spacing dengan hero baru |
| 2 | **Hero Ekosistem** | 🟡 Ada (basic) | Redesign: value prop ekosistem, search, quick links ke Berita / TV / Kursus |
| 3 | **Hari Ini** *(ganti “Artikel Terbaru”)* | 🟡 Partial | Filter `publishedAt` hari ini (timezone Asia/Jakarta); fallback 6 artikel terbaru jika kosong |
| 4 | **Kategori Editorial** *(layout foto referensi)* | 🔴 Belum | 2 kolom besar (Anime-Manga, Entertainment) + 3 kolom list (Lifestyle, Culture, Halal) |
| 5 | **Jepangku TV** | 🔴 Belum | Featured video + sidebar daftar video; referensi JS TV |
| 6 | **Advertisement** | 🔴 Belum | Slot iklan/banner admin-managed |
| 7 | **Belajar Bahasa Jepang** | 🔴 Belum | Teaser LMS → `dev.kursus.jepangku.com` |
| 8 | **Reaksi Komunitas** | 🔴 Belum | Showcase emoji + artikel/konten paling direaksi |
| 9 | **Polling & Kuis** | ✅ Ada | Tampilkan hingga 2 poll + 2 quiz (API sudah return 4) |
| 10 | **Leaderboard** | ✅ Ada | Pertahankan |
| 11 | **Jelajahi Kategori** *(grid ringkas)* | ✅ Ada | Opsional: dipindah ke footer explore atau digabung dengan §4 |

### 3.1 Arsitektur Data — API Terpisah + Lazy Load per Section

> **Keputusan:** **Jangan** memuat semua payload homepage ke satu `GET /api/homepage` yang monolit.  
> Gunakan **endpoint kecil per domain data** + **fetch saat section hampir masuk viewport** (Intersection Observer).

**Alasan:**

| Masalah monolit `/api/homepage` | Solusi terpisah + lazy |
| :--- | :--- |
| 10+ query Prisma + Core leaderboard sekaligus | Hanya query yang section-nya butuh |
| Payload JSON besar (artikel + kategori blocks + video + reaksi) | Response kecil per wave; TTFB & parse lebih cepat |
| User bounce sebelum scroll — query TV/LMS/reaksi sia-sia | Query berat ditunda sampai user scroll |
| Satu endpoint error → seluruh halaman kosong | Section gagal load independen + retry per section |

**Pola fetch (disarankan):**

```mermaid
sequenceDiagram
  participant U as Pengunjung
  participant P as page.tsx
  participant S as Section + sentinel
  participant API as API routes

  U->>P: Buka jepangku.com
  P->>API: Wave 1 — /api/home/feed (§1–3)
  API-->>P: featured, trending, todayArticles
  Note over P: Hero §2 = static, tanpa API

  U->>P: Scroll — sentinel §4 masuk viewport
  P->>API: Wave 2 — /api/home/categories-editorial
  API-->>P: categoryBlocks

  U->>P: Scroll — sentinel §5 masuk viewport
  par Wave 3 paralel
    P->>API: /api/home/tv
    P->>API: /api/home/ads
    P->>API: /api/home/lms-teaser
    P->>API: /api/home/reactions
  end

  U->>P: Scroll — sentinel §9 masuk viewport
  P->>API: Wave 4 — /api/home/engagement
  API-->>P: polls, quizzes, leaderboard
```

**Pemetaan wave → section:**

| Wave | Trigger | Endpoint | Section | Catatan |
| :---: | :--- | :--- | :---: | :--- |
| **1** | `mount` (langsung) | `GET /api/home/feed` | 1, 3 | Featured + trending + hari ini |
| — | — | *(tanpa API)* | 2 | Hero static + search client-side |
| **2** | sentinel §4 (`rootMargin: 400px`) | `GET /api/home/categories-editorial` | 4 | Query berat (5 group × artikel) |
| **3** | sentinel §5 | `GET /api/home/tv` | 5 | |
| | | `GET /api/home/ads?slot=homepage-mid` | 6 | Ringan |
| | | `GET /api/home/lms-teaser` | 7 | Fase 1 bisa static JSON; Fase 2 proxy LMS |
| | | `GET /api/home/reactions` | 8 | Agregat reaksi |
| **4** | sentinel §9 | `GET /api/home/engagement` | 9, 10 | Poll + quiz + leaderboard Core |

**Alternatif grouping** *(sesuai usulan scroll §2 → fetch §5–8):*

- Wave 3 bisa di-trigger saat **§2 atau §4** pertama kali terlihat (lebih agresif preload), bukan menunggu §5.
- Atur via `rootMargin` — mis. `'600px 0px'` = fetch ~1 layar sebelum section tampil.

**Implementasi frontend:**

```tsx
// hooks/useLazySection.ts — pola per section
function useLazySection<T>(endpoint: string, options?: { rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, error } = useSWR(enabled ? endpoint : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setEnabled(true); io.disconnect(); } },
      { rootMargin: options?.rootMargin ?? '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, data, isLoading, error };
}
```

- Setiap section component punya **`<div ref={sentinel} />`** di atas section + **skeleton** sampai `data` ready.
- Fetch **sekali per session** (`enabled` → disconnect observer); jangan re-fetch setiap scroll bolak-balik.
- Wave 3: `Promise.all` di parent atau 4 hook paralel — browser multiplex HTTP/2.

**Implementasi backend:**

| Endpoint | Query utama | Cache `Cache-Control` |
| :--- | :--- | :--- |
| `/api/home/feed` | featured, trending, todayArticles | `s-maxage=60, stale-while-revalidate=120` |
| `/api/home/categories-editorial` | 5 category blocks | `s-maxage=120, stale-while-revalidate=300` |
| `/api/home/tv` | featuredVideo + latest 4 | `s-maxage=300` |
| `/api/home/ads` | active slot by position | `s-maxage=60` |
| `/api/home/lms-teaser` | static / proxy LMS | `s-maxage=600` |
| `/api/home/reactions` | top reacted articles | `s-maxage=120` |
| `/api/home/engagement` | polls, quizzes, Core leaderboard | `s-maxage=60` |

**Migrasi dari `/api/homepage` saat ini:**

1. Ekstrak logic di `app/api/homepage/route.ts` ke `lib/home/queries/*.ts` (shared query functions).
2. Endpoint baru memanggil helper yang sama — **DRY**, bukan copy-paste query.
3. Pertahankan `GET /api/homepage` sementara sebagai **aggregator tipis** (delegasi ke helpers) untuk backward compat / E2E lama; tandai deprecated.
4. `page.tsx` ganti satu `loadData()` → per-section lazy hooks.

**Trade-off & mitigasi:**

| Trade-off | Mitigasi |
| :--- | :--- |
| Lebih banyak request HTTP | Wave kecil (4–7 request total); HTTP/2 paralel; cache CDN per endpoint |
| Konten bawah fold tidak ada di HTML awal (client fetch) | Wave 1 cukup untuk SEO headline; optional **SSR/RSC Wave 1** nanti jika perlu |
| Flash skeleton saat scroll cepat | `rootMargin` agresif + skeleton height fixed (CLS) |
| Leaderboard Core lambat | Isolasi di Wave 4 — tidak blok above-the-fold |

**Kesimpulan:** ✅ **Memungkinkan dan direkomendasikan.** Monolit `/api/homepage` hanya cocok untuk homepage kecil; dengan 10+ section, pola **API terpisah + lazy load per viewport** lebih scalable dan ramah performa.

---

### 4. Rincian Per Section

#### 4.1 Hero Ekosistem (redesign)

**Tujuan:** Komunikasikan identitas hub, bukan hanya tagline berita.

**Konten:**

- Label bilingual: `日本のポータル / PORTAL JEPANG`
- Headline: *Berita, Budaya, Video & Belajar Bahasa Jepang*
- Subtitle: satu kalimat tentang ekosistem (baca · tonton · belajar · dapat poin)
- **Search bar** (horizontal: input + tombol) → `/search?q=`
- **Quick links chips:** Berita · Jepangku TV · Kursus · Kuis · Poll
- CTA: `Gabung Sekarang` (guest) / `Dashboard` (auth) — kanan pada desktop

**Komponen:** perluas `SectionHeader` atau buat `HomeHero.tsx` dedicated.

**Desain:** navy + `asanoha-bg`, kontras dengan section putih di bawahnya.

---

#### 4.2 Hari Ini *(ganti “Berita Terbaru”)*

**Tujuan:** Signal freshness — “apa yang baru hari ini”, ala portal berita profesional.

**Perubahan copy:**

- Label: `今日 / HARI INI`
- Judul: **Artikel Hari Ini**
- Link: `Lihat Semua` → `/articles?sort=latest`

**API:** `GET /api/home/feed` — field `todayArticles` (Wave 1, fetch on mount).

- Filter: artikel `publishedAt` dalam window 00:00–23:59 **Asia/Jakarta**
- Fallback: jika `< 3` artikel hari ini, isi dengan artikel terbaru + badge “Terbaru”

**UI:** grid 3 kolom (sama seperti sekarang), optional timestamp relatif.

---

#### 4.3 Kategori Editorial *(referensi foto Japanese Station)*

**Tujuan:** Kurasi editorial per vertical — bukan grid kategori generik.

**Layout target:**

```
┌─────────────────────┬─────────────────────┐
│  Anime Manga        │  Entertainment      │
│  [featured besar]   │  [featured besar]   │
│  + 3 list thumb     │  + 3 list thumb     │
└─────────────────────┴─────────────────────┘
┌──────────┬──────────┬──────────┐
│ Lifestyle│ Culture  │ Halal JP │
│ bullet   │ bullet   │ bullet   │
│ headlines│ headlines│ headlines│
└──────────┴──────────┴──────────┘
```

**Gap data kategori saat ini:**

Seed DB (`prisma/seeder/data/categories.js`) punya: Anime, Manga, Culture, Travel, Food, Event, Technology, Lifestyle, Education, Fun — **belum ada** Entertainment, Halal In Japan, dan belum ada grouping “Anime Manga”.

**Keputusan rencana:**

1. **Fase A (tanpa migrasi berat):** mapping slug existing → group editorial di API:
   - *Anime Manga* ← `anime`, `manga`, `fun`
   - *Entertainment* ← `event`, `technology` (sementara)
   - *Lifestyle* ← `lifestyle`, `food`, `travel`
   - *Culture* ← `culture`, `education`
   - *Halal In Japan* ← buat kategori baru `halal-in-japan` + seed
2. **Fase B:** admin bisa set `categoryGroup` atau parent category di schema.

**API:** `GET /api/home/categories-editorial` (Wave 2, lazy saat sentinel §4).

```typescript
{
  slug: 'anime-manga',
  title: 'Anime Manga',
  featured: Article | null,
  list: Article[] // 3 item dengan cover + meta
}
```

**Komponen baru:** `CategoryEditorialBlock.tsx`, `CategoryListColumn.tsx`.

---

#### 4.4 Jepangku TV *(referensi Japanese Station TV)*

**Nama produk:** **Jepangku TV** (alternatif: *Jepangku Channel* — final saat implementasi)

**Layout target** (orange/navy brand, bukan copy warna JS):

```
┌──────────────────────────────────────────────────┐
│  ▶ Jepangku TV                          [header] │
├────────────────────────────┬─────────────────────┤
│  Featured embed (YouTube)  │  Sidebar 3–4 video  │
│  + judul + tanggal         │  thumb + date + title│
├────────────────────────────┴─────────────────────┤
│              [ Lihat Semua Video ]               │
└──────────────────────────────────────────────────┘
```

**Backend baru (belum ada):**

| Item | Detail |
| :--- | :--- |
| Model `Video` | `id`, `title`, `slug`, `youtubeId` / `embedUrl`, `thumbnailUrl`, `publishedAt`, `isFeatured`, `status`, `viewCount` |
| API publik | `GET /api/videos`, `GET /api/videos/[slug]` |
| Admin | CRUD di `/admin/videos` |
| Homepage payload | `GET /api/home/tv` (Wave 3, lazy) |

**Halaman dedicated:** `/tv` atau `/jepangku-tv` — daftar lengkap + pagination (mirroring JS TV archive).

**Embed:** YouTube iframe lazy-load; thumbnail dari `img.youtube.com/vi/{id}/hqdefault.jpg`.

---

#### 4.5 Advertisement

**Tujuan:** Slot monetisasi tanpa mengganggu UX — inspirasi billboard JS di homepage.

**Opsi implementasi (urutan rekomendasi):**

1. **Fase A — Admin banner statis:** model `AdSlot` / `HomepageBanner` dengan `position` (`homepage-mid`, `homepage-sidebar`), `imageUrl`, `linkUrl`, `alt`, `isActive`, `startAt`, `endAt`
2. **Fase B — Rotasi & impression tracking** (opsional, post-launch)

**UI:** full-width responsive banner antara TV dan LMS section; placeholder abu-abu dengan label “Partner” jika slot kosong (jangan tampilkan area kosong).

**Admin:** extend `/admin/homepage` atau halaman `/admin/ads` baru.

---

#### 4.6 Belajar Bahasa Jepang *(integrasi jepangkuLMS)*

**Audit LMS (Juni 2026):** **tidak ada API publik** untuk list kursus di `jepangkuLMS`. Katalog publik `/kursus` masih pakai data statis `CATALOG_COURSES`; Prisma-backed catalog hanya di dashboard auth.

**Strategi landing (fase berurutan):**

| Fase | Pendekatan | Data |
| :---: | :--- | :--- |
| **1** *(implementasi pertama)* | Section **keunggulan LMS** + CTA ke `https://dev.kursus.jepangku.com/kursus` | Hardcode 2–3 featured course card dari slug LMS (`jlpt-n5-kursus-lengkap`, dll.) — sinkron manual dengan `jepangkuLMS/features/learning/components/courses-data.ts` |
| **2** | LMS tambah `GET /api/public/courses` + CORS | News proxy `GET /api/home/lms-teaser` (Wave 3, server-side) |
| **3** | Katalog LMS baca Prisma di `/kursus` | Single source of truth |

**Konten section Fase 1:**

- Headline: `学ぶ / BELAJAR BAHASA JEPANG`
- 3 bullet keunggulan: JLPT N5–N1, progress tracking, sertifikat
- Grid 2–3 course card (thumb, level badge N5/N4, CTA “Lihat Kursus”)
- Footer CTA: `Jelajahi Semua Kursus → dev.kursus.jepangku.com`

**Komponen:** `HomeLmsTeaser.tsx` — link external, `target="_blank"` + `rel="noopener"`.

---

#### 4.7 Reaksi Komunitas (emoji)

**Tujuan:** Social proof + highlight fitur unik Jepangku (9 emoji reaction sudah ada di detail artikel).

**Yang sudah ada:** model `Reaction`, `ReactionBar.tsx`, `GET/POST /api/reactions`.

**Yang perlu dibangun:**

- Query agregat: artikel/konten dengan `reactionCount` tertinggi minggu ini
- Homepage section: tampilkan bar emoji (`❤️ 😂 🥰 …`) + 3–5 kartu artikel “Paling Direaksi” dengan total reaksi & emoji dominan
- Klik kartu → detail artikel; klik emoji (auth) → toggle reaction inline (reuse `ReactionBar` compact)

**API:** `GET /api/home/reactions` (Wave 3, lazy).

---

#### 4.8 Quick fix Navbar — notifikasi guest

**Masalah:** `NavbarNotifications` dirender untuk guest dan auth (`Navbar.tsx` ~L282 & ~L387); bell placeholder membingungkan pengunjung belum login.

**Perbaikan (scope kecil, bisa dilakukan terpisah):**

- Render `<NavbarNotifications />` **hanya** saat `showAuthenticated === true`
- Guest: sembunyikan bell sepenuhnya (notifikasi = Fase E Core, belum fungsional)

**File:** `components/Navbar.tsx` — conditional render; tidak perlu ubah `NavbarNotifications.tsx`.

---

### 5. Perubahan Backend & Data

| Area | Perubahan | Prioritas |
| :--- | :--- | :--- |
| **`lib/home/queries/`** | Ekstrak query shared dari `/api/homepage` saat ini | Tinggi |
| **`/api/home/*`** | 7 endpoint wave (feed, categories-editorial, tv, ads, lms-teaser, reactions, engagement) | Tinggi |
| `/api/homepage` | Deprecated — delegasi ke helpers; hapus setelah migrasi | Rendah |
| Prisma | Model `Video`, `AdSlot`; optional `CategoryGroup` | Tinggi |
| Seed | Kategori `halal-in-japan`, `entertainment`; mapping editorial | Sedang |
| Admin | Videos CRUD, banner/ads CRUD | Tinggi |
| LMS | `GET /api/public/courses` *(koordinasi tim LMS)* | Fase 2 |
| Navbar | Hide notifications for guest | Rendah (quick win) |
| **Frontend** | `useLazySection` + SWR per section; sentinel + skeleton | Tinggi |

---

### 6. Komponen & File (Target Implementasi)

```
hooks/
  useLazySection.ts              # Intersection Observer + SWR enabled gate

lib/home/queries/
  feed.ts                        # featured, trending, todayArticles
  categories-editorial.ts
  tv.ts
  ads.ts
  lms-teaser.ts
  reactions.ts
  engagement.ts                    # polls, quizzes, leaderboard

app/api/home/
  feed/route.ts
  categories-editorial/route.ts
  tv/route.ts
  ads/route.ts
  lms-teaser/route.ts
  reactions/route.ts
  engagement/route.ts

components/home/
  HomeHero.tsx                   # §2 — static, no fetch
  HomeFeedSection.tsx            # §1+3 — Wave 1 on mount
  HomeTodayArticles.tsx
  CategoryEditorialSection.tsx   # §4 — Wave 2 lazy
  JepangkuTvSection.tsx          # §5 — Wave 3 lazy
  AdBannerSlot.tsx               # §6
  HomeLmsTeaser.tsx              # §7
  HomeReactionsSection.tsx       # §8
  HomeEngagementSection.tsx      # §9+10 — Wave 4 lazy
  LazySectionSkeleton.tsx        # shared placeholder

app/(public)/tv/page.tsx
app/api/videos/route.ts
app/(admin)/admin/videos/...
```

Refactor `page.tsx`: **tidak ada** satu `fetch('/api/homepage')` global — setiap section (atau wave group) owns fetch via `useLazySection`. Hero §2 tanpa API.

---

### 7. Fase Implementasi

| Fase | Deliverable | Estimasi relatif | Dependensi |
| :---: | :--- | :---: | :--- |
| **0** | Dokumen ini ✅ + arsitektur API lazy | — | — |
| **1** | `lib/home/queries` + `/api/home/feed` + lazy hook; Hero, Hari Ini, hide notif guest | 1–2 hari | Hanya News |
| **2** | Kategori editorial + seed/mapping kategori | 2–3 hari | Konten artikel per kategori |
| **3** | Jepangku TV (model + admin + section + `/tv`) | 3–5 hari | Konten video YouTube |
| **4** | Ad slot + admin banner | 1–2 hari | Asset iklan |
| **5** | LMS teaser (keunggulan + link dev) | 1 hari | — |
| **6** | Reaksi komunitas section | 2 hari | Data reaksi existing |
| **7** | LMS public API + live course cards | 2–3 hari | Koordinasi jepangkuLMS |

**Urutan disarankan:** 0 → 1 → 2 → 5 → 6 → 7 (engagement migrate) → 3 → 4 → LMS Fase 2

> **Checklist implementasi:** lihat [Daftar Pekerjaan — Homepage](#-homepage-jepangkucom-landing-page-ekosistem--fase-aktif) di atas (sumber kebenaran untuk tracking task).

---

## 🎯 Tujuan Utama

- Stabilkan portal lebih dulu: selesaikan bug, fitur, dan integrasi Core — soft launch konten ditunda
- Lengkapi workflow artikel, quiz, polling, poin, dan leaderboard
- Jangan bangun fitur auth/poin/badge versi portal yang akan digantikan Core Service
- **Auth bridge:** Clerk ✅; integrasi Core Fase 1+3 **coded** ✅ — lihat [`ecosystem-integration.md`](./ecosystem-integration.md) §4
- **Fase 0 dokumentasi** ✅ — kontrak v2 selaras dengan `jepangku-core/docs/ECOSYSTEM.md`
- **Penyatuan shared auth** — sisa pekerjaan di [§ Belum Diimplementasi](#-belum-diimplementasi); selesai di [§ Sudah Diimplementasi](#-sudah-diimplementasi-verified)

---

## ⏱️ Prioritas Pengerjaan Berikutnya

Fokus paralel: **(A) homepage jepangku.com** + **(B) Core, keamanan, halaman sisa**.  
Tracking task homepage: [Daftar Pekerjaan — Homepage](#-homepage-jepangkucom-landing-page-ekosistem--fase-aktif). Detail per area: [§ Belum Diimplementasi](#-belum-diimplementasi).

### A. Homepage jepangku.com *(landing page ekosistem)*

Mulai dari **Quick win Navbar** → **Fase 1** (feed API + hero + hari ini) → **Fase 2** (kategori editorial) → **Fase 5–6** (LMS teaser + reaksi) → **Fase 7** (engagement migrate) → **Fase 3–4** (TV + ads, butuh konten operasional).

### B. Sekarang — bug, fitur portal & Core

1. **Core & cutover** — Fase 1 operasional (deploy, Clerk webhook) + Fase 4 verifikasi QA (`bun run verify:core`); lihat [§ Core & Cutover](#-core--cutover--sisa-operasional-fase-14)
2. **Halaman belum ada** — `/activity`, admin leaderboard/points/activity-log; lihat [§ Halaman](#-halaman--belum-ada--belum-selesai)
3. **Keamanan pre-production** — image moderation AI, Redis/Upstash, backfill sanitasi, Sentry, log drain; lihat [§ Keamanan](#️-keamanan--kualitas--pre-launch--production)
4. **Gap Core** — endpoint riwayat transaksi user (memblok riwayat `/points` penuh); lihat [§ Gap Core](#gap-core--koordinasi-tidak-memblok-cutover-minimal)

Portal user-facing utama (artikel, quiz, poll, komentar, search, analytics) sudah selesai di kode — sisa pekerjaan di atas + homepage ekosistem.

### Berikutnya — Fase E *(setelah Core API siap)*

1. Riwayat aktivitas, leaderboard lanjutan, notifikasi, admin monitoring — lihat [§ Fase E](#-engagement--sosial--fase-e-core-service) di bawah
2. Ekosistem LMS & payment — lihat [§ Ekosistem Lanjutan](#-ekosistem-lanjutan--fase-de)

### Ditunda — soft launch konten

Konten 30+ artikel **tidak diprioritaskan** untuk sementara; lihat [§ Soft Launch](#-soft-launch--fase-a-ditunda) saat siap rilis publik.

---

## 🚧 Belum Diimplementasi

### 🔗 Core & Cutover — Sisa Operasional *(Fase 1–4)*

Kontrak teknis: [`ecosystem-integration.md`](./ecosystem-integration.md) · API: `jepangku-core/docs/API.md` · **Target:** login Clerk → user di Core → News pakai Clerk ID sebagai FK → poin via Core API.

| Fase | Fokus | Repo utama | Status |
| ---- | ----- | ---------- | ------ |
| **1** | Core siap melayani News | `jepangku-core` | 🔄 lokal OK; deploy prod + webhook ⏳ |
| **2** | News bridge | `jepangku-news` | ✅ selesai |
| **3** | Cutover penuh | `jepangku-news` | ✅ kode + migrasi lokal selesai |
| **4** | Verifikasi & cleanup | keduanya | ⏳ |

#### Fase 1 — Core *(koordinasi tim Core)*

[~] **Deploy Core** — staging/prod; lokal `bun run start` + `GET /health` OK
[ ] **Clerk webhook** — endpoint production/ngrok ke `POST /api/v1/auth/webhooks/clerk`

#### Fase 2 — Sisa bridge

[ ] **Kebijakan akun legacy** — user tanpa Clerk ID (JWT lama): force re-login Clerk atau hapus

#### Fase 4 — Verifikasi penyatuan

[ ] **Registrasi baru** — user Clerk → webhook Core → login News → Core JWT valid
[ ] **Aktivitas poin** — baca artikel, share, bookmark, quiz, poll, komentar → satu entri di `gamification_logs` Core, tidak double
[ ] **Daily login** — sekali per hari per user di Core
[ ] **Admin** — akun `NEWS_EDITOR` akses `/admin/*`; non-editor ditolak
[ ] **Leaderboard** — konsisten dengan saldo Core
[ ] **Core down** — keputusan: graceful degrade (baca artikel OK, award queue/retry) — dokumentasikan di runbook
[ ] **Staging end-to-end** — checklist QA sebelum production cutover
[ ] **Update dokumen ini** — tandai item selesai; sync `ecosystem-integration.md` §5

#### Production cutover

[ ] **Prod:** Core deploy + Clerk webhook + sync `CORE_JWT_PUBLIC_KEY` production
[ ] Verifikasi E2E staging/prod — `bun run verify:core`

#### Gap Core — koordinasi *(tidak memblok cutover minimal)*

[ ] Username global di Core — **sementara tetap News DB**
[ ] Profil extended (bio) di Core — **sementara tetap `user_profiles` News**
[ ] Endpoint riwayat transaksi user — **sementara tampilkan snapshot JWT di `/points`**
[ ] Spend poin, membership, notifikasi — Fase E

### 📦 Halaman — Belum Ada / Belum Selesai

[ ] `app/(user)/activity/page.tsx` — riwayat aktivitas user
[ ] `app/(admin)/admin/leaderboard/page.tsx` — monitor leaderboard dari admin
[ ] `app/(admin)/admin/points/page.tsx` — monitor semua transaksi poin
[ ] `app/(admin)/admin/activity-log/page.tsx` — audit log aksi admin

### ⚙️ Keamanan & Kualitas — *pre-launch / production*

[~] **Image moderation AI wajib di production** — set `IMAGE_MODERATION_ENDPOINT` + `IMAGE_MODERATION_API_KEY` (HTTP API generik; bisa wrapper AWS Rekognition, Google Vision, Sightengine, dll.)
[~] **Konfigurasi Redis/Upstash di production** — set `UPSTASH_REDIS_REST_*` atau `REDIS_URL` sebelum go-live multi-instance Vercel
[ ] **Backfill sanitasi konten lama di DB** — re-sanitize artikel/info page yang sudah ada sebelum sanitasi diterapkan
[ ] **Sentry SDK + alert channel terpusat** — ganti/extend monitoring webhook-only
[ ] **Log drain / file persistence** — export log dari Vercel ke storage terpusat

### 💬 Engagement & Sosial — *Fase E (Core Service)*

[ ] **In-app notifications** — notifikasi artikel diapprove/ditolak, komentar baru, poin diterima
[ ] **Follow / subscribe kategori** — user bisa subscribe kategori dan dapat notifikasi artikel baru

### 🏆 Poin, Leaderboard & Badge — *Fase E (Core Service)*

[ ] **Monthly leaderboard** — rolling window 30 hari
[ ] **All-time leaderboard** — total poin sepanjang waktu
[ ] **Filter leaderboard by app** — `source_app = news` vs `all`
[ ] **Global leaderboard** — gabungan poin dari semua app (`source_app = all`)
[ ] **Badge / level pada leaderboard** — indikasi visual pencapaian user
[ ] **Monthly / all-time quiz leaderboard per quiz**
[ ] **Export riwayat poin** — download CSV transaksi poin milik user
[ ] **Riwayat aktivitas lengkap** — `core_activity_logs` viewer (`/activity`)

### 🛡️ Admin Monitoring & Audit — *Fase E (Core Service)*

[ ] **Activity audit log** — log semua aksi admin: siapa approve apa, siapa reject apa, kapan
[ ] **Monitor leaderboard di admin** — tampilan leaderboard dari sisi admin
[ ] **Monitor point transactions di admin** — semua transaksi poin, filter by user/tipe/periode
[ ] **Point transaction summary di admin** — total poin per periode, breakdown by activity type
[ ] **User growth tracking** — grafik registrasi user per hari/minggu

### 🌐 Ekosistem Lanjutan — *Fase D/E*

[ ] **LMS integration** — `kursus.jepangku.com` dengan shared user dan poin (Fase D)
[ ] Scaffold LMS — `@clerk/nextjs` + Clerk app sama; `User.id` = Clerk ID; `lib/core/` dari News (`application: LMS`); tanpa `lib/points.ts` lokal
[ ] **Super-admin / role hierarchy** — role `editor`, `moderator`, `instructor`, `student` (Fase E)
[ ] **Membership & payment** — plan, subscription, payment global (Fase E)
[ ] **Admin pusat** — admin lintas aplikasi (Fase E)
[ ] **Multi-app deployment** — subdomain production per app (Fase E)
[ ] **CI/CD pipeline** — otomasi deploy ke Vercel / VPS (Fase E)
[ ] **Mobile app** — React Native atau PWA (Fase E)

### 🚀 Soft Launch — *Fase A (ditunda)*

**Target:** 30–50 artikel + konten siap rilis publik. **Tidak diprioritaskan** sampai bug, fitur, dan integrasi Core selesai.

| Kategori          | Jumlah Artikel | Status      |
| ----------------- | -------------- | ----------- |
| News              | 6–10           | ⏳ Persiapan |
| Travel            | 6–8            | ⏳ Persiapan |
| Culture           | 4–6            | ⏳ Persiapan |
| Entertainment     | 6–10           | ⏳ Persiapan |
| Lifestyle         | 4–6            | ⏳ Persiapan |
| Work in Japan     | 3–5            | ⏳ Persiapan |
| Study in Japan    | 3–5            | ⏳ Persiapan |
| Review Produk     | 3–5            | ⏳ Persiapan |
| Event             | 3–5            | ⏳ Persiapan |
| **Total Artikel** | **38–60**      | ⏳ Persiapan |

[ ] Riset topik dan sumber untuk setiap kategori
[ ] Penulisan draft artikel (minimal 30 artikel untuk soft launch)
[ ] Penyuntingan dan quality check
[ ] Pengumpulan/pembuatan thumbnail/cover image
[ ] Konfigurasi kategori dan tag di admin
[ ] Publikasi artikel secara bertahap atau sekaligus
[ ] Testing: homepage, search, filter, leaderboard, quiz, poll

**Referensi:** `docs/soft-launch-content.md` — template lengkap dan guideline penulisan artikel per kategori

---

## ✅ Sudah Diimplementasi (Verified)

### 🔗 Penyatuan Shared Auth & Core Service — Fase 2 & 3

Kontrak: [`ecosystem-integration.md`](./ecosystem-integration.md) · Env dev: `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_JWT_*` — lihat §6.

#### Fase 1 — selesai (lokal)

[x] **DATABASE_URL lokal** — `postgresql://root:root@localhost:5432/jepangku_core` di `jepangku-core/.env`
[x] **Satu Clerk Application** — News & Core `CLERK_SECRET_KEY` selaras
[x] **Seed activity types News** di Core (`prisma/seed.ts`): `ARTICLE_SHARED`, `ARTICLE_BOOKMARKED`, `POLL_VOTED`, `COMMENT_CREATED`, `NEWS_QUIZ_COMPLETED`; `READ_ARTICLE`, `DAILY_LOGIN` sudah ada
[x] **Role admin portal** — `bun run db:sync-clerk` assign `NEWS_EDITOR` untuk `admin+clerk_test@jepangku.com`
[x] **Smoke test lokal** — sync Clerk, `POST /api/v1/gamification/award`, shadow token (`CORE_SHADOW_ENABLED`)

#### Fase 2 — News bridge

[x] **Env News** — `CORE_API_URL`, `CORE_SERVICE_TOKEN`, `CORE_SHADOW_ENABLED`, `CORE_DUAL_WRITE_ENABLED`
[x] **`lib/core/`** — `client.ts`, `auth.ts`, `gamification.ts`, `types.ts`, `activity-map.ts`, `config.ts`, `index.ts`
[x] **Shadow integration** — hook setelah login/JIT, log `core.shadow.token.*`, feature flag
[x] **Skrip sync** — `jepangku-core`: `bun run db:sync-clerk` (Clerk → Core + `NEWS_EDITOR`)
[x] **Dual-write poin** *(historis, pre-cutover)* — `dual-write.ts` + mapping activity + log mismatch

#### Fase 3 — Cutover penuh ke Core

[x] **Migrasi DB** — `20260609120000_phase3_core_cutover`: FK → Clerk ID; `users.id` = Clerk ID; drop `clerk_id`, `total_points`, `password_hash`
[x] **Core JWT** — cookie `core_session` via `lib/core/session.ts` + `/api/auth/me`
[x] **Auth refactor** — `getCurrentUser()`, `getCurrentAdmin()` / `hasNewsAdminAccess()`; `SessionUser.totalPoints` dari Core JWT
[x] **Poin via Core** — 7 endpoint aktivitas + daily login → `awardXp()` only (`lib/points.ts` thin wrapper)
[x] **UI & API poin** — Navbar, profile, points, leaderboard weekly, homepage, admin user detail dari Core
[x] **Hapus obsolete** — tabel `point_transactions`, `daily_login_rewards`; dual-write & shadow dihapus; seed tanpa poin lokal

### 🚀 Soft Launch — Halaman Statis

[x] About
[x] Contact
[x] Advertise
[x] Media Partner
[x] Career
[x] Internship
[x] Privacy Policy
[x] Terms of Service
[x] Disclaimer

### ⚙️ Keamanan & Kualitas — *Fase A (portal)*

[x] **Rate limiting** — `lib/rate-limit.ts` + `lib/rate-limit-store.ts`: backend Upstash REST / `REDIS_URL` / in-memory fallback otomatis; endpoint: submit/update artikel, vote, share, comment, reaction, quiz attempt, upload, read-complete, bookmark; log 429 + fallback saat Redis error. Rate limit auth via Clerk (bukan API login/register lokal)
[x] **Input sanitasi HTML** — `sanitize-html` via `lib/sanitizer.ts`: write + read artikel, komentar plain-text, profil, quiz/poll admin, info pages; whitelist tag/atribut; img hanya `http`/`https` (tanpa `data:` URI)
[x] **Image moderation (validasi file)** — `lib/image-moderation.ts`: magic bytes JPEG/PNG/GIF/WebP, cek MIME vs isi file, ukuran 100 B–10 MB; dipanggil di `POST /api/upload`
[x] **Image moderation (AI opsional)** — HTTP generik `IMAGE_MODERATION_ENDPOINT` + `IMAGE_MODERATION_API_KEY`; payload base64; reject jika `decision: reject` atau `moderation: unsafe`; tanpa env = skip (warn di prod)
[x] **Monitoring & alerting** — `lib/monitoring.ts`: `captureException` + webhook opsional `MONITORING_WEBHOOK_URL`; `GET /api/health` cek koneksi DB
[x] **Logging structured** — `lib/logger.ts` JSON console + `proxy.ts` log semua `/api/*` (requestId, method, path, IP); log rate limit, moderasi, exception

### 🔐 Auth & Akun — *Clerk bridge + fallback JWT lokal (Fase B portal)*

[x] **Integrasi Clerk di portal** — `@clerk/nextjs`, halaman `/sign-in` & `/sign-up`, `proxy.ts` proteksi route user/admin (Clerk) + fallback JWT lokal
[x] **Kolom `clerk_id` di DB portal** — migration `users.clerk_id` (unique, nullable); `password_hash` nullable untuk akun Clerk-only
[x] **JIT user provisioning** — upsert/find `users` by `clerk_id` (link by email jika ada); sync via `lib/auth/clerk-user.ts`
[x] **Refactor `lib/auth.ts`** — `getCurrentUser()` / `getCurrentAdmin()` dual path: Clerk session + lookup DB portal, atau JWT lokal
[x] **Abstraction session user** — tipe `SessionUser` (`lib/auth/types.ts`); API route tetap pakai helper auth
[x] **Feature flag auth** — `AUTH_PROVIDER=local|clerk` + `NEXT_PUBLIC_AUTH_PROVIDER` (rollback ke JWT lokal)
[x] **Deprecate auth lokal** — `/login` & `/register` redirect ke `/sign-in` & `/sign-up`; API login/register disabled (410)
[x] **Email verification** — Clerk
[x] **Forgot password / password reset** — Clerk
[x] **OAuth login** — Clerk (konfigurasi di Clerk Dashboard)
[x] **Session management UI** — Clerk User Profile / Account
[x] `@clerk/nextjs` + `ClerkProvider` (saat `AUTH_PROVIDER=clerk`)
[x] Halaman `/sign-in`, `/sign-up` (Clerk UI); `/login`, `/register` redirect ke Clerk bila perlu
[x] `users.clerk_id` + JIT provisioning (`lib/auth/clerk-user.ts`)
[x] `SessionUser` abstraction; `getCurrentUser()` / `getCurrentAdmin()` dual provider
[x] `AUTH_PROVIDER` / `NEXT_PUBLIC_AUTH_PROVIDER` feature flag
[x] `proxy.ts`: proteksi route + logging API (Clerk `auth.protect` atau cookie JWT lokal)
[x] Register: validasi uniqueness email/username, bcrypt hash, JWT cookie (mode `local`)
[x] Login: mendukung email atau username, cek status banned, JWT cookie (mode `local`)
[x] Logout: clear cookie (local) / Clerk `signOut` (clerk)
[x] `GET /api/auth/me`: session user (Clerk JIT atau JWT)
[x] Daily login points: `checkDailyLogin()` saat login/provisi Clerk
[x] Username change cooldown 14 hari (field `usernameChangedAt`, enforced di API + UI profile edit)

### 📰 Artikel — Publik, User & Admin

[x] `GET /api/articles`: search (title, excerpt, content), filter kategori (by slug), filter tag, sort (latest/popular/trending), pagination
[x] `GET /api/articles/[slug]`: increment view count, related articles by category, tags resolved
[x] `POST /api/articles/create`: auth required, slug generation, resolve kategori, create/link tag, status DRAFT atau PENDING_REVIEW
[x] `GET /api/articles/my`: daftar artikel milik user, termasuk catatan review terakhir
[x] `PUT /api/articles/[slug]/update`: ownership check, hanya DRAFT/REJECTED yang bisa diedit user, admin bisa update semua status
[x] `DELETE /api/articles/[slug]/delete`: ownership check, PUBLISHED tidak bisa dihapus non-admin
[x] `POST /api/articles/[slug]/read-complete`: +2 poin sekali per artikel, anti-duplikat via `awardPoints()`, update `readCompletedAt` di ArticleView
[x] `GET /api/articles/[slug]/share`: cek status `hasShared` per user
[x] `POST /api/articles/[slug]/share`: +5 poin, satu kali per user, increment `shareCount`, simpan record ArticleShare
[x] `GET /api/articles/[slug]/reviews`: riwayat review artikel (status + reviewer), hanya penulis
[x] `GET /api/articles/[slug]/revisions`: riwayat revisi konten artikel, hanya penulis
[x] `lib/article-audit.ts`: pencatatan revisi konten, status review, lastEditedBy admin
[x] Admin edit artikel: `changeNote` wajib; tercatat di `article_revisions`
[x] `components/ui/article-activity-modal.tsx`: modal gabungan riwayat revisi + review untuk penulis
[x] Banner "+2 POINTS AWARDED" muncul di halaman artikel setelah read complete
[x] Scroll detection di halaman detail artikel — trigger saat user sampai akhir konten
[x] **Admin: create artikel langsung dari panel** — `admin/articles/create`, `POST /api/admin/articles` (publish langsung / draft / antrian review)
[x] **Admin: edit artikel published** — `admin/articles/[id]/edit`, slug published tidak berubah otomatis saat judul diedit
[x] **Admin: archive artikel** — status `ARCHIVED` dari form edit + bulk archive
[x] **Admin: bulk action artikel** — checkbox di list + `POST /api/admin/articles/bulk` (approve/reject/archive/delete)
[x] **Admin: export data CSV/JSON** — `GET /api/admin/articles/export` (artikel; mengikuti filter aktif)
[x] **Admin artikel: filter + sort lengkap** — filter author, kategori, tanggal, search, sort latest/oldest/popular/published
[x] **Pagination di my-articles** — saat ini list mungkin tanpa pagination jika artikel banyak
[x] **Draft autosave** — simpan draft otomatis selama user mengetik di form submit/edit artikel
[x] **Preview sebelum submit** — user bisa preview artikel sebelum submit untuk review
[x] `app/(user)/submit-article`: RichTextEditor, image upload, pilih kategori/tag, simpan sebagai draft atau submit untuk review
[x] `app/(user)/edit-article/[id]`: pre-populate form dari API, flow submit sama dengan create
[x] `app/(user)/my-articles`: filter by status, preview catatan penolakan, aksi edit/submit/hapus, modal riwayat review
[x] `app/(public)/articles/page.tsx`: search box, filter kategori, filter tag (toggle panel via URL param `?tag=`), sort latest/popular/trending, pagination, tag populer
[x] `app/(public)/articles/[slug]/page.tsx`: read complete detection, bookmark toggle, share tracking, related articles, tag klikabel → filter artikel

### 🧩 Quiz

[x] `GET /api/quizzes`: daftar quiz, filter by status
[x] `GET /api/quizzes/[slug]`: detail quiz dengan questions + options (jawaban benar disembunyikan dari response)
[x] `POST /api/quizzes/[slug]/attempt`: one-attempt guard, per-answer scoring, award base points + bonus per-correct via `awardPoints()`
[x] Halaman list quiz publik
[x] Halaman detail quiz + submit jawaban
[x] Hasil quiz langsung tampil setelah submit

### 📊 Polling / Voting

[x] `GET /api/polls`: daftar polling, filter status, total votes per poll dihitung
[x] `GET /api/polls/[slug]`: detail polling, persentase per opsi dihitung
[x] `POST /api/polls/[slug]/vote`: multi-question support, duplicate guard per pertanyaan per user, award poin satu kali per poll
[x] Halaman list polling publik
[x] Halaman detail polling + vote + hasil

### 🔖 Bookmark

[x] `GET /api/bookmarks`: list artikel yang di-bookmark user
[x] `POST /api/bookmarks/[articleId]`: bookmark artikel, soft-delete aware (restore jika pernah di-bookmark), +1 poin (hanya sekali)
[x] `DELETE /api/bookmarks/[articleId]`: soft-delete (set `deletedAt`), decrement `bookmarkCount`
[x] Poin bookmark tidak diberikan ulang jika user hapus lalu bookmark ulang artikel yang sama
[x] `app/(user)/bookmarks`: list artikel yang di-bookmark

### 💬 Engagement & Sosial — *Fase A (portal)*

[x] **Sistem komentar** — komentar pada artikel, polling, dan kuis (model polimorfik), thread 1 level (balasan), edit/hapus milik sendiri, moderasi admin (sembunyikan/hapus), +2 poin sekali per target
[x] **Reaction / like artikel** — sistem reaksi polimorfik (`Reaction`, target ARTICLE/POLL/QUIZ/COMMENT). Konten: 9 reaksi (Love, Lol, Cute, Win, WTF, OMG, Geeky, Scary, Fail) dengan bar di atas kolom komentar; komentar: jempol naik/turun. Satu reaksi aktif per user per target (klik = toggle/ganti), tanpa poin, rate limit 30/menit
[x] Model `Comment` polimorfik (`targetType` ARTICLE/POLL/QUIZ + `targetId`), thread 1 level via `parentId`, soft-delete (`deletedAt`), moderasi (`status` VISIBLE/HIDDEN)
[x] `GET /api/comments?targetType=&targetId=`: thread publik (komentar HIDDEN/terhapus jadi placeholder bila punya balasan tampil)
[x] `POST /api/comments`: auth required, validasi + sanitasi plain-text (maks 1000), rate limit 10/menit, verifikasi target ada, +2 poin sekali per target via `awardPoints()`
[x] `PATCH/DELETE /api/comments/[id]`: edit & soft-delete milik sendiri (admin bisa hapus semua)
[x] `GET /api/admin/comments`: list moderasi dengan filter status/tipe + search + pagination
[x] `PATCH/DELETE /api/admin/comments/[id]`: sembunyikan/tampilkan + hapus permanen
[x] `components/CommentSection.tsx`: komponen reusable (form, balasan, edit, hapus, kontrol moderasi admin inline) — terpasang di halaman detail artikel, polling, kuis
[x] `app/(admin)/admin/comments/page.tsx`: halaman moderasi + tautan di dashboard admin

### 🏆 Leaderboard & Poin — *Portal (mingguan)*

[x] `GET /api/leaderboard/weekly`: rolling window 7 hari, group by userId, resolve display name dari profile
[x] `GET /api/points/my`: return 100 transaksi poin terakhir milik user
[x] Halaman leaderboard mingguan publik
[x] Halaman points user dengan riwayat transaksi lengkap + ikon per tipe aktivitas
[x] `app/(user)/points`: riwayat transaksi poin lengkap

### 🔍 Search & Discovery — *Fase A (portal)*

[x] **Dedicated search result page** — `/search?q=...` + `GET /api/search` dengan hasil artikel + quiz + poll sekaligus; Navbar & hero search mengarah ke `/search`
[x] **Trending articles discovery** — halaman `/trending` (grid + pagination, sort `weeklyViewCount`); homepage sidebar pakai algoritma yang sama + link "Lihat Semua"
[x] **Related tags di halaman artikel** — tag ditampilkan di detail artikel, klik → `/articles?tag=<slug>`
[x] **Popular / trending tags** — `GET /api/tags/popular` (agregasi `articleTag`), komponen `PopularTags` di `/articles`, halaman `/explore` + nav "Jelajahi"
[x] `GET /api/search?q=`: pencarian lintas artikel + kuis + polling (title/excerpt/content)
[x] `GET /api/tags/popular`: tag diurutkan jumlah artikel (`articleTag` groupBy)
[x] `GET /api/homepage`: trending sidebar memakai `weeklyViewCount` (konsisten dengan `sort=trending`)
[x] `app/(public)/search/page.tsx`: hasil gabungan artikel + kuis + polling dari `GET /api/search`
[x] `app/(public)/trending/page.tsx`: discovery artikel tren mingguan dengan pagination
[x] `app/(public)/explore/page.tsx`: hub tag populer, kategori, link trending
[x] Search icon di Navbar (desktop + mobile) redirect ke `/search?q=...`
[x] Kategori di homepage sebagai shortcut ke `/articles?category=slug`

### 👤 Profile & Discovery Author — *Fase A (portal)*

[x] **Author profile publik** — `/profile/[username]` + `GET /api/profile/[username]` (hanya user `active`, tanpa email/poin); bio, avatar, artikel published, `AuthorProfileCard` di artikel (bawah reaction, atas komentar); `AuthorLink` di artikel/komentar/leaderboard
[x] **Statistik penulis** — agregat publik: total artikel published, total views, total bookmark diterima (di profil publik & API)
[x] `app/(public)/profile/[username]/page.tsx` — profil publik author (bio, stats, artikel published)
[x] `components/AuthorProfileCard.tsx` + `AuthorLink.tsx` — kartu penulis & link ke profil

### 📈 Analytics Konten — *Fase A (portal)*

[x] **View analytics per artikel** — `article_views` time-series + `/admin/analytics/articles/[id]` (grafik harian, total vs unique visitors, periode 7/30/90 hari)
[x] **Content performance report** — `/admin/analytics/content` ranking views/bookmark/share per periode + link ke detail grafik
[x] **Admin: lihat statistik per kategori** — `/admin/analytics/categories` tabel + chart views & engagement per kategori
[x] **Statistik detail per quiz di admin** — `/admin/analytics/quizzes/[id]` attempt, user unik, distribusi skor, pass rate ≥70%, tren harian
[x] **Statistik detail per poll di admin** — `/admin/analytics/polls/[id]` breakdown per pertanyaan/opsi, tren vote harian

### 👤 Profile User

[x] `GET/PUT /api/profile`: get profile + stats, update displayName / bio / avatar
[x] Halaman profil: stats dari API, recent points, quick actions
[x] Edit profil: avatar upload, name/username (dengan cooldown 14 hari), displayName, bio
[x] Avatar upload terintegrasi profile edit
[x] `app/(user)/profile`: halaman profil user
[x] `app/(user)/profile/edit`: form edit profil

### 📤 Upload

[x] `POST /api/upload`: auth required, validasi tipe image + max 10MB, `validateImageBuffer` + `moderateImage`, upload ke Cloudflare R2 (graceful fallback jika unconfigured), simpan record ke tabel `File`
[x] `lib/r2.ts`: S3Client wrapper, `uploadToR2`, `deleteFromR2`, `getSignedUrlR2`, fallback path jika unconfigured
[x] `lib/image-moderation.ts`: validasi magic bytes/MIME/ukuran + moderasi AI opsional via env

### 🛡️ Admin — API

[x] `GET /api/admin/stats`: count artikel/user/quiz/poll
[x] `GET /api/admin/articles`: list artikel, filter status/author/kategori/tanggal/search/sort
[x] `POST /api/admin/articles`: buat artikel admin (DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED)
[x] `GET /api/admin/articles/[id]`: detail artikel untuk form edit admin
[x] `POST /api/admin/articles/bulk`: approve, reject, archive, delete massal
[x] `GET /api/admin/articles/export`: export CSV atau JSON dengan filter yang sama
[x] `GET /api/admin/articles/pending`: filter PENDING_REVIEW saja
[x] `POST /api/admin/articles/[id]/approve`: set PUBLISHED, buat record ArticleReview
[x] `POST /api/admin/articles/[id]/reject`: set REJECTED, buat record ArticleReview dengan catatan
[x] `PUT /api/admin/articles/[id]/featured`: toggle `isFeatured`
[x] `PUT /api/admin/articles/[id]/hot`: toggle `isHot`
[x] `GET/POST /api/admin/tags`: list dengan usage count, buat tag baru dengan slug, duplicate guard
[x] `DELETE /api/admin/tags/[id]`: guard hapus jika tag masih dipakai artikel
[x] `GET/PUT /api/admin/users`: search/filter, update role + status user
[x] `GET /api/admin/users/[id]`: detail user + artikel + transaksi poin + statistik
[x] `GET/POST /api/admin/categories`: CRUD dengan slug generation, duplicate guard
[x] `PATCH/DELETE /api/admin/categories/[id]`: update dengan rename check, delete dengan guard artikel
[x] `GET /api/admin/homepage`: return featured + hot articles
[x] `GET/POST /api/admin/polls`: list dengan filter, create dengan questions + options validasi
[x] `GET/PATCH/DELETE /api/admin/polls/[id]`: edit semua field + replace questions, delete hanya DRAFT
[x] `GET/POST /api/admin/quizzes`: list dengan filter, create dengan questions + options + correct answers
[x] `GET/PATCH/DELETE /api/admin/quizzes/[id]`: edit semua field + replace questions, delete hanya DRAFT

### 🛡️ Admin — Halaman

[x] `app/(admin)/admin/page.tsx`: stats cards, quick action links, preview artikel pending
[x] `app/(admin)/admin/homepage/page.tsx`: toggle featured/hot untuk semua artikel published, search, live data
[x] `app/(admin)/admin/tags/page.tsx`: CRUD tag, usage count, guard hapus
[x] `app/(admin)/admin/users/page.tsx`: list user dengan search + filter role, update role/status
[x] `app/(admin)/admin/users/[id]/page.tsx`: detail user + statistik + transaksi poin
[x] `app/(admin)/admin/articles/page.tsx`: list artikel admin, filter lengkap, bulk action, export, link edit
[x] `app/(admin)/admin/articles/create/page.tsx`: buat artikel admin (publish langsung)
[x] `app/(admin)/admin/articles/[id]/edit/page.tsx`: edit artikel semua status termasuk published
[x] `app/(admin)/admin/articles/review/page.tsx`: queue review + detail + approve/reject dengan catatan
[x] `app/(admin)/admin/categories/page.tsx`: CRUD kategori, toggle aktif/nonaktif, guard hapus, confirm modal
[x] `app/(admin)/admin/quizzes/page.tsx`: list quiz, filter status, aksi aktivasi/hapus, link ke edit
[x] `app/(admin)/admin/quizzes/create/page.tsx`: multi-question builder, marking jawaban benar, image upload per soal/opsi
[x] `app/(admin)/admin/quizzes/[id]/edit/page.tsx`: load data existing, same builder seperti create
[x] `app/(admin)/admin/polls/page.tsx`: list polling, filter status + tipe, aksi tutup/aktifkan/hapus
[x] `app/(admin)/admin/polls/create/page.tsx`: multi-question builder, image upload, toggle guest vote
[x] `app/(admin)/admin/polls/[id]/edit/page.tsx`: load data existing, same builder seperti create

### 🌐 Halaman Publik

[x] Homepage: featured article slider auto-advance, trending sidebar (`weeklyViewCount`), hero search → `/search`, latest articles grid, polls + quiz CTA, leaderboard preview, kategori grid
[x] `app/(public)/page.tsx` — homepage (featured slider, trending, polls/quiz, leaderboard, kategori)
[x] `app/(public)/polls/page.tsx`: list polling
[x] `app/(public)/polls/[slug]/page.tsx`: detail polling, vote, hasil persentase
[x] `app/(public)/quizzes/page.tsx`: list quiz
[x] `app/(public)/quizzes/[slug]/page.tsx`: detail quiz, submit jawaban, hasil langsung
[x] `app/(public)/leaderboard/page.tsx`: weekly leaderboard

### 🔧 Utilities & Infrastruktur

[x] `lib/auth.ts` + `lib/auth/*`: Clerk bridge, JWT lokal, `SessionUser`, feature flag
[x] `lib/rate-limit.ts` + `lib/rate-limit-store.ts`: rate limit Upstash / Redis / in-memory + fallback
[x] `lib/sanitizer.ts`: sanitasi HTML, plain-text, media URL
[x] `lib/monitoring.ts` + `lib/logger.ts`: exception capture, webhook, structured JSON log
[x] `lib/points.ts`: `awardPoints()` dengan idempotency via unique constraint + race condition handling
[x] `lib/slug.ts`: `createSlug` (user content) dan `createAdminSlug` (admin content)
[x] `lib/article-tags.ts`: `syncArticleTags`, `resolveCategoryId`
[x] `lib/admin-articles-query.ts`: filter/sort query builder admin articles
[x] `lib/db.ts`: Prisma client singleton
[x] `lib/seed.ts`: auto-seed DB dipanggil saat register/login/categories
[x] `components/ui/confirm-modal.tsx` + `useConfirm` hook: reusable confirm dialog
[x] `components/ui/review-history-modal.tsx` + `useReviewHistory` hook: modal riwayat review artikel
[x] `RichTextEditor` component: digunakan di submit/edit article

### 📦 Checklist Halaman — Sudah Selesai

[x] `app/(public)/profile/[username]/page.tsx` — profil publik author (bio, stats, artikel published)
[x] `GET /api/profile/[username]` — profil & artikel publik penulis
[x] `components/AuthorProfileCard.tsx` + `AuthorLink.tsx` — kartu penulis & link ke profil
[x] `app/(public)/page.tsx` — homepage (featured slider, trending, polls/quiz, leaderboard, kategori)
[x] `app/(public)/articles/page.tsx` — articles list (search, filter kategori, tag, sort)
[x] `app/(public)/articles/[slug]/page.tsx` — article detail (read complete, bookmark, share, related)
[x] `app/(public)/polls/page.tsx` — polls list
[x] `app/(public)/polls/[slug]/page.tsx` — poll detail (vote, hasil)
[x] `app/(public)/quizzes/page.tsx` — quizzes list
[x] `app/(public)/quizzes/[slug]/page.tsx` — quiz detail (attempt, hasil langsung)
[x] `app/(public)/leaderboard/page.tsx` — leaderboard mingguan
[x] `app/(user)/bookmarks/page.tsx` — list artikel yang di-bookmark
[x] `app/(user)/my-articles/page.tsx` — list artikel user + status + riwayat review
[x] `app/(user)/points/page.tsx` — riwayat transaksi poin lengkap
[x] `app/(user)/profile/page.tsx` — halaman profil (stats, recent points, quick actions)
[x] `app/(user)/profile/edit/page.tsx` — edit profil (avatar, name, bio, username cooldown)
[x] `app/(user)/submit-article/page.tsx` — submit artikel (RichTextEditor, upload, kategori, tag)
[x] `app/(user)/edit-article/[id]/page.tsx` — edit artikel (pre-populate, same flow)
[x] `app/(admin)/admin/page.tsx` — dashboard (stats, quick actions, pending preview)
[x] `app/(admin)/admin/homepage/page.tsx` — manage featured/hot artikel (full functional)
[x] `app/(admin)/admin/tags/page.tsx` — CRUD tag
[x] `app/(admin)/admin/users/page.tsx` — list + search + filter + update role/status user
[x] `app/(admin)/admin/users/[id]/page.tsx` — detail user (stats + poin + artikel)
[x] `app/(admin)/admin/articles/page.tsx` — list artikel admin (filter status)
[x] `app/(admin)/admin/articles/review/page.tsx` — review queue (approve/reject dengan catatan)
[x] `app/(admin)/admin/categories/page.tsx` — CRUD kategori (toggle aktif, guard hapus)
[x] `app/(admin)/admin/quizzes/page.tsx` — list quiz (filter, aktivasi, hapus)
[x] `app/(admin)/admin/quizzes/create/page.tsx` — buat quiz (multi-question builder)
[x] `app/(admin)/admin/quizzes/[id]/edit/page.tsx` — edit quiz
[x] `app/(admin)/admin/polls/page.tsx` — list poll (filter, tutup, aktivasi, hapus)
[x] `app/(admin)/admin/polls/create/page.tsx` — buat poll (multi-question builder)
[x] `app/(admin)/admin/polls/[id]/edit/page.tsx` — edit poll
[x] `app/(admin)/admin/articles/create/page.tsx` — admin buat artikel
[x] `app/(admin)/admin/articles/[id]/edit/page.tsx` — admin edit artikel

---

## 📌 Referensi

- `docs/README.md` — indeks dokumentasi News
- `docs/ecosystem-integration.md` — kontrak cutover & keputusan arsitektur v2
- `jepangku-core/docs/PHASE0-PHASE1.md` — runbook integrasi lintas-repo
- `jepangku-core/docs/ECOSYSTEM.md` · `jepangku-core/docs/API.md` — spesifikasi Core
- `docs/development-roadmap.md` — roadmap berfase (Fase 0–E)
- `docs/technical-architecture.md` — stack & posisi ekosistem
- `docs/feature-status.md` — dokumen ini (status + checklist penyatuan)
- `.agents/04-project-steering.md` — prioritas proyek
- `.agents/05-ecosystem-strategy.md` — visi produk (bagian 8–12 = v1)
- `.agents/01-mvp-scope.md` · `.agents/02-user-flow.md` · `.agents/03-database-erd.md`
- `docs/cloudflare-r2-setup.md` · `docs/soft-launch-content.md`
