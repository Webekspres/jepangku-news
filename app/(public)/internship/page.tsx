import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: InternshipPage } = createInfoPage('internship');

export { generateMetadata };
export default InternshipPage;
