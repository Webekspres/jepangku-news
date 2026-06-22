import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getHomepageStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getHomepageStats);
