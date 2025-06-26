# Development Guide

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 8
- Supabase CLI ≥ 1.176.7
- Git

## Environment Setup

Create `.env.local` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WorkOS AuthKit
VITE_WORKOS_CLIENT_ID=your-workos-client-id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Sentry (optional)
VITE_SENTRY_DSN=your-sentry-dsn

# PostHog (optional)
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

## Local Development

1. **Start Supabase**
   ```bash
   supabase start
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Run tests**
   ```bash
   pnpm test          # Unit tests
   pnpm e2e           # E2E tests
   pnpm test:watch    # Watch mode
   ```

5. **Run Storybook**
   ```bash
   pnpm storybook
   ```

## Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --local > src/types/supabase.ts
```

## Edge Functions

```bash
# Deploy edge functions
supabase functions deploy

# Test locally
supabase functions serve
```

## Testing

### Unit Tests
- Framework: Vitest
- Environment: jsdom
- Location: `src/**/*.test.ts`

### E2E Tests
- Framework: Playwright
- Location: `e2e/**/*.spec.ts`

### Test Coverage
```bash
pnpm test --coverage
```

## Code Quality

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm build
```

### Pre-commit Hooks
Husky runs lint and tests before each commit.

## Deployment

### Vercel
- Automatic deployments on push to `main`
- Preview deployments on pull requests
- Environment variables configured in Vercel dashboard

### Supabase
- Database migrations applied automatically
- Edge functions deployed via CLI

## Architecture

### Frontend
- React 19 + TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui
- React Router v6
- React Hook Form + Zod

### Backend
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Edge Functions
- Real-time subscriptions

### Authentication
- Supabase Auth
- WorkOS AuthKit for SSO

### State Management
- React Context for global state
- Local state with useState/useReducer

## Feature Structure

```
src/features/
├── subscriptions/     # Subscription management
├── teams/            # Team & role management
├── billing/          # Stripe integration
├── onboarding/       # Guided onboarding
└── currency/         # Multi-currency support
```

## Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Run lint and tests
5. Create pull request

## Troubleshooting

### Common Issues

**Playwright tests failing**
- Ensure browsers are installed: `npx playwright install`

**Supabase connection issues**
- Check if Supabase is running: `supabase status`
- Verify environment variables

**Build failures**
- Clear node_modules: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Check TypeScript errors: `pnpm build` 