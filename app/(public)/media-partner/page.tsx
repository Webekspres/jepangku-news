import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: MediaPartnerPage } = createInfoPage('media-partner');

export { generateMetadata };
export default MediaPartnerPage;
