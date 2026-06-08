import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: TermsOfServicePage } = createInfoPage('terms-of-service');

export { generateMetadata };
export default TermsOfServicePage;
