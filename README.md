# SubTrack - Subscription Management Platform

A modern, production-ready subscription tracking application built with React 19, TypeScript, and Supabase.

## ✨ Features

### Core Functionality
- 📊 **Dashboard Analytics** - KPI cards, spending charts, category breakdowns
- 💳 **Subscription Management** - CRUD operations with bulk CSV import/export
- 🎯 **Smart Onboarding** - Guided setup with CSV import wizard
- 💰 **Multi-Currency Support** - Real-time exchange rates with 6+ currencies
- 👥 **Team Collaboration** - Role-based access with seat management
- 🔔 **Smart Notifications** - Email & Slack reminders for upcoming payments
- 📱 **Responsive Design** - Mobile-first with PWA support

### Advanced Features
- 📈 **Category Analytics** - Materialized views with Recharts visualizations
- 🛡️ **Seat Management** - RLS-enforced team limits with upgrade prompts
- 🔄 **CSV Import/Export** - Robust parsing with validation and error handling
- 🎨 **Storybook Integration** - Component library with Chromatic deployment
- 🌙 **Dark Mode** - Theme switching with system preference detection
- ♿ **Accessibility** - WCAG compliant with keyboard navigation

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + RLS + Edge Functions)
- **Auth**: Supabase Email/Password + WorkOS SSO
- **Billing**: Stripe Checkout with webhook integration
- **Testing**: Vitest (unit) + Playwright (e2e)
- **CI/CD**: GitHub Actions + Vercel deployment
- **Monitoring**: Sentry + PostHog + Vercel Analytics

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- npm ≥ 8
- Supabase CLI ≥ 1.176.7

### 1. Clone & Install
```bash
git clone https://github.com/your-username/subtrack.git
cd subtrack
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WorkOS AuthKit
VITE_WORKOS_CLIENT_ID=your-workos-client-id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Monitoring (Optional)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 3. Database Setup
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Deploy edge functions
supabase functions deploy

# Create demo data
npm run seed
```

### 4. Development
```bash
npm run dev          # Start development server
npm run test         # Run unit tests
npm run e2e          # Run E2E tests
npm run storybook    # Start Storybook
```

## 📊 Demo Data

After running `npm run seed`, use these credentials:
- **Email**: `demo@subtrack.dev`
- **Password**: `demo123`

## 🏗 Architecture

```
Frontend (React + Vite)
├── Components (shadcn/ui)
├── Features (subscriptions, teams, billing)
├── Pages (dashboard, settings, onboarding)
└── Hooks & Utils

Backend (Supabase)
├── PostgreSQL (RLS policies)
├── Edge Functions (reminders, webhooks)
├── Auth (Supabase + WorkOS)
└── Storage (icons, avatars)
```

## 🧪 Testing

### Unit Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### E2E Tests
```bash
npm run e2e           # Run Playwright tests
npm run e2e:ui        # Playwright UI mode
```

### Component Testing
```bash
npm run storybook     # Storybook development
npm run storybook:build # Build for Chromatic
```

## 🚀 Deployment

### 🚀 Deploy on Vercel (Recommended)

SubTrack is optimized for Vercel deployment with zero-downtime static hosting and edge functions.

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
pnpm deploy:vercel

# Or use Git-based deployment
git push origin main
```

#### Step-by-Step Guide
For detailed deployment instructions, see [📖 Vercel Deployment Guide](docs/deploy-vercel.md).

#### Key Features
- **Zero-downtime**: Automatic blue-green deployments
- **Security Headers**: HSTS, X-Frame-Options, CSP
- **Edge Functions**: Serverless API routes
- **CDN**: Global content delivery network
- **Analytics**: Built-in performance monitoring

#### Environment Setup
```bash
# Required variables (set in Vercel dashboard)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Optional monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
```

#### Free Plan Limits
- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Build Minutes**: 6,000 minutes/month

### Alternative Deployment Options

#### Manual Deployment
```bash
npm run build
vercel --prod
```

#### Docker Deployment
```bash
# Build Docker image
docker build -t subtrack .

# Run container
docker run -p 3000:3000 subtrack
```

## 📈 Monitoring & Analytics

### Error Tracking
- **Sentry**: Real-time error monitoring with source maps
- **Performance**: Core Web Vitals tracking

### User Analytics
- **PostHog**: Event tracking, funnels, feature flags
- **Vercel Analytics**: Page views, performance metrics

### Infrastructure
- **Supabase**: Database monitoring, function logs
- **Vercel**: Build analytics, function performance

## 🔧 Configuration

### Environment Variables

#### Required
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

#### Optional (Monitoring)
```env
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Supabase Configuration
- **RLS Policies**: Row-level security for data isolation
- **Edge Functions**: Reminder system, webhook handlers
- **Cron Jobs**: Daily reminders, currency updates
- **Storage**: Public buckets for icons and avatars

## 📚 API Reference

### Core Endpoints
- `GET /subscriptions` - User's subscriptions
- `POST /subscriptions` - Create subscription
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription

### Team Management
- `GET /teams` - User's teams
- `POST /teams/:id/members` - Invite team member
- `DELETE /teams/:id/members/:memberId` - Remove member

### Analytics
- `GET /analytics/category` - Category spending breakdown
- `POST /analytics/refresh` - Refresh materialized views

## 🔒 Security

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schemas for all user inputs
- **CSRF Protection**: Built-in CSRF safeguards
- **Rate Limiting**: API rate limiting via Supabase

## ♿ Accessibility

- **WCAG 2.1 AA**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Focus Management**: Proper focus indicators
- **Color Contrast**: High contrast ratios

## 📱 PWA Features

- **Offline Support**: Service worker caching
- **Install Prompt**: Native app installation
- **Push Notifications**: Payment reminders
- **Background Sync**: Data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update Storybook stories
- Follow conventional commits
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.subtrack.dev](https://docs.subtrack.dev)
- **Issues**: [GitHub Issues](https://github.com/your-username/subtrack/issues)
- **Discord**: [Community Server](https://discord.gg/subtrack)

## 🗺 Roadmap

### v1.1 (Next Release)
- [ ] Advanced reporting and exports
- [ ] Integration with bank APIs
- [ ] Mobile app (React Native)
- [ ] Advanced team permissions

### v1.2 (Future)
- [ ] AI-powered spending insights
- [ ] Subscription optimization recommendations
- [ ] Multi-language support
- [ ] Advanced automation rules

---

Built with ❤️ by the SubTrack team
