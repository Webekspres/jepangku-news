import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: AboutPage } = createInfoPage('about');

export { generateMetadata };
export default AboutPage;
