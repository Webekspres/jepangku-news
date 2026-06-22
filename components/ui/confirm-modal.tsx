"use client";

import * as React from "react";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ─── Variant config ─────────────────────────────────── */
type ModalVariant = "danger" | "warning" | "info";

const VARIANT_STYLES: Record<
  ModalVariant,
  { icon: React.ElementType; iconClass: string; confirmClass: string }
> = {
  danger: {
    icon: Trash2,
    iconClass: "text-jepang-red",
    confirmClass:
      "border border-jepang-red bg-jepang-red text-white hover:bg-jepang-red-hover hover:border-jepang-red-hover",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    confirmClass:
      "border border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-600",
  },
  info: {
    icon: Info,
    iconClass: "text-foreground",
    confirmClass:
      "border border-foreground bg-foreground text-white hover:bg-jepang-muted hover:border-jepang-muted",
  },
};

/* ─── ConfirmModal component ─────────────────────────── */
export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Main heading */
  title: string;
  /** Optional descriptive text below the title */
  description?: string;
  /** Label for confirm button. Defaults to "Ya, Lanjutkan" */
  confirmLabel?: string;
  /** Label for cancel button. Defaults to "Batal" */
  cancelLabel?: string;
  /** Visual variant. Defaults to "danger" */
  variant?: ModalVariant;
  /** Called when the user clicks confirm */
  onConfirm: () => void;
  /** Whether the confirm action is loading */
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  loading = false,
}: ConfirmModalProps) {
  const { icon: Icon, iconClass, confirmClass } = VARIANT_STYLES[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay />
        <DialogContent
          className="w-full max-w-sm rounded-lg border border-jepang-border bg-white p-6 shadow-jepang-lg"
          onInteractOutside={() => !loading && onOpenChange(false)}
          onEscapeKeyDown={() => !loading && onOpenChange(false)}
        >
          {/* Icon */}
          <div className={cn("mb-4", iconClass)}>
            <Icon size={28} strokeWidth={1.5} />
          </div>

          {/* Title */}
          <DialogTitle className="font-heading font-black text-xl tracking-tight mb-1">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="text-sm text-jepang-muted mb-5">
              {description}
            </DialogDescription>
          )}

          {/* Actions */}
          <div className={cn("flex gap-3", !description && "mt-5")}>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 disabled:pointer-events-none",
                confirmClass,
              )}
              data-testid="confirm-modal-confirm"
            >
              {loading ? "Memproses..." : confirmLabel}
            </button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="confirm-modal-cancel"
            >
              {cancelLabel}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

/* ─── useConfirm hook ────────────────────────────────── */
/**
 * Lightweight hook that manages open state and the pending action.
 *
 * Usage:
 *   const { confirmProps, confirm } = useConfirm();
 *   // trigger:
 *   confirm({ title: "Hapus?", onConfirm: () => doDelete() });
 *   // render:
 *   <ConfirmModal {...confirmProps} />
 */
interface ConfirmOptions
  extends Omit<ConfirmModalProps, "open" | "onOpenChange" | "loading"> {
  onConfirm: () => void | Promise<void>;
}

export function useConfirm() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!options) return;
    setLoading(true);
    try {
      await options.onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmProps: ConfirmModalProps = {
    open,
    onOpenChange: (v) => { if (!loading) setOpen(v); },
    title: options?.title ?? "",
    description: options?.description,
    confirmLabel: options?.confirmLabel,
    cancelLabel: options?.cancelLabel,
    variant: options?.variant,
    onConfirm: handleConfirm,
    loading,
  };

  return { confirm, confirmProps };
}
