import { beforeAll, describe, expect, it } from "bun:test";
import {
  fetchActivePollSlug,
  fetchActiveQuizSlug,
  fetchPublishedArticle,
} from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

const NINE_EMOJI_REACTIONS = [
  "LOVE",
  "LOL",
  "CUTE",
  "WIN",
  "WTF",
  "OMG",
  "GEEKY",
  "SCARY",
  "FAIL",
] as const;

describe("API — reactions", () => {
  let ctx: IntegrationContext;
  let articleId: string | null = null;
  let quizId: string | null = null;
  let pollId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    const api = clientFor(ctx);
    const article = await fetchPublishedArticle(api);
    articleId = article?.id ?? null;

    const quizSlug = await fetchActiveQuizSlug(api);
    if (quizSlug) {
      const quizRes = await api.get(`/api/quizzes/${quizSlug}`);
      if (quizRes.ok) {
        const quiz = (await api.json(quizRes)) as { id: string };
        quizId = quiz.id;
      }
    }

    const pollSlug = await fetchActivePollSlug(api);
    if (pollSlug) {
      const pollRes = await api.get(`/api/polls/${pollSlug}`);
      if (pollRes.ok) {
        const poll = (await api.json(pollRes)) as { id: string };
        pollId = poll.id;
      }
    }
  });

  describe("GET /api/reactions", () => {
    it("returns summary for article target", async () => {
      if (skipUnless(ctx, "server") || !articleId) return;
      const res = await clientFor(ctx).get(
        `/api/reactions?targetType=ARTICLE&targetId=${articleId}`,
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as { counts: Record<string, number> };
      expect(data).toHaveProperty("counts");
    });
  });

  describe("POST /api/reactions — 9 emoji on content", () => {
    it("accepts all nine reaction types on article", async () => {
      if (skipUnless(ctx, "auth") || !articleId) return;
      const api = clientFor(ctx, "CONTRIBUTOR");
      for (const type of NINE_EMOJI_REACTIONS) {
        const res = await api.post("/api/reactions", {
          targetType: "ARTICLE",
          targetId: articleId,
          type,
        });
        expect(res.status).toBe(200);
      }
    });

    it("toggles reaction on quiz", async () => {
      if (skipUnless(ctx, "auth") || !quizId) return;
      const res = await clientFor(ctx, "USER").post("/api/reactions", {
        targetType: "QUIZ",
        targetId: quizId,
        type: "LOVE",
      });
      expect(res.status).toBe(200);
    });

    it("toggles reaction on poll", async () => {
      if (skipUnless(ctx, "auth") || !pollId) return;
      const res = await clientFor(ctx, "USER").post("/api/reactions", {
        targetType: "POLL",
        targetId: pollId,
        type: "WIN",
      });
      expect(res.status).toBe(200);
    });

    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !articleId) return;
      const res = await clientFor(ctx).post("/api/reactions", {
        targetType: "ARTICLE",
        targetId: articleId,
        type: "LOVE",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/reactions/browse", () => {
    for (const targetType of ["ARTICLE", "QUIZ", "POLL"] as const) {
      it(`filters browse results by targetType=${targetType}`, async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(
          `/api/reactions/browse?type=LOVE&targetType=${targetType}&limit=3`,
        );
        expect(res.status).toBe(200);
        const data = (await res.json()) as { targetType: string; items: unknown[] };
        expect(data.targetType).toBe(targetType);
        expect(Array.isArray(data.items)).toBe(true);
      });
    }

    it("returns 400 for missing params", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/reactions/browse");
      expect(res.status).toBe(400);
    });
  });
});
