import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
