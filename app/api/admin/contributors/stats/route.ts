import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getContributorsStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getContributorsStats);
