import { db } from "@/lib/db";
import { publishedArticleWhere } from "@/lib/home/article-include";

export type CategoryWithArticles = {
  id: string;
  name: string;
  slug: string;
  articles: Array<{ id: string; title: string; slug: string }>;
};

export async function fetchCategoriesWithArticles(): Promise<
  CategoryWithArticles[]
> {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return Promise.all(
    categories.map(async (cat) => {
      const articles = await db.article.findMany({
        where: { ...publishedArticleWhere, categoryId: cat.id },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true },
      });

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        articles,
      };
    }),
  );
}
