# Observability Setup Guide

This guide covers the complete observability setup for SubTrack on Vercel, including error tracking with Sentry and user analytics with PostHog.

## Overview

SubTrack uses a comprehensive observability stack to monitor application health, track user behavior, and ensure optimal performance:

- **Sentry**: Error tracking and performance monitoring
- **PostHog**: User analytics, feature flags, and product insights
- **Vercel Analytics**: Built-in performance metrics
- **Supabase**: Database monitoring and function logs

## Sentry Setup

### 1. Project Configuration

1. Create a new project in [Sentry](https://sentry.io)
2. Select **React** as the framework
3. Choose **Vercel** as the platform
4. Note your DSN (Data Source Name)

### 2. Environment Variables

Add to your Vercel environment variables:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@your-project.ingest.sentry.io/your-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=subtrack
SENTRY_AUTH_TOKEN=your-auth-token
VERCEL_GIT_COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA
VERCEL_GIT_COMMIT_REF=$VERCEL_GIT_COMMIT_REF
```

### 3. Source Maps Configuration

Create `vercel.json` with source maps configuration:

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "build": {
    "env": {
      "SENTRY_DSN": "@sentry-dsn",
      "SENTRY_ORG": "@sentry-org",
      "SENTRY_PROJECT": "@sentry-project",
      "SENTRY_AUTH_TOKEN": "@sentry-auth-token"
    }
  }
}
```

### 4. Build Configuration

Add to your build script in `package.json`:

```json
{
  "scripts": {
    "build": "sentry-cli releases new $VERCEL_GIT_COMMIT_SHA && tsc -b && vite build && sentry-cli releases set-commits $VERCEL_GIT_COMMIT_SHA --auto && sentry-cli releases finalize $VERCEL_GIT_COMMIT_SHA"
  }
}
```

### 5. Performance Monitoring

Configure performance monitoring in `src/lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VERCEL_ENV || 'development',
  release: import.meta.env.VERCEL_GIT_COMMIT_SHA,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'your-domain.vercel.app'],
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## PostHog Setup

### 1. Project Configuration

1. Create a new project in [PostHog](https://posthog.com)
2. Note your API key and host URL
3. Configure data retention and privacy settings

### 2. Environment Variables

Add to your Vercel environment variables:

```bash
# PostHog Configuration
VITE_POSTHOG_KEY=phc_your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=your-api-key
```

### 3. Analytics Configuration

Configure PostHog in `src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  disable_session_recording: false,
  enable_recording_console_log: true,
  enable_recording_network_payloads: true,
});
```

### 4. Event Tracking

Track key user events:

```typescript
// Subscription events
posthog.capture('subscription_created', {
  subscription_name: 'Netflix',
  price: 15.99,
  billing_cycle: 'monthly',
  category: 'Entertainment'
});

// Upgrade events
posthog.capture('upgrade_initiated', {
  from_plan: 'free',
  to_plan: 'pro',
  trigger: 'subscription_limit'
});

// Team events
posthog.capture('team_member_invited', {
  team_size: 3,
  plan: 'pro'
});
```

## Vercel Analytics

### 1. Automatic Setup

Vercel Analytics is automatically enabled for all deployments. No additional configuration required.

### 2. Custom Events

Track custom events with Vercel Analytics:

```typescript
import { track } from '@vercel/analytics';

track('subscription_added', {
  category: 'Entertainment',
  price: 15.99
});
```

## Supabase Monitoring

### 1. Database Monitoring

Monitor database performance in Supabase Dashboard:

- **Query Performance**: View slow queries and optimization opportunities
- **Connection Pool**: Monitor connection usage and limits
- **Storage**: Track database size and growth
- **Backups**: Monitor backup status and retention

### 2. Edge Function Logs

Monitor edge function execution:

```typescript
// In edge functions
console.log('Webhook processed', {
  event_type: event.type,
  user_id: userId,
  timestamp: new Date().toISOString()
});
```

### 3. RLS Policy Monitoring

Monitor Row Level Security policy effectiveness:

```sql
-- Check RLS policy usage
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Alerting Configuration

### 1. Sentry Alerts

Configure alerts in Sentry for:

- **Error Rate**: Alert when error rate exceeds 5%
- **Performance**: Alert when response time exceeds 2s
- **Release Health**: Alert on new releases with high error rates

