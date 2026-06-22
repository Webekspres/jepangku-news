import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getInfoPagesStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getInfoPagesStats);
