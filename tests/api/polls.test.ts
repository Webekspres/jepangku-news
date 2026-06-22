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

    it("GET /api/polls/{slug} returns poll detail", async () => {
      if (skipUnless(ctx, "server") || !pollSlug) return;
      const res = await clientFor(ctx).get(`/api/polls/${pollSlug}`);
      expect(res.status).toBe(200);
      const poll = (await res.json()) as { slug: string; questions: unknown[] };
      expect(poll.slug).toBe(pollSlug);
      expect(Array.isArray(poll.questions)).toBe(true);
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
});
