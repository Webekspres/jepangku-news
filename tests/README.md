# Testing — Jepangku News

Otomatis hanya **logika murni (unit)** dan **alur API inti (integration)**.  
UI/browser, layout, dan regresi visual → **QA manual** (lihat [`docs/testing-inventory.md`](../docs/testing-inventory.md)).

## Satu perintah

```bash
cp .env.test.example .env.test   # pertama kali — isi Clerk keys dari .env
bun run test:db:prepare          # migrate + seed DB test
bun run dev:test                 # terminal terpisah
bun run test                     # unit + integration API
```

Tanpa server: `bun run test:unit` saja (~156 kasus, <5 detik).

## Scripts (`package.json`)

| Script | Isi |
| :--- | :--- |
| `bun run dev` | Dev server (DB `.env`) |
| `bun run dev:test` | Dev server (DB test `.env.test`) |
| `bun run build` / `start` | Production build & serve |
| `bun run lint` | ESLint |
| `bun run db:seed` / `db:migrate` / `db:reset` | Database dev |
| `bun run test` | Unit + integration inti |
| `bun run test:unit` | `tests/unit/` saja |
| `bun run test:integration` | API inti — butuh `dev:test` |
| `bun run test:db:prepare` | Migrate + seed `jepangku_news_test` |
| `bun run test:db:cleanup` | Hapus data ephemeral setelah integration |

Skrip ops/audit ada di `scripts/` — jalankan langsung, mis. `bun scripts/verify-core-integration.ts`.

## Integration API yang dipertahankan

| File | Alur |
| :--- | :--- |
| `integration/smoke.test.ts` | Health, guest auth |
| `api/auth.test.ts` | Session, 401/410 |
| `api/articles.test.ts` | CRUD artikel, workflow status |
| `api/admin.test.ts` | RBAC admin 403 |
| `api/contributor.test.ts` | Apply, gate kontributor |
| `api/points.test.ts` | Ledger poin |
| `api/comments.test.ts` | Thread komentar dasar |

## Clerk test accounts

Lihat [`fixtures/clerk-accounts.ts`](./fixtures/clerk-accounts.ts). OTP `+clerk_test@`: **424242**.

| Role | Email |
| :--- | :--- |
| USER | `budi+clerk_test@jepangku.com` |
| CONTRIBUTOR | `kontributor+clerk_test@jepangku.com` |
| ADMIN | `admin+clerk_test@jepangku.com` |

## Layout

```text
tests/
  unit/           # Pure logic (no server)
  integration/    # HTTP smoke
  api/            # Alur API inti (7 file)
  fixtures/       # Clerk accounts
  helpers/        # preload, auth, api-client
```

## CI/CD

Job `test` di [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. `bun run lint`
2. `bun run test:db:prepare` (PostgreSQL service + migrate + seed)
3. `bun run dev:test` → tunggu `/api/health`
4. `bun run test` (unit + integration)

Secrets environment **staging**: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
