import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jepangku News — Portal Berita Jepang',
  description: 'Portal media interaktif bertema Jepang untuk pembaca Indonesia. Baca artikel, ikuti quiz, vote, dan raih poin!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0A0A0A',
                color: '#fff',
                borderRadius: 0,
                border: '1px solid #D90429',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
