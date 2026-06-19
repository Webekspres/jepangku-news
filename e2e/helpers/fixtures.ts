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
