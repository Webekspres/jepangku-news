import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ADMIN_CARD_CLASS, ADMIN_CARD_LIST_HEADER_CLASS } from "@/lib/admin-layout";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  title?: React.ReactNode;
  /** `list` = label uppercase; `panel` = judul section biasa */
  variant?: "list" | "panel";
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  testId?: string;
};

export default function AdminCard({
  title,
  variant = "panel",
  headerAction,
  children,
  className,
  contentClassName,
  noPadding = false,
  testId,
}: AdminCardProps) {
  return (
    <Card className={cn(ADMIN_CARD_CLASS, "overflow-hidden", className)} data-testid={testId}>
      {title ? (
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            variant === "list"
              ? ADMIN_CARD_LIST_HEADER_CLASS
              : "border-b border-jepang-border px-5 py-4",
          )}
        >
          {variant === "list" ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{title}</p>
          ) : (
            <h2 className="font-heading text-lg font-bold">{title}</h2>
          )}
          {headerAction}
        </CardHeader>
      ) : null}
      <CardContent className={cn(noPadding ? "p-0" : "p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
