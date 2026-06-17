'use client';

import { ClerkAuthProvider } from '@/contexts/AuthContext';
import NotificationSessionModals from '@/components/notifications/NotificationSessionModals';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkAuthProvider>
      {children}
      <NotificationSessionModals />
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
