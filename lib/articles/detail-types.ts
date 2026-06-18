import type { Article } from "@/components/ArticleCard";

export type ArticleDetailAuthor = {
  name: string;
  username: string;
  avatarUrl: string | null;
  displayName: string;
  bio: string | null;
};

export type ArticleDetailTag = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  viewCount: number;
  publishedAt: string | null;
  author: ArticleDetailAuthor;
  category: { id: string; name: string; slug: string; color: string | null } | null;
  tags: ArticleDetailTag[];
  relatedArticles: Article[];
};
