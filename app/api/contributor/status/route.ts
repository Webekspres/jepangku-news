import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getLatestContributorApplication } from '@/lib/contributor-applications';
import { canCreateArticles } from '@/lib/contributor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated' , { status: 401 });
  }

  if (canCreateArticles(user)) {
    return apiSuccess({
      isContributor: true,
      application: null,
    });
  }

  const application = await getLatestContributorApplication(user.id);

  return apiSuccess({
    isContributor: false,
    application,
    contributorApplicationStatus: user.contributorApplicationStatus ?? application?.status ?? null,
  });
}
