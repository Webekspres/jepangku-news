import { expect, type APIRequestContext, type Page } from "@playwright/test";

type Paginated<T> = { articles?: T[]; quizzes?: T[]; polls?: T[] };

export async function fetchFirstArticleSlug(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/articles?limit=1");
  if (!res.ok()) return null;
  const data = (await res.json()) as Paginated<{ slug: string }>;
  return data.articles?.[0]?.slug ?? null;
}

export async function fetchFirstArticleId(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/articles?limit=1");
  if (!res.ok()) return null;
  const data = (await res.json()) as Paginated<{ id: string }>;
  return data.articles?.[0]?.id ?? null;
}

export async function fetchFirstAuthorUsername(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/articles?limit=5");
  if (!res.ok()) return null;
  const data = (await res.json()) as Paginated<{
    author?: { username?: string | null };
  }>;
  for (const article of data.articles ?? []) {
    if (article.author?.username) return article.author.username;
  }
  return null;
}

export async function fetchFirstQuizSlug(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/quizzes?limit=1&status=ACTIVE");
  if (!res.ok()) return null;
  const data = (await res.json()) as Paginated<{ slug: string }>;
  return data.quizzes?.[0]?.slug ?? null;
}

export async function fetchFirstPollSlug(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/polls?limit=1&status=ACTIVE");
  if (!res.ok()) return null;
  const data = (await res.json()) as Paginated<{ slug: string }>;
  return data.polls?.[0]?.slug ?? null;
}

export async function expectGuestRedirectToSignIn(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
  await expect(page.getByTestId("sign-in-page")).toBeVisible();
}

export async function fetchFirstVideoSlug(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/videos?limit=1");
  if (!res.ok()) return null;
  const data = (await res.json()) as { videos?: { slug: string }[] };
  return data.videos?.[0]?.slug ?? null;
}

export async function fetchFirstCategoryId(
  request: APIRequestContext,
): Promise<string | null> {
  const res = await request.get("/api/categories");
  if (!res.ok()) return null;
  const data = (await res.json()) as { id: string }[] | { categories?: { id: string }[] };
  const list = Array.isArray(data) ? data : data.categories;
  return list?.[0]?.id ?? null;
}

export async function scrollToFooter(page: Page) {
  await page.getByTestId("main-footer").scrollIntoViewIfNeeded();
}
