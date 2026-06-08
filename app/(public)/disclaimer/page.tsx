import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: DisclaimerPage } = createInfoPage('disclaimer');

export { generateMetadata };
export default DisclaimerPage;
