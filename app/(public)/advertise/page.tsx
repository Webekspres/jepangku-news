import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: AdvertisePage } = createInfoPage('advertise');

export { generateMetadata };
export default AdvertisePage;
