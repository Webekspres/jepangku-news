"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_CONTENT_CLASS } from "@/lib/admin-layout";

export interface AdminFloatingFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  loadingLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  saveTestId?: string;
  className?: string;
}

/**
 * Sticky action bar for long admin forms — stays visible while scrolling.
 * Offset for desktop admin sidebar (w-64).
 */
export default function AdminFloatingFormActions({
  onSave,
  onCancel,
  saveLabel,
  loadingLabel,
  cancelLabel = "Batal",
  loading = false,
  saveTestId,
  className,
}: AdminFloatingFormActionsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-jepang-border bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:left-64",
        className,
      )}
    >
      <div className={cn(ADMIN_CONTENT_CLASS, "flex gap-3 py-3")}>
        <Button
          type="button"
          onClick={onSave}
          disabled={loading}
          data-testid={saveTestId}
        >
          {loading ? loadingLabel ?? "Menyimpan..." : saveLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="hover:bg-foreground hover:text-white"
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
