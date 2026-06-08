import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: CareerPage } = createInfoPage('career');

export { generateMetadata };
export default CareerPage;
