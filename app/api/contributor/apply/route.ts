import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createContributorApplication } from '@/lib/contributor-applications';
import { canCreateArticles } from '@/lib/contributor';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
  }
  if (canCreateArticles(user)) {
    logger.warn('contributor.apply.already_contributor', { userId: user.id });
    return apiError('Anda sudah menjadi kontributor' , { status: 400 });
  }

  try {
    const body = await request.json();
    const application = await createContributorApplication(user.id, {
      motivation: String(body.motivation ?? ''),
      portfolioUrl: body.portfolioUrl ? String(body.portfolioUrl) : null,
    });

    logger.info('contributor.apply.submitted', {
      userId: user.id,
      applicationId: application.id,
      hasPortfolio: Boolean(body.portfolioUrl),
      motivationLength: String(body.motivation ?? '').length,
    });

    return apiSuccess({ application }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN';
    const messages: Record<string, { status: number; error: string }> = {
      PENDING_EXISTS: { status: 409, error: 'Permohonan Anda masih dalam antrian review' },
      MOTIVATION_TOO_SHORT: {
        status: 400,
        error: 'Motivasi minimal 20 karakter',
      },
      MOTIVATION_TOO_LONG: {
        status: 400,
        error: 'Motivasi maksimal 2000 karakter',
      },
      INVALID_PORTFOLIO_URL: {
        status: 400,
        error: 'URL portofolio tidak valid (gunakan http atau https)',
      },
    };
    const mapped = messages[code];
    if (mapped) {
      logger.warn('contributor.apply.validation_failed', { userId: user.id, code });
      return apiSuccess({ error: mapped.error, code }, { status: mapped.status });
    }
    logger.error('contributor.apply.failed', { userId: user.id, errorMessage: error instanceof Error ? error.message : String(error) });
    return apiError('Gagal mengirim permohonan' , { status: 500 });
  }
}
