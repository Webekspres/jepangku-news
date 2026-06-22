# Jepangku News

Portal berita interaktif bertema Jepang — artikel, kuis, polling, leaderboard, gamifikasi, dan admin CMS lengkap.

[Next.js](https://nextjs.org/)
[TypeScript](https://www.typescriptlang.org/)
[Status](docs/feature-status.md)

## Ringkasan proyek


|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Nama**       | Jepangku News (portal berita ekosistem Jepangku)   |
| **Status**     | ✅ **Sepenuhnya diimplementasi** — production-ready |
| **Production** | [jepangku.com](https://jepangku.com)               |
| **Staging**    | `dev.jepangku.com`                                 |
| **Repo**       | Private — [Webekspres](https://webekspres.id)      |
| **Diperbarui** | Juni 2026                                          |


### Domain ekosistem


| App                   | Production            | Peran                                                 |
| --------------------- | --------------------- | ----------------------------------------------------- |
| **News** *(repo ini)* | `jepangku.com`        | Artikel, kuis, poll, poin, leaderboard portal         |
| **Core**              | `core.jepangku.com`   | Identitas global, JWT, XP/level (LMS)                 |
| **LMS**               | `kursus.jepangku.com` | Kursus & badge *(integrasi penuh = rencana lanjutan)* |


### Stack teknis

Next.js 16 · React 19 · TypeScript · Clerk · Prisma 7 · PostgreSQL · Cloudflare R2 · Upstash Redis · Resend · **jepangku-core** (`lib/core/`)

### Fitur utama (semua selesai)

- Auth Clerk SSO + bridge Core JWT
- Artikel dengan workflow kontributor (apply → review → publish)
- Kuis, polling, komentar, reaksi emoji, bookmark
- Gamifikasi poin & leaderboard (ledger `point_transactions` di News DB)
- Homepage wave lazy-load (10 section: feed, TV, iklan, LMS teaser, engagement)
- Notifikasi realtime (bell + SSE), email outbox, modal daily poin & welcome
- Newsletter subscribe/unsubscribe + admin
- Admin CMS — artikel, users, analytics, moderasi, monitoring poin
- Keamanan — rate limit, sanitasi XSS, upload moderation, security headers

### Rencana lanjutan *(bukan blokir rilis)*

Hanya integrasi ekosistem lintas-app — lihat `[docs/feature-status.md](docs/feature-status.md#rencana-lanjutan--bisa-nanti-ekosistem-fase-de)`:

- LMS integration penuh (shared Clerk/Core di kursus)
- Katalog `/kursus` single source of truth dari jepangkuLMS
- Role hierarchy super-admin lintas app
- Profil extended (bio) di Core
- Spend poin & membership

---

## Quick start

```bash
git clone https://github.com/Webekspres/jepangku-news.git
cd jepangku-news
bun install
cp .env.example .env.local
bunx prisma generate
bun run db:push    # atau migrate sesuai workflow tim
bun dev            # http://localhost:3000
```

Isi `.env.local` dari `[.env.example](.env.example)`. Variabel penting:

```env
# Clerk (satu app dengan Core & LMS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Core
CORE_API_URL=http://localhost:8080
CORE_SERVICE_TOKEN=<sama dengan jepangku-core>
CORE_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
CORE_JWT_ISSUER=https://core.jepangku.com
CORE_JWT_AUDIENCE=jepangku
```

Sync public key dari Core dev:

```bash
cd ../jepangku-core && bun run jwt:sync-public-key-to-clients
```

Core harus jalan di `http://localhost:8080`.

## Verifikasi & QA

```bash
bun run verify:core              # integrasi Core + ledger poin
bun run verify:home              # wave APIs homepage
bun run verify:notifications     # notifikasi + email hooks
bun run verify:non-functional    # 47 checks (keamanan, a11y, reliabilitas)
bun run verify:staging           # cutover staging
bun run test:e2e                 # Playwright (Chromium, Firefox, WebKit)
bun run lighthouse:audit         # skor performa (butuh production build)
```

Skor Lighthouse terbaru: `[docs/lighthouse-scores.md](docs/lighthouse-scores.md)` — Mobile **42** / Desktop **89**.

## Alur integrasi

```text
Clerk login → exchange Core JWT (lib/core/auth.ts)
    → verify signature (lib/core/verify-jwt.ts)
    → profil + role dari Core claims / API
    → poin portal dari News DB (bukan Core)
```

## Dokumentasi


| Dokumen                                                                       | Isi                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------- |
| [docs/README.md](docs/README.md)                                              | Indeks dokumentasi                              |
| [docs/feature-status.md](docs/feature-status.md)                              | **Status lengkap** — selesai + rencana lanjutan |
| [docs/testing-inventory.md](docs/testing-inventory.md)                        | Inventaris fitur & QA                           |
| [docs/ecosystem-integration.md](docs/ecosystem-integration.md)                | Kontrak cutover News ↔ Core                     |
| [docs/development-roadmap.md](docs/development-roadmap.md)                    | Roadmap fase (arsip)                            |
| [docs/backlog-plan.md](docs/backlog-plan.md)                                  | Arsip rencana teknis (selesai)                  |
| [docs/cloudflare-r2-setup.md](docs/cloudflare-r2-setup.md)                    | Setup media R2                                  |
| [jepangku-core/docs/PHASE0-PHASE1.md](../jepangku-core/docs/PHASE0-PHASE1.md) | Runbook integrasi lintas-repo                   |


## Struktur repo

```text
app/              # Routes (public, user, admin, auth)
components/       # UI komponen (home, admin, notifications, …)
lib/              # Business logic (core, auth, points, notifications, home, …)
prisma/           # Schema portal (users.id = Clerk ID)
scripts/          # verify:*, lighthouse, purge, backfill
e2e/              # Playwright specs
docs/             # Dokumentasi proyek
.agents/          # Scope MVP & steering (historis)
```

## Deploy

**Vercel** — set env dari `.env.example`, pastikan `bun run build` sukses. Detail R2: [docs/cloudflare-r2-setup.md](docs/cloudflare-r2-setup.md).

Runbook Core down: [docs/runbooks/core-service-down.md](docs/runbooks/core-service-down.md).

---

Dikembangkan oleh [Webekspres](https://webekspres.id) 