import { createInfoPage } from '@/lib/create-info-page';

const { generateMetadata, default: ContactPage } = createInfoPage('contact');

export { generateMetadata };
export default ContactPage;
