"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight } from "lucide-react";
import SimpleBarChart from "@/components/admin/SimpleBarChart";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

type DayPoint = { date: string; count: number };
type BarPoint = { label: string; value: number };

export type DashboardChartsData = {
  articleStatus: BarPoint[];
  viewsByDay: DayPoint[];
  articlesPublishedByDay: DayPoint[];
  topCategories: BarPoint[];
  totalViews7d: number;
};

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function ChartCard({
  title,
  subtitle,
  href,
  children,
  testId,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div className="border border-jepang-border p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-heading font-bold text-lg tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-jepang-muted mt-1">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline inline-flex items-center gap-1"
          >
            Detail <ArrowRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function AreaTrendChart({
  data,
  color = "#c41e3a",
  valueLabel = "Jumlah",
}: {
  data: DayPoint[];
  color?: string;
  valueLabel?: string;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.date),
  }));

  if (chartData.every((d) => d.count === 0)) {
    return (
      <p className="text-sm text-jepang-muted py-12 text-center">
        Belum ada data untuk ditampilkan.
      </p>
    );
  }

  return (
    <div className="h-[200px] w-full" data-testid="area-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="dashboardAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#737373", fontFamily: "monospace" }}
            axisLine={{ stroke: "#e5e5e5" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#737373", fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #171717",
              borderRadius: 0,
              fontSize: 12,
              fontFamily: "monospace",
            }}
            formatter={(value) => [value ?? 0, valueLabel]}
            labelFormatter={(label) => String(label)}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill="url(#dashboardAreaFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12" data-testid="dashboard-charts-skeleton">
      <div className="lg:col-span-2 border border-jepang-border p-5">
        <SkeletonBox height="1.25rem" width="40%" className="mb-4" />
        <SkeletonBox height="200px" width="100%" />
      </div>
      <div className="border border-jepang-border p-5">
        <SkeletonBox height="1.25rem" width="50%" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} height="0.75rem" width="100%" />
          ))}
        </div>
      </div>
      <div className="border border-jepang-border p-5">
        <SkeletonBox height="1.25rem" width="45%" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} height="0.75rem" width="100%" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 border border-jepang-border p-5">
        <SkeletonBox height="1.25rem" width="35%" className="mb-4" />
        <SkeletonBox height="200px" width="100%" />
      </div>
    </div>
  );
}

export default function DashboardCharts({
  charts,
  loading,
}: {
  charts: DashboardChartsData | null;
  loading: boolean;
}) {
  if (loading || !charts) return <ChartsSkeleton />;

  return (
    <div className="mb-12 space-y-4" data-testid="dashboard-charts">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
          Statistik & Grafik
        </p>
        <Link
          href="/admin/analytics"
          className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
        >
          Analytics Lengkap →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Views Artikel"
            subtitle={`${charts.totalViews7d.toLocaleString("id-ID")} views · 7 hari terakhir`}
            href="/admin/analytics/content"
            testId="chart-views"
          >
            <AreaTrendChart data={charts.viewsByDay} valueLabel="Views" />
          </ChartCard>
        </div>

        <ChartCard
          title="Status Artikel"
          subtitle="Distribusi semua artikel"
          href="/admin/articles"
          testId="chart-article-status"
        >
          <SimpleBarChart data={charts.articleStatus} valueLabel="Artikel" />
        </ChartCard>

        <ChartCard
          title="Top Kategori"
          subtitle="Views lifetime tertinggi"
          href="/admin/analytics/categories"
          testId="chart-categories"
        >
          <SimpleBarChart data={charts.topCategories} valueLabel="Views" />
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard
            title="Artikel Dipublikasi"
            subtitle="Jumlah publish per hari · 7 hari terakhir"
            href="/admin/articles"
            testId="chart-published"
          >
            <AreaTrendChart
              data={charts.articlesPublishedByDay}
              color="#171717"
              valueLabel="Artikel"
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
