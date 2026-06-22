import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getSocialLinksStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getSocialLinksStats);
