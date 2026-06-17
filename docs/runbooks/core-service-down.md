# Runbook: Core Service Down

Portal Berita (`jepangku-news`) dirancang **graceful degrade** saat Jepangku Core tidak tersedia. Poin, leaderboard, dan konten artikel tetap berjalan dari **News DB**.

## Gejala

- Log: `core.session.establish.failed`, `core.user_profile.fetch.failed`
- Cookie `core_session` tidak ter-set setelah login
- `coreRoles` kosong di session (admin via role lokal `ADMIN` tetap jalan)

## Yang tetap berfungsi (tanpa Core)

| Fitur | Sumber data |
| :--- | :--- |
| Baca artikel, quiz, poll, komentar | News DB |
| Poin aktivitas (`point_transactions`) | News DB — `awardPoints()` |
| Saldo navbar / `/points` | News DB |
| Leaderboard mingguan/bulanan | News DB — `lib/leaderboard/queries.ts` |
| Login Clerk + JIT user lokal | Clerk + `lib/auth/clerk-user.ts` |
| Admin lokal (`users.role = ADMIN`) | News DB |

## Yang terdegradasi (tanpa Core)

| Fitur | Perilaku |
| :--- | :--- |
| Core JWT / `core_session` | Tidak dibuat; login Clerk tetap sukses |
| Role dari Core (`PORTAL_ADMIN`) | Tidak tersinkron sampai Core kembali — gunakan role lokal `ADMIN` darurat |
| `GET /api/v1/users/me` | Diabaikan; `fetchCoreUserMe` return `null` |
| XP/level global Core | Tidak di-update (News tidak menampilkan level Core di UI poin) |

## Langkah respons

1. **Konfirmasi outage** — `curl $CORE_API_URL/health`
2. **Portal tetap online** — tidak perlu rollback News; konten & poin lokal OK
3. **Admin darurat** — jika perlu akses admin tanpa Core JWT, set `users.role = 'ADMIN'` di News DB untuk akun terkait
4. **Monitor log** — cari spike `core.session.establish.failed`
5. **Recovery** — saat Core kembali, user login ulang atau navigasi ulang untuk refresh `core_session` dan `coreRoles`

## Verifikasi setelah recovery

```bash
bun run verify:core
NEWS_BASE_URL=https://your-news-url CORE_API_URL=https://core.jepangku.com bun run verify:staging
```

Manual: login → cookie `core_session` → `/api/auth/me` berisi `coreRoles` untuk admin.

## Pencegahan

- Set `CORE_JWT_PUBLIC_KEY` + `CORE_JWT_ISSUER` di production News
- Health check Core di monitoring (uptime + latency)
- Clerk webhook hanya ke Core — pastikan webhook aktif agar user baru tersinkron sebelum login News
