import Footer from "@/components/Footer";
import NavbarShell from "@/components/NavbarShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <NavbarShell />
      {children}
      <Footer />
    </main>
  );
}
