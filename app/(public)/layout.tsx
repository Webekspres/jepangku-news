import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarShell />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
