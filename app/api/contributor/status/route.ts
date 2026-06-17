import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getLatestContributorApplication } from '@/lib/contributor-applications';
import { canCreateArticles } from '@/lib/contributor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (canCreateArticles(user)) {
    return NextResponse.json({
      isContributor: true,
      application: null,
    });
  }

  const application = await getLatestContributorApplication(user.id);

  return NextResponse.json({
    isContributor: false,
    application,
    contributorApplicationStatus: user.contributorApplicationStatus ?? application?.status ?? null,
  });
}
