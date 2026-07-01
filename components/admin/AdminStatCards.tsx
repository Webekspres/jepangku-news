"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export type AdminStatCardItem = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  highlight?: boolean;
  href?: string;
  onClick?: () => void;
  testId?: string;
};

type AdminStatCardsProps = {
  items: AdminStatCardItem[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  gridClassName?: string;
};

function statCardClassName(highlight?: boolean) {
  return cn(
    "block p-3.5 sm:p-5 border transition-colors",
    highlight
      ? "bg-jepang-red text-white border-jepang-red hover:opacity-90"
      : "bg-white border-jepang-border hover:border-foreground",
  );
}

function StatCardContent({ item }: { item: AdminStatCardItem }) {
  const Icon = item.icon;
  const displayValue =
    typeof item.value === "number" ? item.value.toLocaleString("id-ID") : item.value;

  return (
    <>
      <Icon size={18} strokeWidth={1.5} className="mb-2 sm:mb-3" />
      <p className="font-mono font-black text-xl sm:text-2xl md:text-3xl">{displayValue}</p>
      <p className="mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
    </>
  );
}

export default function AdminStatCards({
  items,
  loading = false,
  skeletonCount = 6,
  className,
  gridClassName = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
}: AdminStatCardsProps) {
  return (
    <div className={cn(gridClassName, className)}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => (
            <div key={index} className="border border-jepang-border bg-white p-3.5 sm:p-5">
              <SkeletonBox height="0.8rem" width="30%" className="mb-2 sm:mb-3" />
              <div className="my-2 sm:my-3">
                <SkeletonBox height="1.6rem" width="100%" />
              </div>
              <SkeletonBox height="0.5rem" width="60%" />
            </div>
          ))
        : items.map((item) => {
            const testId =
              item.testId ?? `stat-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={cn(statCardClassName(item.highlight), "w-full text-left")}
                  data-testid={testId}
                >
                  <StatCardContent item={item} />
                </button>
              );
            }

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={statCardClassName(item.highlight)}
                  data-testid={testId}
                >
                  <StatCardContent item={item} />
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className={statCardClassName(item.highlight)}
                data-testid={testId}
              >
                <StatCardContent item={item} />
              </div>
            );
          })}
    </div>
  );
}
