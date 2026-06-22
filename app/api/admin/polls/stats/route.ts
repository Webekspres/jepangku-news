import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getPollsStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getPollsStats);
