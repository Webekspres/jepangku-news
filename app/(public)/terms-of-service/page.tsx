import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: TermsOfServicePage } = createInfoPage('terms-of-service');

export { generateMetadata };
export default TermsOfServicePage;
