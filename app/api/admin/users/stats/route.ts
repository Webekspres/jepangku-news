import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getUsersStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getUsersStats);
