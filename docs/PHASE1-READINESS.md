# Fase 1 — Selesai (kode)

## jepangku-news ✅

- `lib/core/verify-jwt.ts` — verify signature RS256
- `lib/core/session.ts` — verified claims; decode-only fallback jika public key belum diset
- `lib/auth/types.ts` — admin gate Core-only (`NEWS_EDITOR`, `CORE_ADMIN`)
- Leaderboard API + UI — `totalXp`, `period: all-time`
- `jose` dependency ditambahkan

## jepangkuLMS ✅

- `lib/core/gamification.ts`, `activity-map.ts`, `config.ts`
- `features/learning/actions/learning-actions.ts` — enrollment, lesson, quiz + Core award
- `lib/auth/lms-roles.ts` + gate `/admin/*` di `proxy.ts`
- `verify-jwt.ts` — deteksi private key salah

## Satu langkah manual

```bash
cd jepangku-core
bun run jwt:sync-public-key-to-clients   # setelah JWT_PRIVATE_KEY valid
```

Jika gagal, lihat troubleshooting di `jepangku-core/docs/PHASE0-PHASE1.md`.
