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
            background: '#1E1B57',
            color: '#fff',
            borderRadius: '0.5rem',
            border: '1px solid #FF4B2B',
          },
        }}
      />
    </ClerkAuthProvider>
  );
}
