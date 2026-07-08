import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { listContributorApplicationsForAdmin } from '@/lib/contributor-applications';
import type { ContributorApplicationStatus } from '@prisma/client';
import { withRequestLogging } from '@/lib/logging/request-logger';

const VALID_STATUSES = new Set<ContributorApplicationStatus>([
  'PENDING',
  'APPROVED',
  'REJECTED',
]);

const GET = withRequestLogging(async (request: NextRequest) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status')?.toUpperCase() ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const status =
    statusParam && VALID_STATUSES.has(statusParam as ContributorApplicationStatus)
      ? (statusParam as ContributorApplicationStatus)
      : '';

  const result = await listContributorApplicationsForAdmin({ status, page });
  return apiSuccess(result);
});

export { GET };
