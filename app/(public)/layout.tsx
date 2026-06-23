import NavbarShell from '@/components/NavbarShell';
import FooterShell from '@/components/FooterShell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarShell />
      <main className="flex-1">{children}</main>
      <FooterShell />
    </>
  );
}
