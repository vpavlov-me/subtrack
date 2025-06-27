import posthog from 'posthog-js';

// Initialize PostHog only if key is provided
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: false,
    enable_recording_console_log: false,
    // Privacy settings
    mask_all_text: false,
    // Performance
    loaded: (posthogInstance: typeof posthog) => {
      if (import.meta.env.DEV) {
        console.log('PostHog loaded:', posthogInstance);
      }
    },
  });
}

// Export PostHog for manual tracking
export { posthog };

// Helper function to identify user
export const identifyUser = (user: {
  id: string;
  email: string;
  plan?: string;
  teamSize?: number;
  createdAt?: string;
}) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.identify(user.id, {
      email: user.email,
      plan: user.plan,
      team_size: user.teamSize,
      created_at: user.createdAt,
    });
  }
};

// Helper function to track subscription events
export const trackSubscriptionEvent = (
  event: 'created' | 'updated' | 'deleted' | 'viewed',
  subscription: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    category?: string;
    billingCycle?: string;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(`subscription_${event}`, {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      amount: subscription.amount,
      currency: subscription.currency,
      category: subscription.category,
      billing_cycle: subscription.billingCycle,
    });
  }
};

// Helper function to track CSV import events
export const trackCSVImportEvent = (
  success: boolean,
  details: {
    totalRows: number;
    importedRows: number;
    errorCount: number;
    fileSize: number;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture('csv_import_completed', {
      success,
      total_rows: details.totalRows,
      imported_rows: details.importedRows,
      error_count: details.errorCount,
      file_size: details.fileSize,
    });
  }
};

// Helper function to track team events
export const trackTeamEvent = (
  event:
    | 'member_invited'
    | 'member_removed'
    | 'seat_limit_reached'
    | 'upgrade_prompted',
  details: {
    teamId: string;
    memberEmail?: string;
    currentSeats?: number;
    maxSeats?: number;
    plan?: string;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(`team_${event}`, {
      team_id: details.teamId,
      member_email: details.memberEmail,
      current_seats: details.currentSeats,
      max_seats: details.maxSeats,
      plan: details.plan,
    });
  }
};

// Helper function to track onboarding events
export const trackOnboardingEvent = (
  step:
    | 'started'
    | 'csv_imported'
    | 'reminder_set'
    | 'invite_sent'
    | 'completed',
  details?: {
    stepNumber?: number;
    totalSteps?: number;
    timeSpent?: number;
    skipped?: boolean;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(`onboarding_${step}`, {
      step_number: details?.stepNumber,
      total_steps: details?.totalSteps,
      time_spent: details?.timeSpent,
      skipped: details?.skipped,
    });
  }
};

// Helper function to track billing events
export const trackBillingEvent = (
  event:
    | 'upgrade_clicked'
    | 'downgrade_clicked'
    | 'payment_successful'
    | 'payment_failed',
  details: {
    plan?: string;
    amount?: number;
    currency?: string;
    reason?: string;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(`billing_${event}`, {
      plan: details.plan,
      amount: details.amount,
      currency: details.currency,
      reason: details.reason,
    });
  }
};

// Helper function to track feature usage
export const trackFeatureUsage = (
  feature:
    | 'dashboard'
    | 'subscriptions'
    | 'analytics'
    | 'team_settings'
    | 'billing',
  action: 'viewed' | 'created' | 'updated' | 'deleted'
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(`feature_${feature}_${action}`, {
      feature,
      action,
    });
  }
};

// Helper function to track error events
export const trackError = (
  error: Error,
  context: {
    component?: string;
    action?: string;
    userId?: string;
  }
) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      component: context.component,
      action: context.action,
      user_id: context.userId,
    });
  }
};
