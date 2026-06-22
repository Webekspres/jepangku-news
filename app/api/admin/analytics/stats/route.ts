import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getAnalyticsOverviewStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getAnalyticsOverviewStats);
