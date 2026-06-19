"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  FileText,
  LayoutGrid,
  Zap,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";

const SECTIONS = [
  {
    href: "/admin/analytics/content",
    title: "Performa Artikel",
    desc: "Artikel dengan views, bookmark, dan share tertinggi dalam periode yang dipilih. Klik baris untuk detail views harian.",
    icon: FileText,
  },
  {
    href: "/admin/analytics/categories",
    title: "Statistik Kategori",
    desc: "Jumlah artikel published, total views, bookmark, share, dan engagement per kategori.",
    icon: LayoutGrid,
  },
  {
    href: "/admin/quizzes",
    title: "Statistik Kuis",
    desc: "Buka daftar kuis → tombol grafik di setiap baris untuk attempt, distribusi skor, dan pass rate.",
    icon: Zap,
  },
  {
    href: "/admin/polls",
    title: "Statistik Polling",
    desc: "Buka daftar polling → tombol grafik di setiap baris untuk breakdown suara per opsi dan tren waktu.",
    icon: MessageSquare,
  },
];

export default function AnalyticsHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== "ADMIN")) router.push("/");
  }, [user, loading, router]);

  if (loading || !user || (user as any).role !== "ADMIN") return null;

  return (
    <AdminPageShell
      title="Analytics Konten"
      subtitle="Pusat laporan performa portal. Pilih jenis laporan di bawah — setiap halaman punya navigasi tab yang sama agar tidak tersesat."
      label="Analytics"
    >
      {/* TODO: tambahkan card stats untuk mengetahui total views harian dan total views lifetime senua konten */}
      {/* TODO: tidak ada lagi menu di bawah ini, halaman analytics sekarang adalah analytics lenkap konten secara total dan bisa diklik untuk melihat detail views harian dan lifetime perkontennya yang mengarah ke halaman analytics konten di menunya masing masing */}
      {/* TODO:ganti menu analytics ini bukan hanya ringkasan, performa artikel, performa kuis, peforma polling dan terakhir performa pengguna pastikan disetiap halaman ada card statsnya */}
      <div className="mb-6 flex items-center gap-2 text-jepang-muted">
        <BarChart3 size={18} className="text-jepang-red" />
        <p className="text-sm">
          Data views harian mulai tercatat setelah fitur analytics aktif. Counter lifetime tetap tersedia untuk periode &ldquo;Semua&rdquo;.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group block border border-jepang-border p-6 hover:border-foreground transition-colors"
              data-testid={`analytics-hub-${s.title}`}
            >
              <Icon size={24} className="text-jepang-red mb-3" strokeWidth={1.5} />
              <h2 className="font-heading font-bold text-xl tracking-tight group-hover:text-jepang-red transition-colors">
                {s.title}
              </h2>
              <p className="text-sm text-jepang-muted mt-2 leading-relaxed">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-jepang-red">
                Buka <ArrowRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>
    </AdminPageShell>
  );
}
