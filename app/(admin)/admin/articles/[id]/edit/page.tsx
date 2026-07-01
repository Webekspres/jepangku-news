"use client";

import { useParams } from "next/navigation";
import { AdminArticleFormEditor } from "@/components/article-editor";

export default function AdminEditArticlePage() {
  const { id } = useParams<{ id: string }>();
  return <AdminArticleFormEditor mode="edit" articleId={id} />;
}
