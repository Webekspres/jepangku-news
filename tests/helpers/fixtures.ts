import type { ApiClient } from "./api-client";

type Paginated<T> = {
  articles?: T[];
  quizzes?: T[];
  polls?: T[];
};

export async function fetchPublishedArticle(
  api: ApiClient,
): Promise<{ id: string; slug: string } | null> {
  const res = await api.get("/api/articles?limit=5&status=PUBLISHED");
  if (!res.ok) return null;
  const data = (await api.json(res)) as Paginated<{ id: string; slug: string }>;
  return data.articles?.[0] ?? null;
}

export async function fetchPublishedArticleSlug(api: ApiClient): Promise<string | null> {
  const article = await fetchPublishedArticle(api);
  return article?.slug ?? null;
}

export async function fetchPublishedArticleId(api: ApiClient): Promise<string | null> {
  const article = await fetchPublishedArticle(api);
  return article?.id ?? null;
}

export async function fetchActiveQuizSlug(api: ApiClient): Promise<string | null> {
  const res = await api.get("/api/quizzes?limit=1&status=ACTIVE");
  if (!res.ok) return null;
  const data = (await api.json(res)) as Paginated<{ slug: string }>;
  return data.quizzes?.[0]?.slug ?? null;
}

export async function fetchActiveQuizWithQuestions(
  api: ApiClient,
): Promise<{ slug: string; questions: { id: string; options: { id: string }[] }[] } | null> {
  const slug = await fetchActiveQuizSlug(api);
  if (!slug) return null;
  const res = await api.get(`/api/quizzes/${slug}`);
  if (!res.ok) return null;
  const quiz = (await api.json(res)) as {
    slug: string;
    questions?: { id: string; options: { id: string }[] }[];
  };
  if (!quiz.questions?.length) return null;
  return { slug: quiz.slug, questions: quiz.questions };
}

export async function fetchActivePollSlug(api: ApiClient): Promise<string | null> {
  const res = await api.get("/api/polls?limit=1&status=ACTIVE");
  if (!res.ok) return null;
  const data = (await api.json(res)) as Paginated<{ slug: string }>;
  return data.polls?.[0]?.slug ?? null;
}

export async function fetchActivePollWithQuestions(
  api: ApiClient,
): Promise<{
  slug: string;
  questions: { id: string; options: { id: string }[] }[];
} | null> {
  const slug = await fetchActivePollSlug(api);
  if (!slug) return null;
  const res = await api.get(`/api/polls/${slug}`);
  if (!res.ok) return null;
  const poll = (await api.json(res)) as {
    slug: string;
    questions?: { id: string; options: { id: string }[] }[];
  };
  if (!poll.questions?.length) return null;
  return { slug: poll.slug, questions: poll.questions };
}

export const HOME_WAVE_ENDPOINTS = [
  { wave: 1, path: "/api/home/feed", expectCache: true },
  { wave: 2, path: "/api/home/categories-editorial", expectCache: true },
  { wave: 3, path: "/api/home/tv", expectCache: true },
  { wave: 3, path: "/api/home/ads?slot=homepage-mid", expectCache: false },
  { wave: 3, path: "/api/home/lms-teaser", expectCache: true },
  { wave: 3, path: "/api/home/reactions", expectCache: true },
  { wave: 4, path: "/api/home/engagement", expectCache: true },
] as const;

export const ADMIN_BOUNDARY_ENDPOINTS = [
  { method: "GET" as const, path: "/api/admin/stats" },
  { method: "GET" as const, path: "/api/admin/articles" },
  { method: "GET" as const, path: "/api/admin/users/stats" },
  { method: "GET" as const, path: "/api/admin/comments/stats" },
  { method: "GET" as const, path: "/api/admin/contributors/stats" },
  { method: "GET" as const, path: "/api/admin/quizzes/stats" },
  { method: "GET" as const, path: "/api/admin/polls/stats" },
  { method: "GET" as const, path: "/api/admin/newsletter/stats" },
  { method: "GET" as const, path: "/api/admin/homepage/stats" },
  { method: "GET" as const, path: "/api/admin/activity-log" },
] as const;
