import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: CareerPage } = createInfoPage('career');

export { generateMetadata };
export default CareerPage;
