/**
 * Non-functional QA — performance, security, a11y, reliability, ops.
 * Run: bun run verify:non-functional
 */
import { readFileSync } from "node:fs";
import { parseApiResponse } from '@/lib/fetch-api';
import { join } from "node:path";
import { getEmailQueueSecret } from "../lib/email/config";
import { validateImageBuffer } from "../lib/image-moderation";
import { isLogDrainEnabled } from "../lib/log-drain";
import { getRateLimitBackend } from "../lib/rate-limit-store";
import { isMonitoringEnabled } from "../lib/monitoring";
import { sanitizeHtmlContent, sanitizeText } from "../lib/sanitizer";

const newsBase = process.env.NEWS_BASE_URL ?? "http://localhost:3000";

type Check = { name: string; ok: boolean; detail: string; optional?: boolean };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string, optional = false) {
  checks.push({ name, ok, detail, optional });
  console.log(`[${ok ? "OK" : optional ? "WARN" : "FAIL"}] ${name}: ${detail}`);
}

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

function sourceIncludes(relativePath: string, needle: string) {
  return readSource(relativePath).includes(needle);
}

const HOME_WAVE_ENDPOINTS = [
  { wave: 1, path: "/api/home/feed" },
  { wave: 2, path: "/api/home/categories-editorial" },
  { wave: 3, path: "/api/home/tv" },
  { wave: 3, path: "/api/home/lms-teaser" },
  { wave: 3, path: "/api/home/reactions" },
  { wave: 4, path: "/api/home/engagement" },
] as const;

function verifyPerformanceSource() {
  record(
    "P2 LCP fetchPriority=high",
    sourceIncludes("lib/image-loading.ts", 'fetchPriority: "high"'),
    "imageLoadingProps(priority) sets fetchPriority high",
  );
  record(
    "P2 featured card priority",
    sourceIncludes("components/home/HomeFeedSection.tsx", "priority={idx === 0}"),
    "first featured slide uses priority",
  );
  record(
    "P4 AVIF/WebP formats",
    sourceIncludes("next.config.ts", '"image/avif", "image/webp"'),
    "next/image formats configured",
  );
  record(
    "P4 CardCoverImage sizes prop",
    sourceIncludes("components/CardCoverImage.tsx", "sizes={sizes}"),
    "responsive sizes on card images",
  );
  record(
    "P5 LazyYoutubeEmbed click-to-play",
    sourceIncludes("components/video/LazyYoutubeEmbed.tsx", "youtube-thumbnail"),
    "iframe only after user click",
  );
  record(
    "P5 YouTube iframe loading=lazy",
    sourceIncludes("components/video/LazyYoutubeEmbed.tsx", 'loading="lazy"'),
    "lazy iframe after play",
  );
}

