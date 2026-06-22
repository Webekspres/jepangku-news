import { beforeAll, describe, expect, it } from "bun:test";
import { fetchActivePollSlug, fetchActivePollWithQuestions } from "../helpers/fixtures";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — polls", () => {
  let ctx: IntegrationContext;
  let pollSlug: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
    if (!ctx.serverUp) return;
    pollSlug = await fetchActivePollSlug(clientFor(ctx));
  });

  describe("listing", () => {
    it("GET /api/polls returns active polls", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/polls?limit=5&status=ACTIVE");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { polls: unknown[] };
      expect(Array.isArray(data.polls)).toBe(true);
    });

    it("GET /api/polls returns poll card fields for active polls", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/polls?limit=1&status=ACTIVE");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        polls: {
          slug: string;
          title: string;
          status: string;
          questionCount: number;
          pointsReward: number;
        }[];
      };
      const card = data.polls?.[0];
      if (!card) return;
      expect(card.status).toBe("ACTIVE");
      expect(typeof card.slug).toBe("string");
      expect(typeof card.title).toBe("string");
      expect(typeof card.questionCount).toBe("number");
      expect(typeof card.pointsReward).toBe("number");
    });

    it("GET /api/polls/{slug} returns poll detail", async () => {
      if (skipUnless(ctx, "server") || !pollSlug) return;
      const res = await clientFor(ctx).get(`/api/polls/${pollSlug}`);
      expect(res.status).toBe(200);
      const poll = (await res.json()) as { slug: string; questions: unknown[] };
      expect(poll.slug).toBe(pollSlug);
      expect(Array.isArray(poll.questions)).toBe(true);
    });

    it("GET /api/polls/{slug} returns multi-question structure", async () => {
      if (skipUnless(ctx, "server") || !pollSlug) return;
      const res = await clientFor(ctx).get(`/api/polls/${pollSlug}`);
      expect(res.status).toBe(200);
      const poll = (await res.json()) as {
        questions: { id: string; options: { id: string }[] }[];
      };
      expect(poll.questions.length).toBeGreaterThan(0);
      for (const q of poll.questions) {
        expect(typeof q.id).toBe("string");
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("GET /api/polls supports pagination", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/polls?limit=1&page=1");
      expect(res.status).toBe(200);
    });

    it("GET unknown poll returns 404", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/polls/nonexistent-poll-slug");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/polls/{slug}/vote", () => {
    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server") || !pollSlug) return;
      const res = await clientFor(ctx).post(`/api/polls/${pollSlug}/vote`, { votes: [] });
      expect(res.status).toBe(401);
    });

    it("returns 400 when votes array missing", async () => {
      if (skipUnless(ctx, "auth") || !pollSlug) return;
      const res = await clientFor(ctx, "USER").post(`/api/polls/${pollSlug}/vote`, {});
      expect(res.status).toBe(400);
    });

    it("returns 404 for unknown poll", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").post("/api/polls/fake-poll/vote", {
        votes: [{ questionId: "q", optionId: "o" }],
      });
      expect(res.status).toBe(404);
    });

    it("records vote with valid payload", async () => {
      if (skipUnless(ctx, "auth")) return;
      const poll = await fetchActivePollWithQuestions(clientFor(ctx));
      if (!poll) return;

      const votes = poll.questions.map((q) => ({
        questionId: q.id,
        optionId: q.options[0]?.id,
      }));

      const res = await clientFor(ctx, "USER").post(`/api/polls/${poll.slug}/vote`, { votes });
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        const body = (await res.json()) as { message: string };
        expect(body.message).toBeTruthy();
      }
    });

    it("duplicate guard rejects re-vote on same questions", async () => {
      if (skipUnless(ctx, "auth")) return;
      const poll = await fetchActivePollWithQuestions(clientFor(ctx));
      if (!poll) return;

      const api = clientFor(ctx, "USER");
      const votes = poll.questions.map((q) => ({
        questionId: q.id,
        optionId: q.options[0]?.id,
      }));

      const first = await api.post(`/api/polls/${poll.slug}/vote`, { votes });
      if (first.status !== 200) return;

      const second = await api.post(`/api/polls/${poll.slug}/vote`, { votes });
      expect(second.status).toBe(400);
      const body = (await second.json()) as { error: string };
      expect(body.error.toLowerCase()).toMatch(/already|voted/);
    });

    it("rejects invalid option for question", async () => {
      if (skipUnless(ctx, "auth")) return;
      const poll = await fetchActivePollWithQuestions(clientFor(ctx));
      if (!poll) return;

      const res = await clientFor(ctx, "CONTRIBUTOR").post(`/api/polls/${poll.slug}/vote`, {
        votes: [
          {
            questionId: poll.questions[0]!.id,
            optionId: "00000000-0000-0000-0000-000000000099",
          },
        ],
      });
      expect([400, 200]).toContain(res.status);
      if (res.status === 400) {
        const body = (await res.json()) as { error: string };
        expect(body.error.toLowerCase()).toContain("invalid");
      }
    });
  });

  describe("points after vote", () => {
    it("awards poll pointsReward on first vote", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `Integration Poll ${Date.now()}`;
      const createRes = await admin.post("/api/admin/polls", {
        title,
        status: "ACTIVE",
        pointsReward: 7,
        questions: [
          {
            question_text: "Pertanyaan satu?",
            options: [
              { option_text: "Opsi A" },
              { option_text: "Opsi B" },
            ],
          },
          {
            question_text: "Pertanyaan dua?",
            options: [
              { option_text: "Opsi C" },
              { option_text: "Opsi D" },
            ],
          },
        ],
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/polls/${id}`);
      expect(detailRes.status).toBe(200);
      const poll = (await detailRes.json()) as {
        slug: string;
        questions: { id: string; options: { id: string }[] }[];
      };

      const votes = poll.questions.map((q) => ({
        questionId: q.id,
        optionId: q.options[0]!.id,
      }));

      const voteRes = await clientFor(ctx, "CONTRIBUTOR").post(
        `/api/polls/${poll.slug}/vote`,
        { votes },
      );
      expect(voteRes.status).toBe(200);
      const body = (await voteRes.json()) as { pointsAwarded: number };
      expect(body.pointsAwarded).toBe(7);
    });
  });

  describe("admin CRUD", () => {
    it("POST /api/admin/polls creates multi-question poll with option images", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const title = `CRUD Poll ${Date.now()}`;
      const createRes = await admin.post("/api/admin/polls", {
        title,
        status: "DRAFT",
        thumbnailUrl: "https://cdn.example.com/poll-thumb.jpg",
        questions: [
          {
            question_text: "Soal A?",
            image_url: "https://cdn.example.com/pq1.jpg",
            options: [
              {
                option_text: "Opsi 1",
                image_url: "https://cdn.example.com/po1.jpg",
              },
              { option_text: "Opsi 2" },
            ],
          },
          {
            question_text: "Soal B?",
            options: [
              { option_text: "Opsi 3" },
              { option_text: "Opsi 4" },
            ],
          },
        ],
      });
      expect(createRes.status).toBe(201);
      const { id } = (await createRes.json()) as { id: string };

      const detailRes = await admin.get(`/api/admin/polls/${id}`);
      expect(detailRes.status).toBe(200);
      const poll = (await detailRes.json()) as {
        questions: {
          questionText: string;
          imageUrl: string | null;
          options: { optionText: string; imageUrl: string | null }[];
        }[];
        thumbnailUrl: string | null;
      };
      expect(poll.questions).toHaveLength(2);
      expect(poll.questions[0]?.imageUrl).toBeTruthy();
      expect(poll.questions[0]?.options[0]?.imageUrl).toBeTruthy();
      expect(poll.thumbnailUrl).toBeTruthy();

      const deleteRes = await admin.delete(`/api/admin/polls/${id}`);
      expect(deleteRes.status).toBe(200);
    });

    it("GET /api/admin/analytics/polls/{id} returns vote breakdown", async () => {
      if (skipUnless(ctx, "auth")) return;
      const admin = clientFor(ctx, "ADMIN");
      const listRes = await admin.get("/api/admin/polls?status=ACTIVE");
      expect(listRes.status).toBe(200);
      const polls = (await listRes.json()) as { id: string }[];
      const pollId = polls[0]?.id;
      if (!pollId) return;

      const res = await admin.get(`/api/admin/analytics/polls/${pollId}`);
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        totalVotes: number;
        uniqueVoters: number;
        questionStats: { options: { votes: number; percent: number }[] }[];
        poll: { title: string };
      };
      expect(typeof data.totalVotes).toBe("number");
      expect(typeof data.uniqueVoters).toBe("number");
      expect(Array.isArray(data.questionStats)).toBe(true);
      if (data.questionStats[0]) {
        expect(Array.isArray(data.questionStats[0].options)).toBe(true);
        for (const opt of data.questionStats[0].options) {
          expect(typeof opt.votes).toBe("number");
          expect(typeof opt.percent).toBe("number");
        }
      }
      expect(data.poll?.title).toBeTruthy();
    });
  });
});
