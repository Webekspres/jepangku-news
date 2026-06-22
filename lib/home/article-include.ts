import { Prisma } from "@prisma/client";

export const homeArticleInclude = {
  author: { select: { name: true, username: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ArticleInclude;

export type HomeArticle = Prisma.ArticleGetPayload<{
  include: typeof homeArticleInclude;
}>;

export const publishedArticleWhere = {
  status: "PUBLISHED" as const,
  visibility: "public" as const,
};
