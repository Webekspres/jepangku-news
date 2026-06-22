import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@/lib/db";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

async function fetchAuthorUsername(
  ctx: IntegrationContext,
): Promise<string | null> {
  const res = await clientFor(ctx).get("/api/articles?limit=10&status=PUBLISHED");
  if (!res.ok) return null;
  const data = (await res.json()) as {
    articles?: { author?: { username?: string | null } }[];
  };
  for (const article of data.articles ?? []) {
    if (article.author?.username) return article.author.username;
  }
  return null;
}

/**
 * Functional checklist §2 — Profil & data user (API/integration).
 * Browser flows: e2e/profile.spec.ts + e2e/profile-section2.spec.ts
 */
describe("§2 Profil & data user — API checklist", () => {
  let ctx: IntegrationContext;
  let restoredDisplayName: string | null = null;
  let restoredUserId: string | null = null;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  afterEach(async () => {
    if (!restoredUserId || restoredDisplayName === null) return;
    if (!process.env.DATABASE_URL?.trim()) return;
    try {
      const profile = await db.userProfile.findUnique({
        where: { userId: restoredUserId },
      });
      if (profile) {
        await db.userProfile.update({
          where: { userId: restoredUserId },
          data: { displayName: restoredDisplayName },
        });
      }
    } catch {
      // best-effort restore after mutation tests
    }
    restoredDisplayName = null;
    restoredUserId = null;
  });

  describe("2.1 GET /api/user/profile", () => {
    it("returns name, username, avatar, and profile fields for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/user/profile");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        name: string;
        username: string;
        email: string;
        avatarUrl: string | null;
        displayName: string;
        bio: string;
      };
      expect(data.name).toBeTruthy();
      expect(data.username).toMatch(/^[a-z0-9_]+$/);
      expect(data.email).toContain("@");
      expect(data).toHaveProperty("avatarUrl");
      expect(data.displayName).toBeTruthy();
      expect(typeof data.bio).toBe("string");
    });

    it("returns 401 for guest", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/user/profile");
      expect(res.status).toBe(401);
    });
  });

  describe("2.2 Edit profil — update & validasi", () => {
    it("PATCH updates displayName and persists to GET", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "USER");
      const before = (await api.json(await api.get("/api/user/profile"))) as {
        id: string;
        displayName: string;
      };
      restoredUserId = before.id;
      restoredDisplayName = before.displayName;

      const updated = `QA Display ${Date.now()}`;
      const patch = await api.patch("/api/user/profile", { displayName: updated });
      expect(patch.status).toBe(200);

      const after = (await api.json(await api.get("/api/user/profile"))) as {
        displayName: string;
      };
      expect(after.displayName).toBe(updated);
    });

    it("PATCH rejects empty name with 400", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch("/api/user/profile", { name: "" });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toContain("kosong");
    });

    it("PATCH rejects invalid username charset with 400", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").patch("/api/user/profile", {
        username: "Bad-User",
      });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error.toLowerCase()).toContain("username");
    });
  });

  describe("2.3 Avatar — PATCH avatarUrl", () => {
    it("PATCH avatarUrl persists and GET reflects change", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "USER");
      const before = (await api.json(await api.get("/api/user/profile"))) as {
        id: string;
        avatarUrl: string | null;
      };
      const testUrl = "https://example.com/qa-avatar-test.webp";
      const patch = await api.patch("/api/user/profile", { avatarUrl: testUrl });
      expect(patch.status).toBe(200);

      const after = (await api.json(await api.get("/api/user/profile"))) as {
        avatarUrl: string | null;
      };
      expect(after.avatarUrl).toBe(testUrl);

      await api.patch("/api/user/profile", { avatarUrl: before.avatarUrl });
    });
  });

  describe("2.4 Username — cooldown", () => {
    it("username change succeeds when cooldown is clear", async () => {
      if (skipUnless(ctx, "auth")) return;
      if (!process.env.DATABASE_URL?.trim()) return;

      const api = clientFor(ctx, "USER");
      const profile = (await api.json(await api.get("/api/user/profile"))) as {
        id: string;
        username: string;
      };

      const alt = `${profile.username}`.slice(0, 26) + "_q";
      if (alt === profile.username || alt.length > 30) return;

      await db.user.update({
        where: { id: profile.id },
        data: { usernameChangedAt: null },
      });

      const patch = await api.patch("/api/user/profile", { username: alt });
      expect(patch.status).toBe(200);

      await api.patch("/api/user/profile", { username: profile.username });
      await db.user.update({
        where: { id: profile.id },
        data: { usernameChangedAt: null },
      });
    });

    it("rejects username change within 14-day cooldown with 429", async () => {
      if (skipUnless(ctx, "auth")) return;
      if (!process.env.DATABASE_URL?.trim()) return;

      const api = clientFor(ctx, "USER");
      const profile = (await api.json(await api.get("/api/user/profile"))) as {
        id: string;
        username: string;
        usernameChangedAt: string | null;
      };

      const previousChangedAt = profile.usernameChangedAt
        ? new Date(profile.usernameChangedAt)
        : null;

      await db.user.update({
        where: { id: profile.id },
        data: { usernameChangedAt: new Date() },
      });

      try {
        const res = await api.patch("/api/user/profile", {
          username: `${profile.username}x`,
        });
        expect(res.status).toBe(429);
        const body = (await res.json()) as { cooldownDaysLeft: number };
        expect(body.cooldownDaysLeft).toBeGreaterThan(0);
      } finally {
        await db.user.update({
          where: { id: profile.id },
          data: { usernameChangedAt: previousChangedAt },
        });
      }
    });
  });

  describe("2.5 & 2.6 Public profile API", () => {
    it("GET /api/profile/[username] returns 404 for missing user", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/profile/nonexistent_user_xyz");
      expect(res.status).toBe(404);
    });

    it("GET /api/profile/[username] returns stats and articles for contributor", async () => {
      if (skipUnless(ctx, "server")) return;
      const username = await fetchAuthorUsername(ctx);
      if (!username) return;

      const res = await clientFor(ctx).get(`/api/profile/${username}`);
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        profile: {
          username: string;
          stats: { publishedArticles: number };
          isContributor: boolean;
        };
        articles: unknown[];
      };
      expect(data.profile.username).toBe(username);
      expect(typeof data.profile.stats.publishedArticles).toBe("number");
      expect(Array.isArray(data.articles)).toBe(true);
    });
  });

  describe("2.7 Gamifikasi", () => {
    it("GET /api/user/gamification returns point balance for USER", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "USER").get("/api/user/gamification");
      expect(res.status).toBe(200);
      const body = (await res.json()) as { totalPoints: number };
      expect(typeof body.totalPoints).toBe("number");
      expect(body.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it("gamification balance matches /api/auth/me totalPoints", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "USER");
      const [meRes, gamRes] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/user/gamification"),
      ]);
      const me = (await meRes.json()) as { totalPoints: number };
      const gam = (await gamRes.json()) as { totalPoints: number };
      expect(me.totalPoints).toBe(gam.totalPoints);
    });
  });

  describe("2.8 PATCH /api/user/profile — persist ke DB", () => {
    it("PATCH bio persists across GET", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "USER");
      const before = (await api.json(await api.get("/api/user/profile"))) as {
        bio: string;
      };
      const bio = `QA bio ${Date.now()}`;

      const patch = await api.patch("/api/user/profile", { bio });
      expect(patch.status).toBe(200);

      const after = (await api.json(await api.get("/api/user/profile"))) as { bio: string };
      expect(after.bio).toBe(bio);

      await api.patch("/api/user/profile", { bio: before.bio });
    });
  });
});
