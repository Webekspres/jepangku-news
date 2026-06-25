# Design System — Jepangku News

Panduan visual resmi untuk portal berita Jepangku. Menggantikan gaya neo-brutalism sebelumnya agar selaras dengan logo dan brand guideline.

## Filosofi Brand

Kombinasi warna melambangkan **semangat, kreativitas, kepercayaan, dan keseimbangan**. UI harus terasa modern, profesional, dan energik — bukan mentah atau kasar seperti neo-brutalism.

### Hindari (neo-brutalism)

| Jangan pakai | Ganti dengan |
| :--- | :--- |
| Hard shadow `4px 4px 0 #000` | Soft shadow `shadow-jepang` / `shadow-jepang-lg` |
| `border-2 border-foreground` | `border border-jepang-border` |
| `border-radius: 0` | `rounded-lg` / `rounded-lg` |
| Semua huruf UPPERCASE + tracking lebar | Sentence case, tracking normal |
| Hitam murni `#0a0a0a` sebagai warna utama | Navy brand `#1E1B57` |

---

## Palet Warna

| Token Tailwind | Hex | Penggunaan |
| :--- | :--- | :--- |
| `jepang-red` | `#EC1D24` | Aksen merah Jepang — badge, link, highlight |
| `jepang-orange` | `#FF4B2B` | CTA utama — tombol, navbar accent, hover aktif |
| `jepang-navy` | `#1E1B57` | Warna gelap utama — teks, footer, header gelap |
| `jepang-grey` | `#99999A` | Teks sekunder, label muted |
| `jepang-off-white` | `#F8F8FA` | Background section alternatif |
| `jepang-border` | `#E8E8EC` | Border card, input, divider |

### Alias kompatibilitas

- `jepang-black` → sama dengan `jepang-navy` (untuk kode lama)
- `foreground` → `#1E1B57` (navy)

### Hover states

| Token | Hex |
| :--- | :--- |
| `jepang-red-hover` | `#C4181E` |
| `jepang-orange-hover` | `#E03D20` |

---

## Tipografi

| Peran | Font | Token / Class |
| :--- | :--- | :--- |
| Body & UI | **DM Sans** | `font-sans` (default body) |
| Heading & display | **Outfit** | `font-heading` |
| Teks Jepang | **Noto Sans JP** | `font-japanese` |
| Mono / data | **IBM Plex Mono** | `font-mono` |

### Font brand (lisensi)

Brand guideline menetapkan:

- **Nuku Nuku** — font display logo & heading utama
- **HOT-白舟極太楷書教漢 E** — aksen kaligrafi Jepang

Saat file font tersedia, tambahkan `@font-face` di `app/globals.css` dan ganti fallback di `@theme`. Sementara ini, **Outfit** dan **Noto Sans JP** dipakai sebagai pengganti web-safe.

### Utility label

```html
<p class="section-label">最新 / TERBARU</p>
```

Gunakan untuk label section kecil berwarna merah — bukan `uppercase tracking-[0.2em]`.

---

## Radius & Shadow

Didefinisikan di `@theme` (`globals.css`):

| Token | Nilai |
| :--- | :--- |
| `radius-sm` | 0.375rem |
| `radius-md` | 0.5rem |
| `radius-lg` | 0.75rem |
| `radius-xl` | 1rem |

| Class | Efek |
| :--- | :--- |
| `shadow-jepang` | `0 4px 16px rgba(30,27,87,0.08)` |
| `shadow-jepang-lg` | `0 8px 24px rgba(30,27,87,0.12)` |

---

## Komponen

### Tombol (`Button`)

- Primary CTA: `variant="default"` → orange `#FF4B2B`
- Secondary gelap: `variant="black"` → navy
- Sudut: `rounded-lg`
- Teks: sentence case, **bukan** uppercase

### Card

- `rounded-lg border border-jepang-border shadow-sm`
- Hover: `hover:shadow-md`

### Badge

- `rounded-md`, font semibold, tanpa uppercase wajib

### Input

- `rounded-lg`, focus ring orange subtle

### Navbar

- Top spacer: navy (`jepang-navy`)
- Bottom accent bar: orange (`jepang-orange`)
- Link nav: sentence case, hover orange

### Footer

- Background: `bg-jepang-navy`
- Section heading: `section-label text-jepang-orange`

---

## Logo

| Varian | File | Konteks |
| :--- | :--- | :--- |
| Light background | `public/assets/images/logo/logo-03.svg` | Navbar |
| Dark background | `public/assets/images/logo/logo-02-dark.svg` | Footer |
| Full color | `public/assets/images/logo/logo-01.svg` | Marketing |

---

## Implementasi Teknis

| File | Isi |
| :--- | :--- |
| `app/globals.css` | `@theme` tokens, utility classes, article content |
| `components/ui/*` | shadcn primitives (button, card, badge, input) |
| `lib/clerk-appearance.ts` | Tema Clerk auth |
| `components/Providers.tsx` | Sonner toast styling |

Tidak ada `tailwind.config.js` — konfigurasi via Tailwind CSS v4 `@theme` di `globals.css`.

---

## Checklist Review UI Baru

Saat menambah komponen atau halaman:

- [ ] Warna dari token `@theme`, bukan hex hardcoded
- [ ] Tidak ada `shadow-[4px_4px_0px_...]`
- [ ] Border tipis `border-jepang-border`, bukan `border-2`
- [ ] Sudut membulat minimal `rounded-lg`
- [ ] CTA pakai orange, highlight pakai red
- [ ] Teks gelap pakai navy, bukan hitam murni
