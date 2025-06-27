# 🚀 Deploy SubTrack on Vercel

This guide covers deploying SubTrack to Vercel with zero-downtime static deployment, security headers, and production-ready configuration.

## 📋 Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed globally
- GitHub repository connected to Vercel
- Supabase project configured
- Stripe account (for billing features)

## 🔧 Step-by-Step Deployment

### 1. Local Build Verification

First, ensure your application builds successfully locally:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test
pnpm run e2e

# Build application
pnpm build

# Verify build output
ls -la dist/
```

**✅ Success Criteria**: Build completes without errors, `dist/` contains static files.

### 2. Vercel Project Setup

#### Option A: Using Vercel CLI (Recommended)

```bash
# Login to Vercel
vercel login

# Link to existing project (if already created on Vercel)
vercel link

# Or create new project
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `subtrack` repository

### 3. Environment Variables Configuration

In Vercel Dashboard → Settings → Environment Variables:

#### Production Environment

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### Preview Environment (for PRs)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

**⚠️ Important**:

- Variables with `VITE_` prefix are exposed to the client
- Sensitive data (webhook secrets) should use edge function proxy
- Set variables for both Production and Preview environments

### 4. Production Deployment

#### Option A: CLI Deployment

```bash
# Deploy to production
pnpm deploy:vercel

# Or manually
vercel --prod --confirm
```

#### Option B: Git-based Deployment

```bash
# Push to main branch triggers automatic deployment
git push origin main
```

### 5. Verification

After deployment, verify:

1. **Application loads**: Visit your Vercel URL
2. **Authentication works**: Test login/signup
3. **Database connection**: Create a test subscription
4. **Analytics**: Check Sentry/PostHog for errors
5. **Security headers**: Use browser dev tools to verify headers

## 🔄 Rollback Procedure

### Quick Rollback (Vercel Dashboard)

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "Promote" to make it production
4. Confirm the rollback

### CLI Rollback

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-id>
```

## 📊 Free Plan Limits & Monitoring

### Vercel Free Plan Limits

- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Build Minutes**: 6,000 minutes/month
- **Edge Function Execution**: 500,000 invocations/day

### Upgrade Triggers

- Bandwidth exceeds 100 GB
- Function execution exceeds 100 GB-hours
- Need custom domains
- Require team collaboration features

### Monitoring Your Usage

1. Vercel Dashboard → Analytics
2. Check bandwidth usage
3. Monitor function execution
4. Review build minutes

## 🛡️ Security Configuration

### Automatic Security Headers

The `vercel.json` configuration includes:

- **HSTS**: Strict Transport Security
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **Referrer-Policy**: Control referrer information
- **Permissions-Policy**: Restrict browser features

### Custom Domain Setup

1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Enable SSL (automatic)

## 🔧 Troubleshooting

### Common Issues

#### Build Fails

```bash
# Check build logs
vercel logs

# Test build locally
pnpm build

# Check TypeScript errors
pnpm type-check
```

#### Environment Variables Not Working

- Verify variables are set for correct environment
- Check variable names (case-sensitive)
- Ensure no extra spaces or quotes
- Redeploy after adding variables

#### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies
- Test connection in Supabase dashboard

#### Function Timeouts

- Check edge function logs
- Optimize function code
- Consider increasing `maxDuration` in `vercel.json`

### Getting Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support**: Available in dashboard
3. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## 🚀 Advanced Configuration

### Edge Functions

For server-side operations (webhooks, API calls):

```typescript
// api/webhooks/stripe.ts
export default async function handler(req, res) {
  // Handle Stripe webhooks
}
```

### Custom Headers

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

### Performance Optimization

- Enable Vercel Analytics
- Configure image optimization
- Use edge caching strategies
- Monitor Core Web Vitals

## 📝 Deployment Checklist

- [ ] Local build passes (`pnpm build`)
- [ ] Tests pass (`pnpm test && pnpm e2e`)
- [ ] Environment variables configured
- [ ] Vercel project linked
- [ ] Production deployment successful
- [ ] Application functionality verified
- [ ] Security headers confirmed
- [ ] Analytics tracking working
- [ ] Rollback procedure tested

## 🔗 Related Documentation

- [Vercel Setup Guide](../VERCEL_SETUP.md) - Detailed Vercel configuration
- [Supabase Setup](../SUPABASE_SETUP.md) - Database configuration
- [Stripe Setup](../STRIPE_SETUP.md) - Payment integration
- [Production Readme](../PRODUCTION_README.md) - Production considerations
