import { createInfoPage } from '@/lib/create-info-page';

export const dynamic = 'force-dynamic';

const { generateMetadata, default: ContactPage } = createInfoPage('contact');

export { generateMetadata };
export default ContactPage;
