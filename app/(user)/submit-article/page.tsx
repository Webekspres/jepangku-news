"use client";
export const dynamic = "force-dynamic";

import { ArticleFormEditor } from "@/components/article-editor";

export default function SubmitArticlePage() {
  return <ArticleFormEditor mode="create" />;
}