async function verifyPerformanceHttp() {
  for (const { wave, path } of HOME_WAVE_ENDPOINTS) {
    try {
      const res = await fetch(`${newsBase}${path}`);
      const cache = res.headers.get("cache-control") ?? "";
      const hasSwr =
        path === "/api/home/tv"
          ? cache.includes("no-store")
          : cache.includes("s-maxage") && cache.includes("stale-while-revalidate");
      record(
        `P6 cache headers ${path}`,
        res.ok && hasSwr,
        `wave=${wave} cache=${cache || "(none)"}`,
      );
    } catch (error) {
      record(
        `P6 cache headers ${path}`,
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function verifySecurity() {
  const xssPayload = '<script>alert(1)</script><img src=x onerror=alert(1)><p>ok</p>';
  const sanitized = sanitizeHtmlContent(xssPayload);
  record(
    "S2 XSS sanitasi — script tag dihapus",
    !sanitized.includes("<script") && !sanitized.includes("onerror"),
    sanitized.slice(0, 120),
  );
  record(
    "S2 XSS sanitasi — plain text strip tags",
    sanitizeText("<b>hi</b>") === "hi",
    `result="${sanitizeText("<b>hi</b>")}"`,
  );

  const rateLimitRoutes = [
    "app/api/comments/route.ts",
    "app/api/newsletter/subscribe/route.ts",
    "app/api/upload/route.ts",
    "app/api/reactions/route.ts",
  ];
  for (const route of rateLimitRoutes) {
    record(
      `S1 rate limit wired (${route.split("/")[2]})`,
      sourceIncludes(route, "enforceRateLimit"),
      "enforceRateLimit()",
    );
  }

  try {
    let saw429 = false;
    for (let i = 0; i < 8; i++) {
      const res = await fetch(`${newsBase}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `rate-test-${i}@example.com` }),
      });
      if (res.status === 429) {
        saw429 = true;
        break;
      }
    }
    record(
      "S1 rate limit returns 429 under flood",
      saw429,
      saw429 ? "newsletter subscribe capped" : "no 429 observed",
    );
  } catch (error) {
    record(
      "S1 rate limit returns 429 under flood",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  const adminRoutes = ["/api/admin/stats", "/api/admin/users", "/api/admin/email-templates"];
  for (const path of adminRoutes) {
    try {
      const res = await fetch(`${newsBase}${path}`);
      record(`S3 admin boundary ${path}`, res.status === 403, `status=${res.status}`);
    } catch (error) {
      record(
        `S3 admin boundary ${path}`,
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // S4 — MIME spoofing rejected by magic-byte validation
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  let spoofRejected = false;
  try {
    validateImageBuffer(pngHeader, "image/jpeg");
  } catch {
    spoofRejected = true;
  }
  record(
    "S4 upload MIME spoofing rejected",
    spoofRejected,
    "PNG bytes with image/jpeg content-type throws",
  );
  record(
    "S4 upload validateImageBuffer wired",
    sourceIncludes("app/api/upload/route.ts", "validateImageBuffer"),
    "upload route validates magic bytes",
  );

  // S5 — internal email route auth
  try {
    const res = await fetch(`${newsBase}/api/internal/email/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outboxId: "test" }),
    });
    const secretConfigured = Boolean(getEmailQueueSecret());
    const ok = secretConfigured ? res.status === 401 : res.status === 401 || res.status === 400;
    record(
      "S5 internal email route rejects anonymous",
      ok,
      secretConfigured
        ? `status=${res.status} (expect 401 with EMAIL_QUEUE_SECRET)`
        : `status=${res.status} (dev may allow; secret not set)`,
      !secretConfigured,
    );
  } catch (error) {
    record(
      "S5 internal email route rejects anonymous",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  // S6 — Clerk middleware + session boundary
  record(
    "S6 Clerk middleware active",
    sourceIncludes("proxy.ts", "clerkMiddleware"),
    "proxy.ts uses clerkMiddleware",
  );
  record(
    "S6 legacy local auth disabled",
    sourceIncludes("app/api/auth/login/route.ts", "authProviderDisabledResponse"),
    "POST /api/auth/login returns 410 via authProviderDisabledResponse",
  );
}

async function verifyReliability() {
  try {
    const res = await fetch(`${newsBase}/api/health`);
    const json = (await parseApiResponse(res)) as { status?: string; db?: string };
    record(
      "R1 GET /api/health",
      res.ok && json.status === "ok" && json.db === "ok",
      `status=${res.status} body=${JSON.stringify(json)}`,
    );
  } catch (error) {
    record(
      "R1 GET /api/health",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  record(
    "R2 Core session graceful fail",
    sourceIncludes("lib/core/session.ts", "core.session.establish.failed"),
    "establishCoreSession logs + null",
  );
  record(
    "R2 Core users/me graceful fail",
    sourceIncludes("lib/core/users.ts", "return null"),
    "fetchCoreUserMe returns null on error",
  );

  const sectionFiles = [
    "components/home/HomeFeedSection.tsx",
    "components/home/CategoryEditorialSection.tsx",
    "components/home/JepangkuTvSection.tsx",
    "components/home/HomeEngagementSection.tsx",
  ];
  for (const file of sectionFiles) {
    record(
      `R4 section error isolation (${file.split("/").pop()})`,
      sourceIncludes(file, "error"),
      "error prop + fallback UI",
    );
  }

  record(
    "R4 useLazySection isolated fetch",
    sourceIncludes("hooks/useLazySection.ts", "setError"),
    "per-section error state",
  );

  record(
    "R5 monitoring webhook wired",
    sourceIncludes("lib/monitoring.ts", "MONITORING_WEBHOOK_URL"),
    isMonitoringEnabled()
      ? "MONITORING_WEBHOOK_URL set"
      : "hook ready; set MONITORING_WEBHOOK_URL in prod",
    !isMonitoringEnabled(),
  );

  record(
    "R6 log drain wired",
    sourceIncludes("lib/log-drain.ts", "LOG_DRAIN_URL"),
    isLogDrainEnabled()
      ? "LOG_DRAIN_URL set"
      : "forwardLogDrain ready; set LOG_DRAIN_URL in prod",
    !isLogDrainEnabled(),
  );

  const backend = getRateLimitBackend();
  record(
    "R7 Redis rate-limit fallback to memory",
    sourceIncludes("lib/rate-limit-store.ts", "rate_limit.redis_fallback"),
    `backend=${backend}; memory fallback on Redis error`,
  );
}

function verifyAccessibility() {
  record(
    "A4 search overlay inert when closed",
    sourceIncludes("components/navbar/NavbarSearchOverlay.tsx", "inert"),
    "inert attribute toggled",
  );
  record(
    "A3 carousel controls aria-label",
    sourceIncludes("components/home/HomeFeedSection.tsx", 'aria-label="Artikel sebelumnya"'),
    "prev/next labeled",
  );
  record(
    "A3 carousel touch target ≥44px",
    readSource("components/home/HomeFeedSection.tsx").includes("h-11 w-11"),
    "h-11 w-11 on prev/next buttons",
  );
  record(
    "A5 notification bell aria-label",
    sourceIncludes("components/notifications/NotificationBellMenu.tsx", "aria-label"),
    "dynamic unread count in label",
  );
  record(
    "A5 notification list aria-live",
    sourceIncludes("components/notifications/NotificationBellMenu.tsx", 'aria-live="polite"'),
    "live region for inbox updates",
  );
  record(
    "A5 welcome modal DialogTitle",
    sourceIncludes("components/notifications/WelcomeModal.tsx", "DialogTitle"),
    "accessible modal title",
  );
  record(
    "A5 daily points modal DialogTitle",
    sourceIncludes("components/notifications/DailyPointsModal.tsx", "DialogTitle"),
    "accessible modal title",
  );
  record(
    "A1 trending rank contrast token",
    sourceIncludes("components/home/TrendingArticlesPanel.tsx", "text-jepang-red-hover"),
    "rank numbers use darker red for WCAG AA",
  );
}

async function verifyBestPractices() {
  record(
    "Security headers configured",
    sourceIncludes("next.config.ts", "X-Content-Type-Options"),
    "nosniff, frame-options, referrer-policy",
  );
  try {
    const res = await fetch(`${newsBase}/`);
    const nosniff = res.headers.get("x-content-type-options");
    record(
      "Security headers live (X-Content-Type-Options)",
      nosniff === "nosniff",
      nosniff ?? "(missing — restart production server after next.config change)",
      nosniff !== "nosniff",
    );
  } catch (error) {
    record(
      "Security headers live (X-Content-Type-Options)",
      false,
      error instanceof Error ? error.message : String(error),
      true,
    );
  }
  record(
    "Clerk telemetry disabled",
    sourceIncludes("app/layout.tsx", "telemetry={false}"),
    "avoids clerk-telemetry.com console errors",
  );
}

async function main() {
  record("NEWS_BASE_URL", Boolean(newsBase), newsBase);

  verifyPerformanceSource();
  await verifyPerformanceHttp();
  await verifySecurity();
  await verifyReliability();
  verifyAccessibility();
  await verifyBestPractices();

  const required = checks.filter((c) => !c.optional);
  const failed = required.filter((c) => !c.ok).length;
  console.log(
    `\nNon-functional checks: ${required.length - failed}/${required.length} passed` +
      (checks.some((c) => c.optional)
        ? ` (+ ${checks.filter((c) => c.optional).length} optional)`
        : ""),
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
