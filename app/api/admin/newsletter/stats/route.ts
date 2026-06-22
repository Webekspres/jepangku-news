import { createAdminStatsRoute } from '@/lib/admin-stats-route';
import { getNewsletterStats } from '@/lib/admin-page-stats';

export const GET = createAdminStatsRoute(getNewsletterStats);
