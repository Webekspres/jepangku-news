# Testing — Jepangku News

## One command

```bash
bun run test:db:prepare   # migrate + seed test DB (first time / CI)
bun dev                   # in another terminal, for integration + E2E
bun run test              # unit → integration → E2E (Playwright)
```

Quick smoke (unit + API smoke + homepage/auth E2E on Chromium):

```bash
bun run test:smoke
```

## Scripts

| Script | What it runs |
| :--- | :--- |
| `bun run test` | `test:unit` + `test:integration` + `test:e2e` |
| `bun run test:unit` | `bun:test` in `tests/unit/` |
| `bun run test:integration` | `bun:test` in `tests/integration/` (needs running server) |
| `bun run test:e2e` | Playwright in `e2e/` |
| `bun run test:smoke` | unit + integration smoke + Chromium homepage/auth |
| `bun run test:db:prepare` | migrate deploy + seed using `.env.test` |

## Clerk test accounts

See [`fixtures/clerk-accounts.ts`](./fixtures/clerk-accounts.ts). OTP for all `+clerk_test@` emails: **424242**.

| Role | Email |
| :--- | :--- |
| guest | (no login) |
| USER | `budi+clerk_test@jepangku.com` |
| CONTRIBUTOR | `kontributor+clerk_test@jepangku.com` |
| ADMIN | `admin+clerk_test@jepangku.com` |

After creating users in Clerk dev, run `bun run test:db:prepare` so portal `users.id` matches Clerk IDs.

## Layout

```text
tests/
  unit/           # Pure logic (no server)
  integration/    # HTTP smoke against running Next.js
  api/            # Phase 2 API integration (~200 cases)
  fixtures/       # Shared test constants (Clerk accounts)
  helpers/        # preload, auth, api-client, server probe
e2e/              # Playwright browser tests (existing)
```
