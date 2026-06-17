"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DayPoint = { date: string; count: number };

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function AdminTrendChart({
  data,
  color = "#c41e3a",
  valueLabel = "Jumlah",
  height = 220,
}: {
  data: DayPoint[];
  color?: string;
  valueLabel?: string;
  height?: number;
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
    <div className="w-full" style={{ height }} data-testid="admin-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#adminTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
