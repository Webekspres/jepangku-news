# 📚 Dokumentasi — Jepangku News

Indeks dokumentasi proyek Portal Berita. Untuk integrasi ekosistem (Core + Clerk), mulai dari **[ecosystem-integration.md](./ecosystem-integration.md)**.

---

## Integrasi & arsitektur ekosistem

| Dokumen | Isi |
| :--- | :--- |
| [ecosystem-integration.md](./ecosystem-integration.md) | **Kontrak cutover News ↔ Core** — keputusan arsitektur, mapping v1→v2, checklist Fase 0–5 |
| [development-roadmap.md](./development-roadmap.md) | Roadmap berfase A–E (Fase B/C sudah v2) |
| [feature-status.md](./feature-status.md) | Status implementasi + **checklist penyatuan Core** (Fase 1–5) |
| [penyatuan-next-steps.md](./penyatuan-next-steps.md) | **Langkah manual env** + urutan task berikutnya |
| [technical-architecture.md](./technical-architecture.md) | Stack teknis & auth portal saat ini |

**Repo Core (sumber kebenaran API):**

| Dokumen | Path |
| :--- | :--- |
| Kontrak ekosistem | [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md) |
| HTTP API | [`jepangku-core/docs/API.md`](../../jepangku-core/docs/API.md) |
| Schema & JWT | [`jepangku-core/docs/README.md`](../../jepangku-core/docs/README.md) |

---

## Steering & desain produk (`.agents/`)

| Dokumen | Isi |
| :--- | :--- |
| [01-mvp-scope.md](../.agents/01-mvp-scope.md) | Scope MVP portal |
| [02-user-flow.md](../.agents/02-user-flow.md) | Role & alur user/admin |
| [03-database-erd.md](../.agents/03-database-erd.md) | ERD portal (single-app; catatan migrasi Core) |
| [04-project-steering.md](../.agents/04-project-steering.md) | Prioritas & arah proyek |
| [05-ecosystem-strategy.md](../.agents/05-ecosystem-strategy.md) | Visi ekosistem — ⚠️ bagian 8–12 = v1, lihat [ecosystem-integration.md §2](./ecosystem-integration.md) |

---

## Operasional & konten

| Dokumen | Isi |
| :--- | :--- |
| [cloudflare-r2-setup.md](./cloudflare-r2-setup.md) | Setup media R2 |
| [soft-launch-content.md](./soft-launch-content.md) | Checklist konten soft launch |

---

## Urutan baca untuk tim integrasi Core

1. [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md) — peta 3 aplikasi
2. [ecosystem-integration.md](./ecosystem-integration.md) — keputusan & checklist News
3. [feature-status.md](./feature-status.md) — apa yang sudah/belum di kode
4. [`jepangku-core/docs/API.md`](../../jepangku-core/docs/API.md) — endpoint saat implementasi Fase 2
