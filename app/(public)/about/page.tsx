import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: AboutPage } = createInfoPage('about');

export { generateMetadata };
export default AboutPage;
