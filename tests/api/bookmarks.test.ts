import { beforeAll, describe, expect, it } from "bun:test";
import { fetchPublishedArticle, fetchPublishedArticleId } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — bookmarks list", () => {
  let ctx: IntegrationContext;
  let articleId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    articleId = await fetchPublishedArticleId(clientFor(ctx));
  });

  it("GET /api/bookmarks returns 401 for guest", async () => {
    if (skipUnless(ctx, "server")) return;
    const res = await clientFor(ctx).get("/api/bookmarks");
    expect(res.status).toBe(401);
  });

  it("GET /api/bookmarks returns saved articles for USER", async () => {
    if (skipUnless(ctx, "auth") || !articleId) return;
    const api = clientFor(ctx, "USER");
    await api.post(`/api/bookmarks/${articleId}`);
    const res = await api.get("/api/bookmarks");
    expect(res.status).toBe(200);
    const articles = (await res.json()) as { id: string }[];
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.some((a) => a.id === articleId)).toBe(true);
  });

  it("bookmark list items include article metadata", async () => {
    if (skipUnless(ctx, "auth")) return;
    const res = await clientFor(ctx, "USER").get("/api/bookmarks");
    if (res.status !== 200) return;
    const articles = (await res.json()) as {
      id: string;
      title: string;
      slug: string;
    }[];
    const first = articles[0];
    if (!first) return;
    expect(typeof first.title).toBe("string");
    expect(typeof first.slug).toBe("string");
  });
});
