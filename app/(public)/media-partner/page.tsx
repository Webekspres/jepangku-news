import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: MediaPartnerPage } = createInfoPage('media-partner');

export { generateMetadata };
export default MediaPartnerPage;
