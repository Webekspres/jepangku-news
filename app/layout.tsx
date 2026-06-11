import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import ClientProviders from '@/components/ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jepangku News | Portal Berita Jepang',
  description: 'Portal media interaktif bertema Jepang untuk pembaca Indonesia. Baca artikel, ikuti quiz, vote, dan raih poin!',
  icons: {
    icon: [
      { url: '/assets/images/favicons/favicon.ico', sizes: 'any' },
      { url: '/assets/images/favicons/favicon.svg', type: 'image/svg+xml' },
      {
        url: '/assets/images/favicons/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
    apple: '/assets/images/favicons/apple-touch-icon.png',
    shortcut: '/assets/images/favicons/favicon.ico',
  },
  manifest: '/assets/images/favicons/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <ClerkProvider>
        <body className="thin-scrollbar min-h-full flex flex-col">
          <ClientProviders>{children}</ClientProviders>
        </body>
      </ClerkProvider>
    </html>
  );
}
