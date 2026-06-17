import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <Icon size={40} strokeWidth={1.5} className="mb-4 text-jepang-muted" />
      ) : null}
      <p className="font-heading text-lg font-bold text-jepang-navy">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-jepang-muted">{description}</p>
      ) : null}
    </div>
  );
}
