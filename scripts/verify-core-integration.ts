/**
 * Phase 4 checks for News ↔ Core (server-side, no browser).
 * Run: bun run scripts/verify-core-integration.ts
 */
export {};
const coreUrl = process.env.CORE_API_URL ?? "http://localhost:8080";
const serviceToken = process.env.CORE_SERVICE_TOKEN ?? "";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
  console.log(`[${ok ? "OK" : "FAIL"}] ${name}: ${detail}`);
}

async function main() {
  record("CORE_API_URL", Boolean(coreUrl), coreUrl || "missing");
  record("CORE_SERVICE_TOKEN", Boolean(serviceToken), serviceToken ? "set" : "missing");

  const health = await fetch(`${coreUrl}/health`);
  record("Core reachable from News env", health.ok, `status=${health.status}`);

  const leaderboard = await fetch(`${coreUrl}/api/v1/leaderboard?limit=3`);
  record(
    "Leaderboard API",
    leaderboard.ok,
    leaderboard.ok ? `status=${leaderboard.status}` : await leaderboard.text(),
  );

  const newsPoints = await fetch("http://localhost:3000/api/leaderboard/weekly");
  record(
    "News /api/leaderboard/weekly",
    newsPoints.ok,
    newsPoints.ok ? `status=${newsPoints.status}` : "News dev server not running on :3000",
  );

  const newsHealth = await fetch("http://localhost:3000/api/health").catch(() => null);
  record(
    "News dev server",
    Boolean(newsHealth?.ok),
    newsHealth?.ok ? "running :3000" : "start with bun dev in jepangku-news",
  );

  console.log("\n--- Manual checks (browser) ---");
  console.log("1. Sign up / login at http://localhost:3000/sign-in");
  console.log("2. Cookie core_session should appear after login");
  console.log("3. Navbar shows points from Core");
  console.log("4. Read article → gamification_logs in Core");
  console.log("5. Admin with NEWS_EDITOR → /admin accessible");
  console.log("\n--- Clerk webhook (Step 2) ---");
  console.log("Dashboard → Webhooks → POST https://<core-host>/api/v1/auth/webhooks/clerk");
  console.log("Events: user.created, user.updated, user.deleted");
  console.log("Secret → CLERK_WEBHOOK_SECRET in jepangku-core only");

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\nAutomated: ${checks.length - failed}/${checks.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
