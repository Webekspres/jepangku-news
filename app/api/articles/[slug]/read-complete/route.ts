import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { gamificationFieldsFromAward } from '@/lib/gamification-response';
import { awardPoints } from '@/lib/points';
import { enforceRateLimit } from '@/lib/rate-limit';
import { captureException } from '@/lib/monitoring';
import { auditArticleReadComplete } from '@/lib/audit-routes';

const READ_POINTS = 2;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
  const user = await getCurrentUser(request);
  if (!user) {
    // Guest — acknowledge silently, no points
    return apiSuccess({ awarded: false, points: 0, reason: 'not_authenticated' });
  }

  const blocked = await enforceRateLimit(request, 'read-complete', {
    max: 30,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak permintaan. Coba lagi sebentar.',
  });
  if (blocked) return blocked;

  const { slug } = await params;

  const article = await db.article.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true },
  });

  if (!article) {
    return apiError('Article not found' , { status: 404 });
  }

  // Award points — awardPoints handles anti-duplicate internally
  const award = await awardPoints(
    user.id,
    'article_read',
    'article',
    article.id,
    READ_POINTS,
    `Read article: ${article.title}`,
  );

  if (award.awarded) {
    auditArticleReadComplete(user, article);
  }

  return apiSuccess({
    awarded: award.awarded,
    points: award.awarded ? READ_POINTS : 0,
    reason: award.awarded ? 'points_awarded' : 'already_awarded',
    ...gamificationFieldsFromAward(award),
  });
  } catch (e) {
    await captureException(e, { route: 'read-complete' });
    return apiError('Failed to record read' , { status: 500 });
  }
}
