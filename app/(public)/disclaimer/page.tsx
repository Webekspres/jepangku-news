import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: DisclaimerPage } = createInfoPage('disclaimer');

export { generateMetadata };
export default DisclaimerPage;
