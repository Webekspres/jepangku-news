export const PREVIEW_FROM_ADMIN = "admin";

export function isAdminPreviewContext(
  searchParams: Pick<URLSearchParams, "get"> | null | undefined,
): boolean {
  return searchParams?.get("from") === PREVIEW_FROM_ADMIN;
}

export function withAdminPreviewContext(href: string): string {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}from=${PREVIEW_FROM_ADMIN}`;
}

export type PreviewBreadcrumb = {
  href?: string;
  label: string;
};

export function getPreviewArticleBreadcrumbs(
  fromAdmin: boolean,
  articleTitle?: string | null,
): PreviewBreadcrumb[] {
  const currentLabel = articleTitle?.trim() || "Pratinjau";

  if (fromAdmin) {
    return [
      { href: "/admin", label: "Admin" },
      { href: "/admin/articles", label: "Semua Artikel" },
      { label: currentLabel },
    ];
  }

  return [
    { href: "/my-articles", label: "Artikel Saya" },
    { label: currentLabel },
  ];
}
