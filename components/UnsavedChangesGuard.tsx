"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";

type UnsavedChangesGuardProps = {
  /** When true, leaving the page is guarded. */
  enabled: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

const DEFAULT_TITLE = "Gambar belum disimpan";
const DEFAULT_DESCRIPTION =
  "Ada gambar yang dipilih tapi belum disimpan. Jika kamu pergi sekarang, gambar itu akan hilang. Simpan dulu agar tidak hilang.";

/**
 * Warns before leaving the page while there are unsaved changes (e.g. a staged
 * image not yet uploaded/saved).
 *
 * - In-app navigation (internal <a> clicks) is intercepted and confirmed via a
 *   styled `ConfirmModal`.
 * - Hard navigation (tab close / refresh / external link) uses the browser's
 *   native `beforeunload` prompt — browsers do not allow a custom modal there.
 *
 * Note: programmatic `router.push` and the browser Back button are not
 * intercepted; on the article pages those only happen after a successful save.
 */
export function UnsavedChangesGuard({
  enabled,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  confirmLabel = "Tinggalkan Halaman",
  cancelLabel = "Tetap di Sini",
}: UnsavedChangesGuardProps) {
  const router = useRouter();
  const { confirm, confirmProps } = useConfirm();

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  // Set right before a confirmed programmatic navigation so the click/unload
  // handlers don't re-trigger during it.
  const bypassRef = useRef(false);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!enabledRef.current || bypassRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!enabledRef.current || bypassRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      // Block the navigation and ask via modal instead.
      e.preventDefault();
      e.stopPropagation();

      const target =
        destination.pathname + destination.search + destination.hash;
      confirm({
        title,
        description,
        confirmLabel,
        cancelLabel,
        variant: "warning",
        onConfirm: () => {
          bypassRef.current = true;
          router.push(target);
        },
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [confirm, router, title, description, confirmLabel, cancelLabel]);

  return <ConfirmModal {...confirmProps} />;
}
