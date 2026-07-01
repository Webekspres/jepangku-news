"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseApiResponse } from "@/lib/fetch-api";
import { toast } from "sonner";
import { canEditOnUserPortal } from "@/lib/article-workflow";
import { getArticleEditApiPath } from "@/lib/article-view-url";
import { ArticleFormEditor, type ArticleInitialData } from "@/components/article-editor";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()!;
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState<ArticleInitialData | null>(
    null,
  );

  useEffect(() => {
    fetch(getArticleEditApiPath(id))
      .then((r) => parseApiResponse(r))
      .then((article: any) => {
        if (!article || !article.id) {
          router.push("/my-articles");
          return;
        }
        if (!canEditOnUserPortal(article.status)) {
          toast.error("Artikel tidak dapat diedit pada status ini");
          router.replace("/my-articles");
          return;
        }
        setInitialData({
          slug: article.slug,
          title: article.title ?? "",
          excerpt: article.excerpt ?? "",
          content: article.content ?? "",
          coverImageUrl: article.coverImageUrl ?? "",
          categoryId: article.categoryId ?? "",
          tags: article.tags,
        });
        setFetching(false);
      })
      .catch(() => {
        router.push("/my-articles");
      });
  }, [id, router]);

  return (
    <ArticleFormEditor
      mode="edit"
      initialData={initialData}
      fetching={fetching}
    />
  );
}
