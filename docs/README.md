# Dokumentasi — Jepangku News

Indeks dokumentasi Portal Berita. **Status aplikasi:** ✅ sepenuhnya diimplementasi (Juni 2026) — sisa rencana hanya integrasi ekosistem lintas-app di [`feature-status.md`](./feature-status.md#rencana-lanjutan--bisa-nanti-ekosistem-fase-de).

Untuk integrasi Core, mulai dari **[ecosystem-integration.md](./ecosystem-integration.md)**.

## Integrasi & arsitektur

| Dokumen | Isi |
| :--- | :--- |
| [design-system.md](./design-system.md) | **Brand guideline** — warna, tipografi, komponen UI |
| [ecosystem-integration.md](./ecosystem-integration.md) | Kontrak cutover News ↔ Core, checklist fase |
| [feature-status.md](./feature-status.md) | **Living doc** — ✅ implementasi selesai + rencana lanjutan ekosistem |
| [testing-inventory.md](./testing-inventory.md) | **Inventaris fitur & QA** — functional + non-functional (verified) |
| [backlog-plan.md](./backlog-plan.md) | **Arsip rencana teknis** — kontributor, newsletter, notifikasi *(selesai)* |
| [development-roadmap.md](./development-roadmap.md) | Roadmap fase produk *(arsip — portal selesai)* |
| [technical-architecture.md](./technical-architecture.md) | Stack & auth portal |

**Repo Core (sumber kebenaran API):**

| Dokumen | Path |
| :--- | :--- |
| Runbook integrasi | [`jepangku-core/docs/PHASE0-PHASE1.md`](../../jepangku-core/docs/PHASE0-PHASE1.md) |
| Kontrak ekosistem | [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md) |
| HTTP API | [`jepangku-core/docs/API.md`](../../jepangku-core/docs/API.md) |
| Schema & JWT | [`jepangku-core/docs/SCHEMA_REFERENCE.md`](../../jepangku-core/docs/SCHEMA_REFERENCE.md) (v2.1 — tanpa poin/badge di Core) |

## Steering produk (`.agents/`)

| Dokumen | Isi |
| :--- | :--- |
| [01-mvp-scope.md](../.agents/01-mvp-scope.md) | Scope MVP (historis) |
| [02-user-flow.md](../.agents/02-user-flow.md) | Alur user/admin |
| [03-database-erd.md](../.agents/03-database-erd.md) | ERD portal lokal |
| [04-project-steering.md](../.agents/04-project-steering.md) | Prioritas proyek |
| [05-ecosystem-strategy.md](../.agents/05-ecosystem-strategy.md) | Visi ekosistem — ⚠️ §8–12 = v1 deprecated |

## Operasional

| Dokumen | Isi |
| :--- | :--- |
| [cloudflare-r2-setup.md](./cloudflare-r2-setup.md) | Setup media R2 |
| [soft-launch-content.md](./soft-launch-content.md) | Checklist konten soft launch |

## Urutan baca (tim integrasi)

1. [`jepangku-core/docs/ECOSYSTEM.md`](../../jepangku-core/docs/ECOSYSTEM.md)
2. [ecosystem-integration.md](./ecosystem-integration.md)
3. [feature-status.md](./feature-status.md) — **status implementasi & rencana lanjutan**
4. [backlog-plan.md](./backlog-plan.md) — arsip rencana teknis (selesai)
5. [development-roadmap.md](./development-roadmap.md)
6. [`jepangku-core/docs/PHASE0-PHASE1.md`](../../jepangku-core/docs/PHASE0-PHASE1.md)
