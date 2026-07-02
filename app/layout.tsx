import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { idID } from '@clerk/localizations';
import ClientProviders from '@/components/ClientProviders';
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_TITLE_TEMPLATE,
} from '@/lib/site-config';
import { getSiteUrl } from '@/lib/site-url';
import { getCriticalLogoPaths } from '@/lib/logo-utils';
import './globals.css';

const SITE_OG_IMAGE_URL = new URL(
  '/assets/images/og-image/og-image.png',
  getSiteUrl(),
).toString();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    siteName: SITE_DEFAULT_TITLE,
    locale: 'id_ID',
    images: [SITE_OG_IMAGE_URL],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [SITE_OG_IMAGE_URL],
  },
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
  const criticalLogos = getCriticalLogoPaths();
  
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://img.clerk.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        {/* Preload critical logo assets */}
        {criticalLogos.map((logoPath) => (
          <link 
            key={logoPath} 
            rel="preload" 
            href={logoPath} 
            as="image" 
            type="image/svg+xml" 
          />
        ))}
      </head>
      <ClerkProvider telemetry={false} localization={idID}>
        <body className="thin-scrollbar min-h-full flex flex-col overflow-x-clip">
          <ClientProviders>{children}</ClientProviders>
        </body>
      </ClerkProvider>
    </html>
  );
}
