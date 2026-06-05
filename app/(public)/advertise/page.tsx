import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: AdvertisePage } = createInfoPage('advertise');

export { generateMetadata };
export default AdvertisePage;
