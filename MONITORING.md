# Monitoring & Observability Guide

This document outlines the monitoring and observability setup for SubTrack, ensuring production reliability and user experience insights.

## 📊 Monitoring Stack

### Error Tracking & Performance
- **Sentry**: Real-time error monitoring with source maps
- **Vercel Analytics**: Core Web Vitals and performance metrics

### User Analytics
- **PostHog**: Event tracking, funnels, feature flags
- **Vercel Analytics**: Page views and user behavior

### Infrastructure
- **Supabase**: Database monitoring, function logs
- **Vercel**: Build analytics, function performance

## 🔧 Setup Instructions

### 1. Sentry Configuration

#### Environment Variables
```env
VITE_SENTRY_DSN=https://your-sentry-dsn@your-project.ingest.sentry.io/your-project-id
```

#### Implementation
Sentry is configured in `src/lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### Features
- **Error Tracking**: Automatic capture of JavaScript errors
- **Performance Monitoring**: Transaction tracing and spans
- **Session Replay**: User session recordings for debugging
- **Source Maps**: Uploaded during build for accurate stack traces

#### Source Maps Upload
Add to your build process:
```bash
# Install Sentry CLI
npm install --save-dev @sentry/cli

# Upload source maps
sentry-cli releases files VERSION upload-sourcemaps ./dist --url-prefix '~/'
```

### 2. PostHog Configuration

#### Environment Variables
```env
VITE_POSTHOG_KEY=phc_your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### Implementation
PostHog is configured in `src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});
```

#### Key Events Tracked
- **User Registration**: `user_registered`
- **Subscription Created**: `subscription_created`
- **CSV Import**: `csv_imported`
- **Payment Reminder**: `payment_reminder_sent`
- **Team Invitation**: `team_member_invited`

#### Custom Properties
```typescript
// Track user properties
posthog.identify(userId, {
  email: user.email,
  plan: user.plan,
  team_size: user.teamSize,
});

// Track subscription events
posthog.capture('subscription_created', {
  category: subscription.category,
  amount: subscription.amount,
  currency: subscription.currency,
});
```

### 3. Vercel Analytics

#### Configuration
Vercel Analytics is automatically enabled when deployed on Vercel. No additional configuration required.

#### Metrics Available
- **Core Web Vitals**: LCP, FID, CLS
- **Page Views**: Automatic tracking
- **Performance**: Load times, bundle sizes
- **Geographic Data**: User locations

## 📈 Dashboard Setup

### Sentry Dashboard
1. **Error Rate**: Monitor error frequency over time
2. **Performance**: Track transaction durations
3. **User Impact**: See affected users per error
4. **Release Tracking**: Monitor errors by version

### PostHog Dashboard
1. **User Funnel**: Registration → Onboarding → First Subscription
2. **Feature Usage**: Track feature adoption rates
3. **Retention**: User retention by cohort
4. **A/B Testing**: Feature flag performance

### Supabase Dashboard
1. **Database Performance**: Query execution times
2. **Function Logs**: Edge function monitoring
3. **Storage Usage**: File upload metrics
4. **Auth Events**: Login/registration patterns

## 🚨 Alerting

### Sentry Alerts
- **Error Rate Spike**: >5% error rate increase
- **Performance Degradation**: >2s average response time
- **Critical Errors**: 5xx errors in production

### PostHog Alerts
- **User Drop-off**: >20% decrease in daily active users
- **Feature Usage**: Significant drop in key features
- **Conversion Rate**: <10% registration to first subscription

### Supabase Alerts
- **Database Load**: >80% CPU usage
- **Function Errors**: Edge function failures
- **Storage Quota**: >90% storage usage

## 🔍 Debugging Workflow

### 1. Error Investigation
```bash
# Check Sentry for error details
1. Navigate to Sentry dashboard
2. Find error in Issues
3. Review stack trace and context
4. Check affected users and frequency
5. Create fix and test locally
6. Deploy and monitor resolution
```

### 2. Performance Investigation
```bash
# Analyze performance issues
1. Check Vercel Analytics for Core Web Vitals
2. Review Sentry Performance tab
3. Analyze database query performance
4. Check bundle size and loading times
5. Optimize identified bottlenecks
```

### 3. User Behavior Analysis
```bash
# Understand user behavior
1. Review PostHog funnels and events
2. Analyze user session recordings
3. Check feature adoption rates
4. Identify drop-off points
5. Implement improvements
```

## 📊 Key Metrics

### Business Metrics
- **Monthly Active Users (MAU)**
- **Subscription Creation Rate**
- **User Retention (7d, 30d)**
- **Revenue per User (ARPU)**

### Technical Metrics
- **Error Rate**: <1% target
- **Page Load Time**: <2s target
- **API Response Time**: <500ms target
- **Uptime**: >99.9% target

### User Experience Metrics
- **Core Web Vitals**: All green
- **Time to Interactive**: <3s
- **First Contentful Paint**: <1.5s
- **Cumulative Layout Shift**: <0.1

## 🛠 Maintenance

### Weekly Tasks
- [ ] Review error rates and trends
- [ ] Check performance metrics
- [ ] Analyze user behavior patterns
- [ ] Update alert thresholds if needed

### Monthly Tasks
- [ ] Review and optimize queries
- [ ] Update monitoring dashboards
- [ ] Analyze feature usage trends
- [ ] Plan performance improvements

### Quarterly Tasks
- [ ] Review monitoring stack effectiveness
- [ ] Update alerting rules
- [ ] Optimize data retention policies
- [ ] Plan new monitoring features

## 🔐 Security Considerations

### Data Privacy
- **PII Handling**: No sensitive data in error reports
- **GDPR Compliance**: User consent for analytics
- **Data Retention**: Configure appropriate retention periods
- **Access Control**: Limit dashboard access to authorized users

### Monitoring Security
- **API Keys**: Rotate keys regularly
- **Access Logs**: Monitor dashboard access
- **Alert Channels**: Secure notification delivery
- **Data Encryption**: Ensure data in transit and at rest

## 📚 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [PostHog Documentation](https://posthog.com/docs)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Supabase Monitoring](https://supabase.com/docs/guides/monitoring)

---

For questions or issues with monitoring setup, contact the development team or create an issue in the repository. 