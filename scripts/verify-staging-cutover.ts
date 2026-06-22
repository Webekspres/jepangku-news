/**
 * Staging / pre-production cutover smoke test.
 * Run against staging URLs:
 *   NEWS_BASE_URL=https://staging.news.example CORE_API_URL=https://core.jepangku.com bun run verify:staging
 */
export {};

const newsBase = process.env.NEWS_BASE_URL ?? "http://localhost:3000";
const coreUrl = process.env.CORE_API_URL ?? "http://localhost:8080";

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
  console.log(`[${ok ? "OK" : "FAIL"}] ${name}: ${detail}`);
}

async function main() {
  record("NEWS_BASE_URL", Boolean(newsBase), newsBase);
  record("CORE_API_URL", Boolean(coreUrl), coreUrl);

  const endpoints = [
    { name: "News homepage", url: `${newsBase}/` },
    { name: "News /api/health", url: `${newsBase}/api/health` },
    { name: "News /api/home/feed", url: `${newsBase}/api/home/feed` },
    { name: "News /api/leaderboard", url: `${newsBase}/api/leaderboard?period=weekly` },
    { name: "Core /health", url: `${coreUrl}/health` },
  ];

  for (const { name, url } of endpoints) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      record(name, res.ok, `status=${res.status}`);
    } catch (error) {
      record(name, false, error instanceof Error ? error.message : String(error));
    }
  }

  try {
    const admin = await fetch(`${newsBase}/api/admin/stats`);
    record(
      "News admin API locked (anonymous)",
      admin.status === 403,
      `status=${admin.status}`,
    );
  } catch (error) {
    record(
      "News admin API locked (anonymous)",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  console.log("\n--- Post-deploy manual staging checklist ---");
  console.log("- [ ] Clerk sign-up → Core user via webhook");
  console.log("- [ ] Login News → core_session cookie + navbar points");
  console.log("- [ ] Gamification flows (read, share, bookmark, quiz, poll, comment)");
  console.log("- [ ] Leaderboard tabs weekly / monthly / sepanjang-waktu");
  console.log("- [ ] PORTAL_ADMIN /admin access; USER rejected");
  console.log("- [ ] bun run test:e2e against staging NEWS_BASE_URL");
  console.log("- [ ] Simulate Core outage — portal remains usable (see docs/runbooks/core-service-down.md)");

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\nStaging smoke: ${checks.length - failed}/${checks.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
