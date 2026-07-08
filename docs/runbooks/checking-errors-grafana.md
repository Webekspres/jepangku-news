# Panduan Grafana — Cek Error & Log jepangku-news

Portal Berita mengirim log JSON ke **stdout** (Pino) → Promtail → Loki → Grafana. Dokumen ini panduan praktis untuk **mendeteksi dan menyelidiki error** di production.

> Stack logging di-host di repo [`jepangku-infra`](../../jepangku-infra/logging/README.md). Akses Grafana via SSH tunnel (tidak ada domain publik).

---

## Prasyarat

1. Akses SSH ke VPS (`103.25.223.16`, port `8288`, user `developer`)
2. Password Grafana: `ssh 103.25.223.16 "cat ~/jepangku-grafana-password.txt"`
3. Buka tunnel Grafana:

```bash
ssh -L 3040:127.0.0.1:3040 103.25.223.16
# Browser: http://localhost:3040  (user: admin)
```

---

## Format log aplikasi

Setiap baris log production adalah JSON dengan field standar:

| Field | Contoh | Kegunaan |
| :--- | :--- | :--- |
| `service` | `jepangku-news` | Filter di Grafana (label Loki) |
| `level` | `info`, `warn`, `error` | Severity |
| `module` | `http`, `auth`, `core.client` | Sub-sistem |
| `msg` | `request.start`, `core.client.http_error` | Event name |
| `reqId` | UUID | Korelasi satu request |
| `method`, `path` | `GET`, `/api/articles` | HTTP context |
| `status` | `401`, `500` | HTTP status (jika ada) |
| `durationMs` | `142` | Latency request |
| `errorMessage` | teks error | Detail kegagalan |

Contoh log error:

```json
{
  "level": "error",
  "service": "jepangku-news",
  "module": "core.client",
  "msg": "core.client.http_error",
  "path": "/api/v1/users/me",
  "status": 401,
  "durationMs": 4,
  "code": "INVALID_TOKEN"
}
```

---

## Langkah cepat: ada laporan error

### 1. Buka dashboard

Grafana → **Dashboards** → **Jepangku — Logging Dashboard**

- Pastikan variabel **`service`** = `jepangku-news`
- Rentang waktu: **Last 1 hour** (atau saat insiden)

Panel yang dicek dulu:

| Panel | Yang dicari |
| :--- | :--- |
| 🔥 Error Rate per Module | Modul mana yang paling banyak error |
| 📈 Error Trend per Jam | Kapan spike dimulai |
| 📊 HTTP Status Distribution | Dominan 4xx atau 5xx |
| 🐌 Top 10 Slowest Endpoints | Endpoint lambat (bukan selalu error) |

### 2. Drill-down di Explore

**Explore** → datasource **Loki** → query:

```logql
{service="jepangku-news"} | json | level="error"
```

Filter tambahan:

```logql
# Error modul tertentu
{service="jepangku-news"} | json | level="error" | module="core.client"

# Error 5xx saja
{service="jepangku-news"} | json | level="error" | status >= 500

# Satu endpoint bermasalah
{service="jepangku-news"} | json | path="/api/notifications/unread-count"

# Korelasi satu request (dari reqId di response header x-request-id)
{service="jepangku-news"} | json | reqId="b62233c8-a295-459b-94be-ce958e8f3807"
```

### 3. Lacak alur satu request HTTP

```logql
{service="jepangku-news"} | json | module="http" | path="/api/..."
```

Urutan normal: `request.start` → (log modul lain) → `request.end` dengan `status` dan `durationMs`.

Jika hanya `request.start` tanpa `request.end` → kemungkinan timeout, crash, atau request terputus.

---

## Skenario umum

### A. Banyak 401 / `INVALID_TOKEN` di `core.client`

**Gejala:** `core.client.http_error`, status `401`, `core.user_me.fetch.failed`

**Penyebab umum:** token Core expired, Core down, atau cookie `core_session` tidak valid.

**Langkah:**
1. Cek health Core: `curl http://127.0.0.1:8080/health` (di VPS)
2. Lihat runbook: [`core-service-down.md`](./core-service-down.md)
3. Query: `{service="jepangku-news"} | json | module="core.client" | level="warn"`

### B. Spike 5xx di satu endpoint API

```logql
{service="jepangku-news"} | json | status >= 500 | line_format "{{.method}} {{.path}} — {{.msg}}"
```

Ambil `reqId` dari baris error → cari semua log dengan `reqId` yang sama untuk melihat rantai kegagalan.

### C. Endpoint lambat (bukan error)

Dashboard panel **P95** atau:

```logql
{service="jepangku-news"} | json | durationMs > 3000 | line_format "{{.path}} {{.durationMs}}ms"
```

### D. Error setelah deploy

Dashboard punya anotasi **Deploy Events**. Bandingkan waktu deploy dengan panel **Error Trend**.

Alternatif di Explore:

```logql
{service="jepangku-news"} |= "deploy"
```

---

## Cek dari server (tanpa Grafana UI)

```bash
# Log mentah container portal (5 baris terakhir)
docker logs --tail 20 jepangku_portal 2>&1 | tail -5

# Hanya baris error (grep sederhana)
docker logs --since 10m jepangku_portal 2>&1 | grep '"level":"error"'

# Verifikasi stack logging
bash ~/Jepangku-infra/deploy/scripts/vps-verify-logging.sh
```

---

## Alert otomatis (Loki Ruler)

Alert rules didefinisikan di `jepangku-infra/logging/loki/rules/`. Contoh:

| Alert | Kondisi |
| :--- | :--- |
| `JepangkuNews_HighErrorRate` | >5 error/menit selama 2 menit |
| `JepangkuNews_High5xxRate` | 5xx rate >10% dalam 5 menit |
| `JepangkuNews_CrashLoop` | >3 error/fatal dalam 1 menit |

**Notifikasi** (Telegram/Slack/email) diset manual di Grafana → **Alerting → Contact points**.

---

## Development lokal

Di `NODE_ENV=development`, log di-pretty-print (bukan JSON). Untuk uji format production:

```bash
NODE_ENV=production LOG_LEVEL=info npm run start
# atau jalankan scripts/verify-logging-e2e.sh (stack Docker lokal)
```

Env opsional:

| Env | Default | Fungsi |
| :--- | :--- | :--- |
| `LOG_LEVEL` | `info` | `debug` untuk investigasi detail |
| `LOG_SERVICE_NAME` | `jepangku-news` | Override label `service` di Loki |

---

## Troubleshooting

| Masalah | Solusi |
| :--- | :--- |
| Tidak ada log `jepangku-news` di Grafana | Pastikan image portal sudah di-redeploy dengan `lib/logger.ts` terbaru (`base.service`) |
| Dashboard kosong tapi Explore ada data | Cek variabel `service` di dashboard = `jepangku-news` |
| Hanya label `container=jepangku_portal` | Normal untuk log lama; setelah redeploy muncul juga `service=jepangku-news` |
| `level="error"` tidak match | Pastikan build terbaru (level string, bukan angka Pino 30/40/50) |
| Grafana tidak bisa dibuka | Tunnel SSH aktif? `ssh -L 3040:127.0.0.1:3040 ...` |

---

## Referensi

- Infra logging & Grafana: [`jepangku-infra/logging/README.md`](../../jepangku-infra/logging/README.md)
- Runbook Core down: [`core-service-down.md`](./core-service-down.md)
- Implementasi logger: [`lib/logger.ts`](../lib/logger.ts), [`lib/logging/request-logger.ts`](../lib/logging/request-logger.ts)
