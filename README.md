# Jepangku News

Portal berita interaktif bertema Jepang — artikel, quiz, polling, leaderboard, dan gamifikasi via **JepangKu Core**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

| Status | Keterangan |
| :--- | :--- |
| MVP portal | ✅ |
| Auth | **Clerk SSO** (shared app dengan LMS) |
| Integrasi Core | **Fase 1 + 3 coded** — JWT verify, award XP, admin gate |
| QA production | ⏳ staging / deploy |

## Stack

Next.js 16 · React 19 · Clerk · Prisma 7 · PostgreSQL · Cloudflare R2 · **jepangku-core** (`lib/core/`)

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

Isi `.env.local` dari [`.env.example`](.env.example). Variabel penting integrasi:

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

Verifikasi:

```bash
bun run verify:core
```

Core harus jalan di `http://localhost:8080`.

## Alur integrasi

```text
Clerk login → exchange Core JWT (lib/core/auth.ts)
    → verify signature (lib/core/verify-jwt.ts)
    → profil + poin dari Core claims / API
    → award XP via POST /api/v1/gamification/award
```

## Dokumentasi

| Dokumen | Isi |
| :--- | :--- |
| [docs/README.md](docs/README.md) | Indeks dokumentasi |
| [docs/ecosystem-integration.md](docs/ecosystem-integration.md) | Kontrak cutover News ↔ Core |
| [docs/feature-status.md](docs/feature-status.md) | Status implementasi (living doc) |
| [docs/development-roadmap.md](docs/development-roadmap.md) | Roadmap produk |
| [docs/cloudflare-r2-setup.md](docs/cloudflare-r2-setup.md) | Setup media R2 |
| [jepangku-core/docs/PHASE0-PHASE1.md](../jepangku-core/docs/PHASE0-PHASE1.md) | Runbook integrasi lintas-repo |

## Struktur

```text
app/           # Routes (public, user, admin, auth)
lib/core/      # Client Core — token, award, verify JWT
lib/auth/      # Clerk session + JIT user sync
prisma/        # Schema portal (profil lokal; id = Clerk ID)
docs/          # Dokumentasi proyek
.agents/       # Scope MVP & steering (historis)
```

## Deploy

**Vercel** — set env dari `.env.example`, pastikan `bun run build` sukses. Detail R2: [docs/cloudflare-r2-setup.md](docs/cloudflare-r2-setup.md).

---

Dikembangkan oleh [Webekspres](https://webekspres.id) · Repo private
