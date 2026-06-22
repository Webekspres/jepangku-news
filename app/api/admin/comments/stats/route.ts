import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getCommentsStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getCommentsStats);
