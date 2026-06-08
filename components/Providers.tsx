'use client';

import { ClerkAuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkAuthProvider>
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
    </ClerkAuthProvider>
  );
}
