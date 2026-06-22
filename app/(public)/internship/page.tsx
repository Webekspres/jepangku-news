import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: InternshipPage } = createInfoPage('internship');

export { generateMetadata };
export default InternshipPage;
