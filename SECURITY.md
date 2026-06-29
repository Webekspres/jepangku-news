# Kebijakan Keamanan — Jepangku News

Keamanan pengguna dan data adalah prioritas utama Jepangku News (portal berita ekosistem [Jepangku](https://jepangku.com), dikembangkan oleh [Webekspres](https://webekspres.id)). Dokumen ini menjelaskan versi yang didukung, cara melaporkan kerentanan secara bertanggung jawab, dan praktik keamanan yang diterapkan.

## Versi yang Didukung

Hanya rilis terbaru di branch utama yang aktif menerima patch keamanan.

| Versi             | Didukung           |
| ----------------- | ------------------ |
| `main` (produksi) | ✅ Ya              |
| Rilis sebelumnya  | ❌ Tidak           |

Produksi: `jepangku.com` · Staging: `portalinfo.jepangku.com`

## Melaporkan Kerentanan

**Jangan** membuka GitHub Issue publik untuk laporan kerentanan keamanan.

Laporkan secara privat melalui salah satu kanal berikut:

- **Email:** [security@jepangku.com](mailto:security@jepangku.com) (atau [support@jepangku.com](mailto:support@jepangku.com) bila tidak tersedia)
- **GitHub Security Advisory:** gunakan tab **Security → Report a vulnerability** pada repositori (private disclosure)

Sertakan informasi berikut agar tim dapat menindaklanjuti dengan cepat:

- Deskripsi kerentanan dan potensi dampaknya
- Langkah reproduksi (proof of concept bila ada)
- URL, endpoint, atau komponen yang terdampak
- Versi/commit serta lingkungan (produksi, staging, lokal)
- Saran mitigasi (opsional)

### Waktu Respons

| Tahap                      | Target                          |
| -------------------------- | ------------------------------- |
| Konfirmasi penerimaan      | ≤ 3 hari kerja                  |
| Penilaian awal & triase    | ≤ 7 hari kerja                  |
| Perbaikan / mitigasi       | Sesuai tingkat keparahan        |

Kami berkomitmen pada **coordinated disclosure**: mohon beri waktu yang wajar untuk perbaikan sebelum publikasi. Kontribusi yang valid akan kami apresiasi dan, atas persetujuan pelapor, dicantumkan dalam ucapan terima kasih.

## Cakupan (Scope)

**Dalam cakupan:**

- Aplikasi web Jepangku News (`jepangku.com`, `dev.jepangku.com`)
- API routes (`app/api/**`) dan logika autentikasi/otorisasi
- Penanganan data pengguna, sesi, dan integrasi Core JWT

**Di luar cakupan:**

- Layanan pihak ketiga (Clerk, Vercel, Cloudflare R2, Upstash, Resend) — laporkan langsung ke vendor terkait
- Serangan denial-of-service (DoS/DDoS) volumetrik
- Temuan otomatis dari scanner tanpa bukti dampak nyata
- Social engineering, phishing, atau akses fisik

## Praktik Keamanan

Langkah keamanan yang diterapkan pada aplikasi:

- **Autentikasi** melalui Clerk SSO dengan bridge Core JWT (verifikasi signature di `lib/core/verify-jwt.ts`)
- **Otorisasi berbasis peran** (USER · CONTRIBUTOR · ADMIN) pada API dan halaman admin
- **Rate limiting** (Redis/Upstash, fallback in-memory) pada endpoint sensitif
- **Sanitasi input & proteksi XSS** menggunakan `sanitize-html` untuk konten kaya
- **Validasi skema** dengan Zod pada batas API
- **Security headers** dan moderasi unggahan media
- **Manajemen rahasia** lewat environment variables — tidak ada kredensial yang di-commit

## Penanganan Rahasia (Secrets)

- Jangan pernah meng-commit `.env`, kunci API, atau kredensial ke version control (lihat `.gitignore`).
- Variabel `NEXT_PUBLIC_*` terekspos ke browser — jangan menaruh rahasia di sana.
- Jika kredensial terlanjur bocor, segera **rotasi/cabut** kunci tersebut dan beri tahu tim keamanan.

## Pengungkapan yang Diperbolehkan

Saat menguji, mohon:

- Hanya gunakan akun uji milik sendiri; jangan mengakses data pengguna lain.
- Hindari merusak, mengubah, atau menghapus data produksi.
- Hentikan pengujian segera setelah kerentanan terkonfirmasi dan laporkan.

Terima kasih telah membantu menjaga keamanan Jepangku News dan penggunanya.