### 2. PostHog Alerts

Set up alerts for:

- **User Drop-off**: Alert when conversion rates drop
- **Feature Usage**: Alert when key features aren't being used
- **Revenue Impact**: Alert when upgrade conversions drop

### 3. Vercel Alerts

Configure Vercel alerts for:

- **Build Failures**: Alert on failed deployments
- **Function Timeouts**: Alert when edge functions timeout
- **Bandwidth Usage**: Alert when approaching limits

## Dashboard Configuration

### 1. Sentry Dashboard

Create dashboards for:

- **Error Overview**: Top errors by frequency and impact
- **Performance**: Response times and throughput
- **Release Health**: Error rates by release
- **User Impact**: Most affected users and sessions

### 2. PostHog Dashboard

Configure dashboards for:

- **User Journey**: Funnel analysis from signup to upgrade
- **Feature Adoption**: Usage of key features over time
- **Revenue Metrics**: Upgrade conversions and revenue tracking
- **Cohort Analysis**: User retention and engagement

### 3. Custom Metrics

Track custom business metrics:

```typescript
// Track subscription metrics
posthog.capture('subscription_metrics', {
  total_subscriptions: subscriptions.length,
  monthly_spend: totalMonthlySpend,
  active_categories: uniqueCategories.length,
  days_since_last_add: daysSinceLastAdd
});
```

## Privacy and Compliance

### 1. GDPR Compliance

- **Data Retention**: Configure appropriate retention periods
- **User Consent**: Implement consent management
- **Data Export**: Enable user data export functionality
- **Right to Deletion**: Implement user deletion workflows

### 2. Data Anonymization

```typescript
// Anonymize sensitive data
posthog.capture('subscription_added', {
  category: 'Entertainment',
  price_range: price > 20 ? 'high' : 'low',
  // Don't capture actual subscription names or personal data
});
```

### 3. PII Protection

- **Email Addresses**: Never log or track full email addresses
- **Payment Data**: Never capture payment information
- **Personal Names**: Anonymize or exclude from tracking

## Troubleshooting

### Common Issues

1. **Source Maps Not Working**
   - Verify SENTRY_AUTH_TOKEN is set correctly
   - Check build script includes source map upload
   - Ensure Vercel environment variables are configured

2. **PostHog Events Not Appearing**
   - Verify API key and host URL
   - Check network requests in browser dev tools
   - Ensure no ad blockers are interfering

3. **Performance Issues**
   - Monitor bundle size and loading times
   - Check for memory leaks in React components
   - Optimize database queries and RLS policies

### Debug Mode

Enable debug mode for troubleshooting:

```typescript
// Sentry debug
Sentry.init({
  debug: import.meta.env.DEV,
  // ... other config
});

// PostHog debug
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  debug: import.meta.env.DEV,
  // ... other config
});
```

## Best Practices

### 1. Error Tracking

- **Context**: Always include relevant context with errors
- **Grouping**: Use consistent error messages for proper grouping
- **Severity**: Set appropriate error severity levels
- **Sampling**: Use sampling for high-volume events

### 2. Performance Monitoring

- **Key Metrics**: Track Core Web Vitals and business metrics
- **Baselines**: Establish performance baselines
- **Trends**: Monitor performance trends over time
- **Alerts**: Set up alerts for performance regressions

### 3. User Analytics

- **Events**: Track meaningful user actions
- **Properties**: Include relevant event properties
- **Consistency**: Use consistent event naming
- **Privacy**: Respect user privacy preferences

## Maintenance

### 1. Regular Reviews

- **Weekly**: Review error rates and performance metrics
- **Monthly**: Analyze user behavior and feature adoption
- **Quarterly**: Review and update alerting thresholds

### 2. Cleanup

- **Old Releases**: Archive old Sentry releases
- **Unused Events**: Remove unused PostHog events
- **Log Rotation**: Configure appropriate log retention

### 3. Updates

- **Dependencies**: Keep observability libraries updated
- **Configurations**: Review and update configurations
- **Documentation**: Keep this guide updated

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [PostHog Documentation](https://posthog.com/docs)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Supabase Monitoring](https://supabase.com/docs/guides/monitoring) 