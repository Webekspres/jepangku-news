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

    it("GET /api/quizzes returns quiz card fields", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/quizzes?limit=1&status=ACTIVE");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        quizzes: {
          slug: string;
          title: string;
          questionCount: number;
          pointsReward: number;
        }[];
      };
      const card = data.quizzes?.[0];
      if (!card) return;
      expect(typeof card.slug).toBe("string");
      expect(typeof card.title).toBe("string");
      expect(typeof card.questionCount).toBe("number");
      expect(typeof card.pointsReward).toBe("number");
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

    it("GET leaderboard supports monthly period", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).get(
        `/api/quizzes/${quizSlug}/leaderboard?period=monthly`,
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as { entries: unknown[]; period: string };
      expect(data.period).toBe("monthly");
      expect(Array.isArray(data.entries)).toBe(true);
    });

    it("GET leaderboard supports all-time period", async () => {
      if (skipUnless(ctx, "server") || !quizSlug) return;
      const res = await clientFor(ctx).get(
        `/api/quizzes/${quizSlug}/leaderboard?period=sepanjang-waktu`,
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as { entries: unknown[]; period: string };
      expect(data.period).toBe("sepanjang-waktu");
      expect(Array.isArray(data.entries)).toBe(true);
    });
  });

  describe("points after quiz", () => {
    it("awards base + per-correct points per quiz rules", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `Integration Quiz ${Date.now()}`;
      const createRes = await admin.post("/api/admin/quizzes", {
        title,
        status: "ACTIVE",
        pointsReward: 10,
        correctAnswerPoints: 5,
        questions: [
          {
            question_text: "Pertanyaan satu?",
            options: [
              { option_text: "Benar", is_correct: true },
              { option_text: "Salah", is_correct: false },
            ],
          },
          {
            question_text: "Pertanyaan dua?",
            options: [
              { option_text: "Salah", is_correct: false },
              { option_text: "Benar", is_correct: true },
            ],
          },
        ],
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/quizzes/${id}`);
      expect(detailRes.status).toBe(200);
      const quiz = (await detailRes.json()) as {
        slug: string;
        questions: {
          id: string;
          options: { id: string; isCorrect: boolean }[];
        }[];
      };

      const answers = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_id: q.options.find((o) => o.isCorrect)!.id,
      }));

      const attemptRes = await clientFor(ctx, "CONTRIBUTOR").post(
        `/api/quizzes/${quiz.slug}/attempt`,
        { answers },
      );
      expect(attemptRes.status).toBe(200);
      const body = (await attemptRes.json()) as {
        correctAnswers: number;
        score: number;
        pointsAwarded: number;
      };
      expect(body.correctAnswers).toBe(2);
      expect(body.score).toBe(100);
      expect(body.pointsAwarded).toBe(10 + 5 * 2);
    });
  });

  describe("admin CRUD", () => {
    it("POST /api/admin/quizzes creates multi-question quiz", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `CRUD Quiz ${Date.now()}`;
      const createRes = await admin.post("/api/admin/quizzes", {
        title,
        status: "DRAFT",
        thumbnailUrl: "https://cdn.example.com/quiz-thumb.jpg",
        questions: [
          {
            question_text: "Soal A?",
            image_url: "https://cdn.example.com/q1.jpg",
            options: [
              { option_text: "Opsi 1", is_correct: true, image_url: "https://cdn.example.com/o1.jpg" },
              { option_text: "Opsi 2", is_correct: false },
            ],
          },
          {
            question_text: "Soal B?",
            options: [
              { option_text: "Opsi 3", is_correct: false },
              { option_text: "Opsi 4", is_correct: true },
            ],
          },
        ],
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/quizzes/${id}`);
      expect(detailRes.status).toBe(200);
      const quiz = (await detailRes.json()) as {
        questions: { questionText: string; imageUrl: string | null; options: unknown[] }[];
        thumbnailUrl: string | null;
      };
      expect(quiz.questions).toHaveLength(2);
      expect(quiz.questions[0]?.imageUrl).toBeTruthy();
      expect(quiz.questions[0]?.options).toHaveLength(2);
      expect(quiz.thumbnailUrl).toBeTruthy();

      const deleteRes = await admin.delete(`/api/admin/quizzes/${id}`);
      expect(deleteRes.status).toBe(200);
    });

    it("GET /api/admin/analytics/quizzes/{id} returns attempt stats", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const listRes = await admin.get("/api/admin/quizzes?status=ACTIVE");
      expect(listRes.status).toBe(200);
      const quizzes = (await listRes.json()) as { id: string }[];
      const quizId = quizzes[0]?.id;
      if (!quizId) return;

      const res = await admin.get(`/api/admin/analytics/quizzes/${quizId}`);
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        totalAttempts: number;
        passRate: number;
        quiz: { title: string };
      };
      expect(typeof data.totalAttempts).toBe("number");
      expect(typeof data.passRate).toBe("number");
      expect(data.quiz?.title).toBeTruthy();
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
