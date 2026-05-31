// Conteneur global des notifications (toasts) stylise aux couleurs LoL.
// A monter une seule fois dans App.tsx. Les composants emettent des toasts via
// le helper `notify` (cf. src/lib/notify.ts).

import { Toaster } from 'react-hot-toast';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-charcoal)',
          color: 'var(--color-cream)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-sm)',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-teal)',
            secondary: 'var(--color-charcoal)',
          },
          style: {
            borderLeft: '3px solid var(--color-teal)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-danger)',
            secondary: 'var(--color-charcoal)',
          },
          style: {
            borderLeft: '3px solid var(--color-danger)',
          },
        },
        loading: {
          iconTheme: {
            primary: 'var(--color-gold)',
            secondary: 'var(--color-charcoal)',
          },
        },
      }}
    />
  );
}