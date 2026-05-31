import type { Metadata } from 'next';
import ClientProviders from '@/components/ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jepangku News — Portal Berita Jepang',
  description: 'Portal media interaktif bertema Jepang untuk pembaca Indonesia. Baca artikel, ikuti quiz, vote, dan raih poin!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
