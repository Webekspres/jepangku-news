import type { Metadata } from "next";
import { db } from "@/lib/db";
import { sanitizePlainField } from "@/lib/sanitizer";
import { articlePageUrl, getSiteUrl, toAbsoluteUrl } from "@/lib/site-url";

const DEFAULT_OG_IMAGE = "/assets/images/favicons/web-app-manifest-512x512.png";

export async function generateArticleMetadata(slug: string): Promise<Metadata> {
  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "public" },
    select: {
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  if (!article) {
    return { title: "Artikel tidak ditemukan | Jepangku News" };
  }

  const title = sanitizePlainField(article.title, 300);
  const description =
    (article.excerpt ? sanitizePlainField(article.excerpt, 500) : null) ??
    `Baca "${title}" di Jepangku News — portal berita Jepang untuk pembaca Indonesia.`;

  const pageUrl = articlePageUrl(slug);
  const ogImageUrl = article.coverImageUrl
    ? toAbsoluteUrl(article.coverImageUrl)
    : toAbsoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      title,
      description,
      url: pageUrl,
      siteName: "Jepangku News",
      locale: "id_ID",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      section: article.category?.name,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

/** JSON-LD Article for rich results (uses cover thumbnail). */
export function buildArticleJsonLd(input: {
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  authorName: string | null;
}) {
  const pageUrl = articlePageUrl(input.slug);
  const imageUrl = input.coverImageUrl
    ? toAbsoluteUrl(input.coverImageUrl)
    : toAbsoluteUrl(DEFAULT_OG_IMAGE);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    image: [imageUrl],
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.updatedAt ?? input.publishedAt ?? undefined,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Jepangku News",
      url: getSiteUrl(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}
