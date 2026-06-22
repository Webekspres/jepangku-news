/**
 * Phase E2 verification — notifications, email outbox, Jakarta session rules.
 * Run: bun run verify:notifications
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getJakartaDateKey, isWithinJakartaDay } from '../lib/jakarta-calendar';
import { COMMENT_GROUP_MAX_COUNT } from '../lib/notifications/types';

const newsBase = process.env.NEWS_BASE_URL ?? 'http://localhost:3000';

type Check = { name: string; ok: boolean; detail: string; optional?: boolean };
const checks: Check[] = [];

function record(name: string, ok: boolean, detail: string, optional = false) {
  checks.push({ name, ok, detail, optional });
  console.log(`[${ok ? 'OK' : optional ? 'WARN' : 'FAIL'}] ${name}: ${detail}`);
}

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

async function main() {
  // Jakarta calendar
  const utcEvening = new Date('2026-06-17T16:30:00.000Z');
  record(
    'Jakarta date key (same calendar day)',
    getJakartaDateKey(utcEvening) === '2026-06-17',
    `got ${getJakartaDateKey(utcEvening)}`,
  );

  const utcMidnightJakarta = new Date('2026-06-17T17:00:00.000Z');
  record(
    'Jakarta date key (rolls to next day)',
    getJakartaDateKey(utcMidnightJakarta) === '2026-06-18',
    `got ${getJakartaDateKey(utcMidnightJakarta)}`,
  );

  const noonJakarta = new Date('2026-06-17T05:00:00.000Z');
  record(
    'isWithinJakartaDay',
    isWithinJakartaDay(noonJakarta, utcEvening),
    'noon Jakarta within same Jakarta day as 23:30 Jakarta',
  );

  // Comment group cap
  record(
    'COMMENT_GROUP_MAX_COUNT',
    COMMENT_GROUP_MAX_COUNT >= 10,
    String(COMMENT_GROUP_MAX_COUNT),
  );

  const createSource = readSource('lib/notifications/create.ts');
  record(
    'Comment group cap wired',
    createSource.includes('COMMENT_GROUP_MAX_COUNT') &&
      createSource.includes('notification.group_capped'),
    'upsertGroupedNotification enforces max',
  );

  // Bulk approve dedupe
  const articleHandler = readSource('lib/notifications/handlers/article.ts');
  record(
    'Article approve dedupeKey',
    articleHandler.includes('dedupeKey: `article:${article.id}:published`'),
    'stable key per article',
  );
  record(
    'Article reject dedupeKey',
    articleHandler.includes('dedupeKey: `article:${article.id}:rejected`'),
    'stable key per article',
  );

  // Email async
  record(
    'Email outbox module',
    readSource('lib/email/queue.ts').includes('emailOutbox.create'),
    'queue + process',
  );
  record(
    'QStash client module',
    readSource('lib/email/qstash.ts').includes('@upstash/qstash'),
    'SDK publish + receiver verify',
  );
  record(
    'QStash URL from env',
    readSource('lib/email/config.ts').includes('QSTASH_URL'),
    'supports regional endpoint',
  );
  record(
    'QStash signing keys',
    readSource('lib/email/config.ts').includes('QSTASH_CURRENT_SIGNING_KEY'),
    'receiver verify wired',
  );
  record(
    'Email hooks — article rejected',
    readSource('lib/notifications/email-hooks.ts').includes('queueArticleRejectedEmail'),
    'handler present',
  );
  record(
    'Email hooks — article approved',
    readSource('lib/notifications/email-hooks.ts').includes('queueArticleApprovedEmail'),
    'handler present',
  );
  record(
    'Contributor apply notifies admins',
    readSource('lib/contributor-applications.ts').includes('contributor.application_submitted'),
    'dispatch on create',
  );
  record(
    'Newsletter new article broadcast',
    readSource('lib/newsletter/new-article-broadcast.ts').includes('newsletter_new_article'),
    'queue on first publish',
  );
  record(
    'Newsletter broadcast wired on publish',
    readSource('lib/notifications/handlers/article.ts').includes('queueNewsletterNewArticleBroadcastSafe'),
    'article handler',
  );
  record(
    'Admin article pending review handler',
    readSource('lib/notifications/handlers/admin.ts').includes('ARTICLE_PENDING_REVIEW'),
    'notify all active admins',
  );
  record(
    'Admin contributor application handler',
    readSource('lib/notifications/handlers/admin.ts').includes('CONTRIBUTOR_APPLICATION_PENDING'),
    'notify all active admins',
  );
  record(
    'Email hooks — contributor review',
    readSource('lib/notifications/email-hooks.ts').includes('queueContributorReviewEmail'),
    'handler present',
  );
  record(
    'Email hooks — welcome user',
    readSource('lib/notifications/email-hooks.ts').includes('queueWelcomeUserEmail'),
    'handler present',
  );
  record(
    'Welcome on register',
    readSource('lib/auth/clerk-user.ts').includes('queueWelcomeUserEmail'),
    'clerk-user wires welcome email',
  );

  const templates = readSource('lib/email/template-definitions.ts');
  for (const id of [
    'article_rejected',
    'article_approved',
    'contributor_approved',
    'contributor_rejected',
    'welcome_user',
    'newsletter_new_article',
  ]) {
    record(`Email template: ${id}`, templates.includes(`'${id}'`), 'definition + render');
  }
  record(
    'Email template config admin API',
    readSource('app/api/admin/email-templates/route.ts').includes('listEmailTemplateConfigs'),
    'CRUD + preview',
  );

  // Session modals (welcome only new users; daily once per Jakarta day)
  const sessionQueries = readSource('lib/notifications/queries.ts');
  record(
    'Welcome modal — welcomedAt gate',
    sessionQueries.includes('showWelcome: profile?.welcomedAt == null'),
    'only users without welcomedAt',
  );
  record(
    'Daily modal — Jakarta day gate',
    sessionQueries.includes('isWithinJakartaDay(profile.lastDailyPointsModalAt') &&
      sessionQueries.includes('getJakartaDateKey'),
    'lastDailyPointsModalAt scoped to Jakarta',
  );

  // HTTP checks (optional if server not running)
  try {
    const list = await fetch(`${newsBase}/api/notifications`);
    record('GET /api/notifications unauthenticated', list.status === 401, `status=${list.status}`);
  } catch (error) {
    record(
      'GET /api/notifications unauthenticated',
      false,
      error instanceof Error ? error.message : String(error),
      true,
    );
  }

  try {
    const unread = await fetch(`${newsBase}/api/notifications/unread-count`);
    record(
      'GET /api/notifications/unread-count unauthenticated',
      unread.status === 401,
      `status=${unread.status}`,
    );
  } catch (error) {
    record(
      'GET /api/notifications/unread-count unauthenticated',
      false,
      error instanceof Error ? error.message : String(error),
      true,
    );
  }

  try {
    const internal = await fetch(`${newsBase}/api/internal/email/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outboxId: 'test' }),
    });
    const hasQueueSecret = Boolean(process.env.EMAIL_QUEUE_SECRET?.trim());
    const hasQstashKeys = Boolean(
      process.env.QSTASH_CURRENT_SIGNING_KEY?.trim() &&
        process.env.QSTASH_NEXT_SIGNING_KEY?.trim(),
    );
    const expectUnauthorized =
      hasQueueSecret || hasQstashKeys || process.env.NODE_ENV !== 'development';
    record(
      'POST /api/internal/email/process unauthenticated',
      expectUnauthorized ? internal.status === 401 : internal.status !== 401,
      `status=${internal.status}`,
      !expectUnauthorized,
    );
  } catch (error) {
    record(
      'POST /api/internal/email/process unauthenticated',
      false,
      error instanceof Error ? error.message : String(error),
      true,
    );
  }

  const requiredFailed = checks.filter((c) => !c.ok && !c.optional);
  console.log('');
  if (requiredFailed.length === 0) {
    console.log('All required notification checks passed.');
    process.exit(0);
  }

  console.error(`${requiredFailed.length} required check(s) failed.`);
  process.exit(1);
}

void main();
