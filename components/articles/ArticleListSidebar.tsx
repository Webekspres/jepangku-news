"use client";

import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import ArticleListFilters from "@/components/articles/ArticleListFilters";
import { useAdSlot } from "@/hooks/useAdSlot";
import type { ComponentProps } from "react";

type ArticleListSidebarProps = ComponentProps<typeof ArticleListFilters>;

export default function ArticleListSidebar(props: ArticleListSidebarProps) {
  const { data, isLoading, error } = useAdSlot("sidebar", {
    immediate: true,
  });

  return (
    <div className="flex flex-col gap-4" data-testid="article-list-sidebar">
      <aside className="rounded-lg border border-jepang-border bg-white p-4">
        <p className="section-label mb-4">Filter artikel</p>
        <ArticleListFilters {...props} />
      </aside>

      <SidebarAdSlot
        data={data}
        loading={isLoading}
        error={error}
        testId="article-list-sidebar-ad"
        className="w-full"
      />
    </div>
  );
}
