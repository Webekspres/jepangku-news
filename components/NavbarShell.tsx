import { getPublicSocialLinks } from "@/lib/social-links";
import Navbar from "@/components/Navbar";

export default async function NavbarShell() {
  const socialLinks = await getPublicSocialLinks();
  return <Navbar socialLinks={socialLinks} />;
}
