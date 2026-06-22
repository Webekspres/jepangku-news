type ArticleViewTarget = {
  id: string;
  slug?: string | null;
  status: string;
};

/** Published → halaman publik; selain itu → pratinjau internal (portal user). */
export function getArticleViewHref(article: ArticleViewTarget): string {
  if (article.status === "PUBLISHED" && article.slug) {
    return `/articles/${article.slug}`;
  }
  return `/preview-article/${article.id}`;
}

export function isArticleLiveView(article: ArticleViewTarget): boolean {
  return article.status === "PUBLISHED" && Boolean(article.slug);
}

export function getArticleViewLabel(article: ArticleViewTarget): string {
  return isArticleLiveView(article) ? "Lihat di Situs" : "Pratinjau";
}
