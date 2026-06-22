import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getVideosStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getVideosStats);
