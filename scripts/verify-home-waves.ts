import { parseApiResponse } from '@/lib/fetch-api';
/**
 * Smoke-test homepage wave APIs (replaces legacy /api/homepage E2E dependency).
 * Run: bun run verify:home
 */
export {};
const baseUrl = process.env.NEWS_BASE_URL ?? "http://localhost:3000";

const WAVE_ENDPOINTS = [
  { wave: 1, path: "/api/home/feed" },
  { wave: 2, path: "/api/home/categories-editorial" },
  { wave: 3, path: "/api/home/tv" },
  { wave: 3, path: "/api/home/ads?slot=center" },
  { wave: 3, path: "/api/home/lms-teaser" },
  { wave: 3, path: "/api/home/reactions" },
  { wave: 4, path: "/api/home/engagement" },
] as const;

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
  console.log(`[${ok ? "OK" : "FAIL"}] ${name}: ${detail}`);
}

async function main() {
  record("NEWS_BASE_URL", Boolean(baseUrl), baseUrl);

  for (const { wave, path } of WAVE_ENDPOINTS) {
    const url = `${baseUrl}${path}`;
    try {
      const res = await fetch(url);
      const ok = res.ok;
      let detail = `wave=${wave} status=${res.status}`;
      if (ok) {
        const json = await parseApiResponse(res);
        if (path.endsWith("/feed")) {
          detail += ` featured=${json.featuredArticles?.length ?? 0} trending=${json.trending?.length ?? 0} today=${json.todayArticles?.length ?? 0}`;
        } else if (path.includes("engagement")) {
          detail += ` polls=${json.polls?.length ?? 0} quizzes=${json.quizzes?.length ?? 0}`;
        } else if (path.includes("reactions")) {
          detail += ` articles=${json.articles?.length ?? 0}`;
        }
      } else {
        detail += ` body=${(await res.text()).slice(0, 120)}`;
      }
      record(`GET ${path}`, ok, detail);
    } catch (error) {
      record(
        `GET ${path}`,
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  try {
    const legacy = await fetch(`${baseUrl}/api/homepage`);
    record(
      "Legacy /api/homepage removed",
      legacy.status === 404,
      legacy.status === 404 ? "404 as expected" : `unexpected status=${legacy.status}`,
    );
  } catch (error) {
    record(
      "Legacy /api/homepage removed",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\nHome wave checks: ${checks.length - failed}/${checks.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
