"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminBreadcrumb } from "@/lib/admin-nav";

type AdminBreadcrumbContextValue = {
  overrides: AdminBreadcrumb[] | null;
  setBreadcrumbs: (crumbs: AdminBreadcrumb[] | null) => void;
};

const AdminBreadcrumbContext = createContext<AdminBreadcrumbContextValue | null>(
  null,
);

export function AdminBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<AdminBreadcrumb[] | null>(null);
  const setBreadcrumbs = useCallback((crumbs: AdminBreadcrumb[] | null) => {
    setOverrides(crumbs);
  }, []);

  const value = useMemo(
    () => ({ overrides, setBreadcrumbs }),
    [overrides, setBreadcrumbs],
  );

  return (
    <AdminBreadcrumbContext.Provider value={value}>
      {children}
    </AdminBreadcrumbContext.Provider>
  );
}

export function useAdminBreadcrumbOverrides() {
  return useContext(AdminBreadcrumbContext)?.overrides ?? null;
}

/** Override breadcrumb topbar admin untuk halaman dinamis (mis. detail user). */
export function useAdminBreadcrumbs(crumbs: AdminBreadcrumb[] | null) {
  const ctx = useContext(AdminBreadcrumbContext);

  useEffect(() => {
    if (!ctx) return;
    ctx.setBreadcrumbs(crumbs);
    return () => ctx.setBreadcrumbs(null);
  }, [ctx, crumbs]);
}
