import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getQuizzesStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getQuizzesStats);
