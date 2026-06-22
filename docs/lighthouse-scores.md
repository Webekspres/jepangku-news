# Lighthouse — Homepage

> **Diperbarui:** 2026-06-22 · URL: `http://localhost:3001/` (production build)  
> **Konteks:** bagian dari QA non-functional portal — status aplikasi ✅ selesai ([`feature-status.md`](./feature-status.md)).

| Form factor | Performance | Accessibility | Best practices | SEO |
| :--- | ---: | ---: | ---: | ---: |
| mobile | 42 | 96 | 75 | 100 |
| desktop | 89 | 96 | 78 | 100 |

Baseline sebelum QA (Juni 2026): Mobile **34** / Desktop **53** (performance).

## Perbaikan post-QA (kode, Juni 2026)

- LCP featured: hapus animasi opacity Framer pada gambar unggulan; `fetchPriority=high` + `priority` slide pertama
- Kontras WCAG: rank trending `text-jepang-red-hover` (#c4181e)
- Clerk `telemetry={false}` — kurangi error console ke `clerk-telemetry.com`
- Security headers di `next.config.ts` — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` *(aktif setelah `bun run build && bun run start`)*

**Best practices** yang tersisa terutama dari Clerk third-party cookies (auth) — wajar di localhost; production HTTPS + domain prod biasanya lebih baik.

Jalankan ulang: `bun run build && bun run start` lalu `NEWS_BASE_URL=http://localhost:3000 bun run lighthouse:audit`.
