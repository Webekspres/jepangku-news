import { beforeAll, describe, expect, it } from "bun:test";
import { fetchActiveQuizSlug, fetchActiveQuizWithQuestions } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — quizzes", () => {
  let ctx: IntegrationContext;
  let quizSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    quizSlug = await fetchActiveQuizSlug(clientFor(ctx));
  });

  describe("listing", () => {
    it("GET /api/quizzes returns active quizzes", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/quizzes?limit=5&status=ACTIVE");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { quizzes: unknown[] };
      expect(Array.isArray(data.quizzes)).toBe(true);
    });

    it("GET /api/quizzes/{slug} returns quiz detail for guest", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).get(`/api/quizzes/${quizSlug}`);
      expect(res.status).toBe(200);
      const quiz = (await res.json()) as { slug: string; questions: unknown[] };
      expect(quiz.slug).toBe(quizSlug);
      expect(Array.isArray(quiz.questions)).toBe(true);
    });

    it("GET /api/quizzes supports status filter", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/quizzes?status=ACTIVE&limit=3");
      expect(res.status).toBe(200);
    });

    it("GET /api/quizzes supports pagination", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/quizzes?limit=1&page=1");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/quizzes/{slug}/attempt", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).post(`/api/quizzes/${quizSlug}/attempt`, {
        answers: [],
      });
      expect(res.status).toBe(401);
    });

    it("returns 404 for unknown quiz", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/quizzes/fake-quiz/attempt", {
        answers: [],
      });
      expect(res.status).toBe(404);
    });

    it("submits attempt and returns score shape", async () => {
      if (skipUnless(ctx, "auth")) return;
      const quiz = await fetchActiveQuizWithQuestions(clientFor(ctx));
      if (!quiz) return;

      const answers = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_id: q.options[0]?.id,
      }));

      const res = await clientFor(ctx, "USER").post(`/api/quizzes/${quiz.slug}/attempt`, {
        answers,
      });

      // First attempt: 200; repeat: 400 one-attempt guard
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        const body = (await res.json()) as {
          score: number;
          correctAnswers: number;
          totalQuestions: number;
          pointsAwarded: number;
        };
        expect(typeof body.score).toBe("number");
        expect(typeof body.correctAnswers).toBe("number");
        expect(body.totalQuestions).toBe(quiz.questions.length);
        expect(body.score).toBeGreaterThanOrEqual(0);
        expect(body.score).toBeLessThanOrEqual(100);
      }
    });

    it("enforces one-attempt guard on duplicate submit", async () => {
      if (skipUnless(ctx, "auth")) return;
      const quiz = await fetchActiveQuizWithQuestions(clientFor(ctx));
      if (!quiz) return;

      const api = clientFor(ctx, "USER");
      const answers = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_id: q.options[0]?.id,
      }));

      const first = await api.post(`/api/quizzes/${quiz.slug}/attempt`, { answers });
      if (first.status !== 200) return;

      const second = await api.post(`/api/quizzes/${quiz.slug}/attempt`, { answers });
      expect(second.status).toBe(400);
      const body = (await second.json()) as { error: string };
      expect(body.error.toLowerCase()).toContain("already");
    });
  });

  describe("leaderboard", () => {
    it("GET leaderboard returns shape for guest", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).get(`/api/quizzes/${quizSlug}/leaderboard`);
      expect(res.status).toBe(200);
      const data = (await res.json()) as { items?: unknown[] };
      expect(data).toBeTruthy();
    });

    it("GET leaderboard supports period param", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).get(
        `/api/quizzes/${quizSlug}/leaderboard?period=monthly`,
      );
      expect(res.status).toBe(200);
    });
  });

  describe("score validation", () => {
    it("attempt with empty answers yields zero score when allowed", async () => {
      if (skipUnless(ctx, "auth")) return;
      const slug = await fetchActiveQuizSlug(clientFor(ctx));
      if (!slug) return;

      const detail = await clientFor(ctx).get(`/api/quizzes/${slug}`);
      const quiz = (await detail.json()) as { questions: { id: string }[] };
      if (!quiz.questions?.length) return;

      const res = await clientFor(ctx, "CONTRIBUTOR").post(`/api/quizzes/${slug}/attempt`, {
        answers: quiz.questions.map((q) => ({
          question_id: q.id,
          selected_option_id: "00000000-0000-0000-0000-000000000099",
        })),
      });

      if (res.status === 200) {
        const body = (await res.json()) as { score: number; correctAnswers: number };
        expect(body.correctAnswers).toBe(0);
        expect(body.score).toBe(0);
      } else {
        expect(res.status).toBe(400);
      }
    });
  });
});
