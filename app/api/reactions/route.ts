import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring';
import {
  auditReactionToggle,
} from '@/lib/audit-routes';
import {
  isReactionAllowed,
  isValidReactionTargetType,
  reactionTargetExists,
  summarizeReactions,
} from '@/lib/reactions';

// GET /api/reactions?targetType=ARTICLE&targetId=<id>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!isValidReactionTargetType(targetType) || !targetId) {
    return apiError('Parameter target tidak valid' , { status: 400 });
  }

  const user = await getCurrentUser(request).catch(() => null);
  const summary = await summarizeReactions(targetType, targetId, user?.id ?? null);

  return apiSuccess(summary);
}

// POST /api/reactions  { targetType, targetId, type }
// Toggle/switch: tipe sama -> batal; tipe beda -> ganti; belum ada -> buat.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Tidak terautentikasi' , { status: 401 });
  }

  if (user.status === 'banned') {
    return apiError('Akun Anda tidak dapat memberi reaksi' , { status: 403 });
  }

  const limited = await enforceRateLimit(request, 'reaction-toggle', {
    max: 30,
    windowMs: 60_000,
    identifier: user.id,
    message: 'Terlalu banyak reaksi. Coba lagi sebentar.',
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const { targetType, targetId, type } = body ?? {};

    if (!isValidReactionTargetType(targetType) || typeof targetId !== 'string' || !targetId) {
      return apiError('Parameter target tidak valid' , { status: 400 });
    }

    if (!isReactionAllowed(targetType, type)) {
      return apiError('Tipe reaksi tidak valid' , { status: 400 });
    }

    const exists = await reactionTargetExists(targetType, targetId);
    if (!exists) {
      return apiError('Konten yang direaksi tidak ditemukan' , { status: 404 });
    }

    const existing = await db.reaction.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId: user.id } },
    });

    let action: 'created' | 'switched' | 'removed';
    if (!existing) {
      await db.reaction.create({
        data: { targetType, targetId, userId: user.id, type },
      });
      action = 'created';
    } else if (existing.type === type) {
      await db.reaction.delete({ where: { id: existing.id } });
      action = 'removed';
    } else {
      await db.reaction.update({ where: { id: existing.id }, data: { type } });
      action = 'switched';
    }

    const summary = await summarizeReactions(targetType, targetId, user.id);

    logger.info('reaction.toggled', { userId: user.id, targetType, targetId, type, action });

    auditReactionToggle(user, targetType, targetId, type, action);

    return apiSuccess(summary);
  } catch (e) {
    await captureException(e, { route: 'reactions-post' });
    return apiError('Gagal menyimpan reaksi' , { status: 500 });
  }
}
