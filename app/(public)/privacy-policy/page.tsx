import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: PrivacyPolicyPage } = createInfoPage('privacy-policy');

export { generateMetadata };
export default PrivacyPolicyPage;
