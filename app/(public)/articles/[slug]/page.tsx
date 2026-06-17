import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailClient from "@/components/articles/ArticleDetailClient";
import {
  buildArticleJsonLd,
  generateArticleMetadata,
} from "@/lib/article-seo";
import { db } from "@/lib/db";
import { sanitizePlainField } from "@/lib/sanitizer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateArticleMetadata(slug);
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "public" },
    select: {
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });

  if (!article) notFound();

  const title = sanitizePlainField(article.title, 300);
  const description =
    (article.excerpt ? sanitizePlainField(article.excerpt, 500) : null) ??
    `Baca "${title}" di Jepangku News.`;

  const jsonLd = buildArticleJsonLd({
    slug,
    title,
    description,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    updatedAt: article.updatedAt?.toISOString() ?? null,
    authorName: article.author?.name ?? null,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleDetailClient slug={slug} />
    </>
  );
}
