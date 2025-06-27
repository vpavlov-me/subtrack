import * as Sentry from '@sentry/react';

// Initialize Sentry only in production
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Environment
    environment: import.meta.env.MODE,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Debug mode
    debug: import.meta.env.DEV,
  });
}

// Export Sentry for manual error tracking
export { Sentry };

// Helper function to capture user context
export const setUserContext = (user: {
  id: string;
  email: string;
  plan?: string;
  teamId?: string;
}) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      plan: user.plan,
      teamId: user.teamId,
    });
  }
};

// Helper function to capture subscription events
export const captureSubscriptionEvent = (
  event: 'created' | 'updated' | 'deleted',
  subscription: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    category?: string;
  }
) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(`Subscription ${event}`, {
      level: 'info',
      tags: {
        event_type: 'subscription',
        action: event,
      },
      extra: {
        subscription,
      },
    });
  }
};

// Helper function to capture CSV import events
export const captureCSVImportEvent = (
  success: boolean,
  details: {
    totalRows: number;
    importedRows: number;
    errors: string[];
  }
) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage('CSV Import completed', {
      level: success ? 'info' : 'warning',
      tags: {
        event_type: 'csv_import',
        success: success.toString(),
      },
      extra: {
        details,
      },
    });
  }
};

// Helper function to capture team events
export const captureTeamEvent = (
  event: 'member_invited' | 'member_removed' | 'seat_limit_reached',
  details: {
    teamId: string;
    memberEmail?: string;
    currentSeats?: number;
    maxSeats?: number;
  }
) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(`Team ${event}`, {
      level: 'info',
      tags: {
        event_type: 'team',
        action: event,
      },
      extra: {
        details,
      },
    });
  }
}; 