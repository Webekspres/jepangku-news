# Langkah Selanjutnya — Penyatuan Core + News

Dokumen ini melengkapi checklist di [`feature-status.md`](./feature-status.md).
**Yang sudah dikerjakan otomatis** vs **yang perlu Anda set manual** di environment.

---

## ✅ Baru selesai (kode)

| Item | Lokasi |
| :--- | :--- |
| Seed activity types Portal Berita | `jepangku-core/prisma/seed.ts` |
| Client Core (`lib/core/*`) | `jepangku-news/lib/core/` |
| Shadow token setelah login | `jepangku-news/lib/auth.ts` + `lib/core/shadow.ts` |
| Mapping aktivitas portal → Core | `jepangku-news/lib/core/activity-map.ts` |

---

## 1. Core — env & database *(Anda, ~15 menit)*

Di `jepangku-core/.env`:

```env
# Wajib untuk /auth/token dan /gamification/award
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
CORE_SERVICE_TOKEN="<string-random-panjang>"
CLERK_WEBHOOK_SECRET="whsec_..."   # dari Clerk Dashboard → Webhooks
```

Generate RSA key (PowerShell / Git Bash):

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
# Salin isi private.pem ke JWT_PRIVATE_KEY (escape \n per baris)
```

Jalankan seed activity types:

```bash
cd jepangku-core
bun run db:seed
bun dev
```

Verifikasi: `curl http://localhost:8080/health`

---

## 2. Clerk webhook *(Anda)*

Di [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks:

- URL: `https://<core-host>/api/v1/auth/webhooks/clerk` (lokal: pakai ngrok/cloudflare tunnel)
- Events: `user.created`, `user.updated`, `user.deleted`
- Secret → `CLERK_WEBHOOK_SECRET` di Core **saja**

Pastikan `CLERK_SECRET_KEY` Core = `CLERK_SECRET_KEY` News (satu Clerk app).

---

## 3. News — env shadow *(Anda)*

Di `jepangku-news/.env`:

```env
CORE_API_URL="http://localhost:8080"
CORE_SHADOW_ENABLED="true"
# CORE_SERVICE_TOKEN=...  # nanti Fase 2.4 dual-write / Fase 3 cutover
```

Restart `bun dev` News → login → cek log server:

- Sukses: `core.shadow.token.ok`
- Gagal (Core down / user belum di-sync): `core.shadow.token.failed` — login tetap OK

---

## 4. Assign admin di Core *(setelah user ada di Core DB)*

Setelah admin login sekali (webhook sync), assign role di DB Core:

```sql
-- contoh: beri NEWS_EDITOR ke user admin
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'admin+clerk_test@jepangku.com'
  AND r.code = 'NEWS_EDITOR'
ON CONFLICT DO NOTHING;
```

---

## 5. Urutan implementasi berikutnya (Fase 2–3)

| Urutan | Task | Repo |
| :---: | :--- | :--- |
| 1 | Smoke test manual: webhook → token → award (Postman) | Core |
| 2 | Set `CORE_SERVICE_TOKEN` di News `.env` | News |
| 3 | Dual-write poin di `lib/points.ts` → Core `awardXp()` | News |
| 4 | Skrip `scripts/sync-users-to-core.ts` | News |
| 5 | Migrasi FK → Clerk ID (Prisma migration) | News |
| 6 | Cutover: hapus poin lokal, UI dari Core JWT | News |

Detail per file: [`feature-status.md` § Penyatuan](./feature-status.md#-penyatuan-shared-auth--core-service).

---

## 6. Troubleshooting shadow

| Gejala | Penyebab | Solusi |
| :--- | :--- | :--- |
| `CORE_NOT_CONFIGURED` | `CORE_API_URL` kosong | Set env News |
| `AUTH_NOT_CONFIGURED` / 503 | `JWT_PRIVATE_KEY` kosong di Core | Generate key, restart Core |
| `USER_NOT_FOUND` / 404 | User belum di Core DB | Setup webhook atau login trigger sync |
| `INVALID_SESSION` / 401 | Clerk key beda antar app | Samakan `CLERK_SECRET_KEY` |
| Shadow tidak jalan | `CORE_SHADOW_ENABLED` bukan `true` | Set env + restart |
