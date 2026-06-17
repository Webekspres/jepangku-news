"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type NavbarSearchOverlayProps = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export default function NavbarSearchOverlay({
  open,
  query,
  onQueryChange,
  onSubmit,
  onClose,
}: NavbarSearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollYRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    scrollYRef.current = window.scrollY;

    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      if (window.scrollY !== scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
      }
    });

    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(!open && "pointer-events-none")}
      {...(!open ? { inert: true } : {})}
      data-testid="navbar-search-overlay-root"
    >
      {/* Backdrop layar penuh — klik di luar navbar / konten untuk tutup */}
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[100] bg-black/25 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        data-testid="navbar-search-backdrop"
      />

      {/* Panel search — turun dari atas, naik saat tutup */}
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          "fixed inset-x-0 top-0 z-[101] border-b border-jepang-border bg-jepang-off-white shadow-md",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-y-0 ease-out" : "-translate-y-full ease-in",
        )}
        data-testid="navbar-search-overlay"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <form
            onSubmit={onSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center gap-3"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
              />
              <input
                ref={inputRef}
                type="search"
                placeholder="Cari artikel, topik, atau tag..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="w-full rounded-lg border border-jepang-border bg-white py-3 pl-10 pr-4 text-sm text-jepang-navy shadow-sm focus:border-jepang-navy focus:outline-none"
                data-testid="navbar-search-input"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-jepang-orange px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-jepang-orange-hover"
              data-testid="navbar-search-submit"
            >
              Cari
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
