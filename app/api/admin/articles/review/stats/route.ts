import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getReviewStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getReviewStats);
