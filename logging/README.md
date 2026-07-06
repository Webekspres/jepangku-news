# Logging Stack — Jepangku News

Infrastruktur logging terpusat menggunakan **Pino → stdout → Promtail → Loki → Grafana**.

## Arsitektur

```
┌─────────────────────────────────────────────┐
│  Aplikasi Next.js                            │
│  Pino → stdout (JSON)                       │
└──────────────────┬──────────────────────────┘
                   │ Docker stdout
                   ▼
┌─────────────────────────────────────────────┐
│  Promtail (collector)                        │
│  Baca log dari Docker → kirim ke Loki       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Loki (penyimpanan & query)                  │
│  Retensi: 7 hari, storage: bind mount       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Grafana (dashboard & alerting)              │
│  http://localhost:3002 (admin/admin)         │
└─────────────────────────────────────────────┘
```

## Cara Jalankan

### 1. Jalankan stack logging

```bash
# Dari direktori jepangku-news/
cd logging

# Jalankan semua service (Loki → Promtail → Grafana)
docker compose -f docker-compose.logging.yml up -d

# Cek status
docker compose -f docker-compose.logging.yml ps
```

### 2. Buka Grafana

```
URL:      http://[VPS_IP]:3002
Username: admin
Password: admin  ← GANTI password setelah login pertama!
```

Datasource **Loki** sudah terdaftar otomatis (provisioning).

### 3. Lihat log

- **Explore** (sidebar kiri) → pilih datasource **Loki**
- Query label: `{container="jepangku-news"}` atau `{compose_service="app"}`
- Filter level: `{container="jepangku-news"} |= "error"`
- Filter JSON: `{container="jepangku-news"} | json | level="error"`

### 4. Gabung dengan docker-compose utama

Jika sudah punya `docker-compose.yml` utama:

```bash
docker compose -f docker-compose.yml -f logging/docker-compose.logging.yml up -d
```

## Log yang Tersedia

| Container | Label | Contoh Query |
|---|---|---|
| jepangku-news | `{container="jepangku-news"}` | Semua log aplikasi |
| jepangku-core | `{container="jepangku-core"}` | Log Core API |
| PostgreSQL | `{image="postgres:*"}` | Log database |
| Semua | `{}` | Semua container di VPS |

## Konfigurasi Penting

### Retensi Log (7 hari)

Retensi diatur di `logging/loki/loki-config.yml`:

```yaml
limits_config:
  retention_period: 168h  # 7 hari
```

### LOG_LEVEL

Aplikasi bisa dikonfigurasi via environment variable:

```env
LOG_LEVEL=warn     # Hanya warn + error (irit kuota)
LOG_LEVEL=info     # Default — semua info + warn + error
LOG_LEVEL=debug    # Development — lebih detail
```

### Grafana Password

Ubah password Grafana di `logging/docker-compose.logging.yml`:

```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=password_baru_yang_kuat
```

Atau lewat UI setelah login.

## Troubleshooting

| Masalah | Cek |
|---|---|
| Tidak ada log di Grafana | `docker logs jepangku-promtail` — cek error koneksi ke Loki |
| Grafana error 502 | `docker logs jepangku-grafana` — cek plugin/datasource |
| Disk penuh | `docker system df` — pruning: `docker system prune -f` |
| Loki crash | Cek permission folder `loki-data` — `chown 10001:10001 loki-data` |

## Resource

| Service | RAM | Disk |
|---|---|---|
| Promtail | ~15 MB | ~100 MB (config) |
| Loki | ~50-100 MB | ~500 MB - 2 GB (tergantung volume log) |
| Grafana | ~50 MB | ~200 MB (dashboard + plugin) |
| **Total** | **~150 MB** | **~1-3 GB** |
