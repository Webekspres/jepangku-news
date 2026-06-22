/**
 * Lighthouse scores on production build (homepage).
 * Prerequisite: bun run build && bun run start (or set NEWS_BASE_URL)
 * Run: bun run lighthouse:audit
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.NEWS_BASE_URL ?? "http://localhost:3000";
const outDir = join(process.cwd(), "docs", "lighthouse");

type ScoreRow = { formFactor: string; performance: number; accessibility: number; bestPractices: number; seo: number };

function runLighthouse(formFactor: "mobile" | "desktop"): ScoreRow | null {
  const outFile = join(outDir, `homepage-${formFactor}.json`);
  const formFactorFlag =
    formFactor === "mobile" ? "--form-factor=mobile" : "--preset=desktop";
  const result = spawnSync(
    "npx",
    [
      "lighthouse@12",
      `${baseUrl}/`,
      formFactorFlag,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox",
      "--output=json",
      `--output-path=${outFile}`,
      "--only-categories=performance,accessibility,best-practices,seo",
    ],
    { encoding: "utf8", shell: true, timeout: 180_000 },
  );

  if (result.status !== 0) {
    console.error(`Lighthouse ${formFactor} failed:`, result.stderr || result.stdout);
    return null;
  }

  try {
    const report = JSON.parse(readFileSync(outFile, "utf8")) as {
      categories: Record<string, { score: number }>;
    };
    const c = report.categories;
    return {
      formFactor,
      performance: Math.round((c.performance?.score ?? 0) * 100),
      accessibility: Math.round((c.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((c["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((c.seo?.score ?? 0) * 100),
    };
  } catch {
    console.error(`Could not parse Lighthouse ${formFactor} report at ${outFile}`);
    return null;
  }
}

function main() {
  mkdirSync(outDir, { recursive: true });
  console.log(`Lighthouse audit → ${baseUrl}/`);
  const scores: ScoreRow[] = [];

  for (const formFactor of ["mobile", "desktop"] as const) {
    const row = runLighthouse(formFactor);
    if (row) {
      scores.push(row);
      console.log(
        `[${formFactor}] performance=${row.performance} accessibility=${row.accessibility} best-practices=${row.bestPractices} seo=${row.seo}`,
      );
    }
  }

  if (scores.length === 0) {
    process.exit(1);
  }

  const summary = [
    "# Lighthouse — Homepage",
    "",
    `> **Diperbarui:** ${new Date().toISOString().slice(0, 10)} · URL: \`${baseUrl}/\``,
    "",
    "| Form factor | Performance | Accessibility | Best practices | SEO |",
    "| :--- | ---: | ---: | ---: | ---: |",
    ...scores.map(
      (s) =>
        `| ${s.formFactor} | ${s.performance} | ${s.accessibility} | ${s.bestPractices} | ${s.seo} |`,
    ),
    "",
    "Baseline sebelum QA (Juni 2026): Mobile **34** / Desktop **53** (performance).",
    "",
    "Jalankan ulang: `bun run build && bun run start` lalu `bun run lighthouse:audit`.",
  ].join("\n");

  writeFileSync(join(process.cwd(), "docs", "lighthouse-scores.md"), summary);
  console.log("\nWrote docs/lighthouse-scores.md");
}

main();
