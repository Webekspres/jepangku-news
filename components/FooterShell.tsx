import { getPublicSocialLinks } from "@/lib/social-links";
import Footer from "@/components/Footer";

export default async function FooterShell() {
  const socialLinks = await getPublicSocialLinks();
  return <Footer socialLinks={socialLinks} />;
}
