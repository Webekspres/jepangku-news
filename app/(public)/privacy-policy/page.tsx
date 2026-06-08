import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: PrivacyPolicyPage } = createInfoPage('privacy-policy');

export { generateMetadata };
export default PrivacyPolicyPage;
