"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Info, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            /* animate-in / animate-out via Tailwind data-state */
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />

        {/* Panel */}
        <DialogPrimitive.Content
          className={cn(
            // layout
            "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2",
            // style
            "rounded-xl border border-jepang-border bg-white p-6 shadow-jepang-lg",
            // animation — slide up + fade in, slide down + fade out
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4",
            "duration-200",
          )}
          // clicking outside closes
          onInteractOutside={() => !loading && onOpenChange(false)}
          onEscapeKeyDown={() => !loading && onOpenChange(false)}
        >
          {/* Icon */}
          <div className={cn("mb-4", iconClass)}>
            <Icon size={28} strokeWidth={1.5} />
          </div>

          {/* Title */}
          <DialogPrimitive.Title className="font-heading font-black text-xl tracking-tight mb-1">
            {title}
          </DialogPrimitive.Title>

          {/* Description */}
          {description && (
            <DialogPrimitive.Description className="text-sm text-jepang-muted mb-5">
              {description}
            </DialogPrimitive.Description>
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
