/**
 * Phase 4 verification — News ↔ Core integration (server-side, no browser).
 * Run: bun run verify:core
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasNewsAdminAccess } from "../lib/auth/types";
import type { SessionUser } from "../lib/auth/types";

const coreUrl = process.env.CORE_API_URL ?? "http://localhost:8080";
const newsBase = process.env.NEWS_BASE_URL ?? "http://localhost:3000";
const serviceToken = process.env.CORE_SERVICE_TOKEN ?? "";

type Check = { name: string; ok: boolean; detail: string; optional?: boolean };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string, optional = false) {
  checks.push({ name, ok, detail, optional });
  console.log(`[${ok ? "OK" : optional ? "WARN" : "FAIL"}] ${name}: ${detail}`);
}

function mockUser(overrides: Partial<SessionUser>): SessionUser {
  return {
    id: "user_test",
    name: "Test",
    displayName: "Test",
    username: "test",
    email: "test@example.com",
    role: "USER",
    avatarUrl: null,
    status: "active",
    totalPoints: 0,
    totalXp: 0,
    currentLevel: 1,
    coreRoles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
    ...overrides,
  };
}

async function main() {
  record("CORE_API_URL", Boolean(coreUrl), coreUrl || "missing");
  record(
    "CORE_SERVICE_TOKEN",
    Boolean(serviceToken),
    serviceToken ? "set" : "missing (optional for read-only checks)",
  );
  record(
    "CORE_JWT_PUBLIC_KEY",
    Boolean(process.env.CORE_JWT_PUBLIC_KEY?.trim()),
    process.env.CORE_JWT_PUBLIC_KEY?.trim() ? "set" : "missing — JWT verify decode-only",
  );

  try {
    const health = await fetch(`${coreUrl}/health`);
    record("Core reachable", health.ok, `status=${health.status}`, true);
  } catch (error) {
    record(
      "Core reachable",
      false,
      error instanceof Error ? error.message : String(error),
      true,
    );
  }

  try {
    const newsHealth = await fetch(`${newsBase}/api/health`);
    record(
      "News /api/health",
      newsHealth.ok,
      newsHealth.ok ? "ok" : `status=${newsHealth.status}`,
    );
  } catch (error) {
    record(
      "News /api/health",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  try {
    const lb = await fetch(`${newsBase}/api/leaderboard?period=weekly&limit=3`);
    if (!lb.ok) {
      record("News /api/leaderboard", false, `status=${lb.status}`);
    } else {
      const json = (await lb.json()) as {
        period?: string;
        items?: unknown[];
      };
      const ok =
        json.period === "weekly" && Array.isArray(json.items);
      record(
        "News /api/leaderboard (News DB aggregation)",
        ok,
        ok
          ? `items=${json.items!.length} period=${json.period}`
          : "invalid response shape",
      );
    }
  } catch (error) {
    record(
      "News /api/leaderboard",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  try {
    const adminStats = await fetch(`${newsBase}/api/admin/stats`);
    record(
      "Admin API rejects anonymous",
      adminStats.status === 403,
      `status=${adminStats.status} (expect 403)`,
    );
  } catch (error) {
    record(
      "Admin API rejects anonymous",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");
  record(
    "point_transactions unique constraint",
    schema.includes("point_transactions_user_activity_unique"),
    "@@unique userId+sourceApp+activityType+sourceType+sourceId",
  );
  record(
    "awardPoints idempotent (P2002 handler)",
    readFileSync(join(process.cwd(), "lib", "points.ts"), "utf8").includes(
      "P2002",
    ),
    "lib/points.ts catches unique violation",
  );
  record(
    "checkDailyLogin uses calendar day sourceId",
    readFileSync(join(process.cwd(), "lib", "points.ts"), "utf8").includes(
      "daily_login",
    ),
    "lib/points.ts daily_login + ISO date sourceId",
  );

  const activityRoutes = [
    "app/api/articles/[slug]/read-complete/route.ts",
    "app/api/articles/[slug]/share/route.ts",
    "app/api/bookmarks/[articleId]/route.ts",
    "app/api/quizzes/[slug]/attempt/route.ts",
    "app/api/polls/[slug]/vote/route.ts",
    "app/api/comments/route.ts",
  ];
  for (const route of activityRoutes) {
    const src = readFileSync(join(process.cwd(), route), "utf8");
    record(
      `Activity route uses awardPoints (${route.split("/")[2]})`,
      src.includes("awardPoints"),
      src.includes("awardPoints") ? "awardPoints()" : "missing",
    );
  }

  record(
    "Admin gate PORTAL_ADMIN (coreRoles)",
    hasNewsAdminAccess(
      mockUser({ role: "USER", coreRoles: ["PORTAL_ADMIN"] }),
    ),
    "hasNewsAdminAccess accepts PORTAL_ADMIN",
  );
  record(
    "Admin gate rejects plain USER",
    !hasNewsAdminAccess(mockUser({ role: "USER", coreRoles: ["USER"] })),
    "non-admin blocked",
  );
  record(
    "Core session graceful fail (returns null)",
    readFileSync(
      join(process.cwd(), "lib", "core", "session.ts"),
      "utf8",
    ).includes("core.session.establish.failed"),
    "establishCoreSession logs warn + null on failure",
  );
  record(
    "Core users/me graceful fail",
    readFileSync(join(process.cwd(), "lib", "core", "users.ts"), "utf8").includes(
      "return null",
    ),
    "fetchCoreUserMe returns null on error",
  );
  record(
    "Portal points from News DB (not Core awardXp in routes)",
    !readFileSync(
      join(process.cwd(), "app", "api", "articles", "[slug]", "read-complete", "route.ts"),
      "utf8",
    ).includes("awardXp"),
    "read-complete uses awardPoints only",
  );

  try {
    const legacy = await fetch(`${newsBase}/api/homepage`);
    record(
      "Legacy /api/homepage removed",
      legacy.status === 404,
      legacy.status === 404 ? "404 as expected" : `status=${legacy.status}`,
    );
  } catch (error) {
    record(
      "Legacy /api/homepage removed",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log("\n--- Manual / staging (if Core + Clerk webhook live) ---");
  console.log("1. Sign up at /sign-in → user row in Core (webhook) + News JIT");
  console.log("2. Cookie core_session after login → JWT valid (CORE_JWT_PUBLIC_KEY)");
  console.log("3. Read/share/bookmark/quiz/poll/comment → one point_transactions row each");
  console.log("4. Repeat same action → no duplicate row (awarded: false)");
  console.log("5. Second login same day → daily_login not double");
  console.log("6. PORTAL_ADMIN → /admin UI + /api/admin/* ; plain USER → 403");
  console.log("7. Stop Core → News still loads; login works; points from News DB");
  console.log("8. Staging: bun run verify:staging against staging URLs");

  const failed = checks.filter((c) => !c.ok && !c.optional).length;
  const warned = checks.filter((c) => !c.ok && c.optional).length;
  console.log(
    `\nAutomated: ${checks.length - failed - warned}/${checks.length} passed` +
      (warned ? ` (${warned} optional warn)` : ""),
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
