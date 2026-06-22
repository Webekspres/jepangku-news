import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getAdsStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getAdsStats);
