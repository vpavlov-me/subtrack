# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CI/CD pipeline with quality checks, testing, and deployment
- Automated release workflow with version bumping and changelog generation
- GitHub issue templates for bugs, features, and security vulnerabilities
- CODEOWNERS file for automatic reviewer assignment
- Dependabot configuration for automated dependency updates
- Contributing guidelines and development documentation
- Branch protection rules and pull request workflow

### Changed
- Updated CI workflow to use npm instead of pnpm
- Enhanced E2E tests with better error handling and reporting
- Improved security scanning with Snyk integration

### Fixed
- Resolved linter errors in CI workflow configuration
- Fixed conditional syntax in release workflow

## [0.9.0] - 2024-12-19

### Added
- Free plan subscription limit enforcement (max 5 subscriptions)
- Stripe webhook integration with billing status synchronization
- Onboarding completion flag and post-onboarding redirect
- Comprehensive Playwright E2E tests for CRUD operations
- Currency switcher with base currency persistence
- PostHog feedback widget integration
- Database seed script for demo data
- GitHub Actions CI pipeline with test coverage
- Branch protection and pull request templates

### Changed
- Enhanced subscription management with plan-based restrictions
- Improved billing status tracking and synchronization
- Updated onboarding flow with completion tracking
- Enhanced UI with upgrade prompts and currency selection
- Improved error handling and user feedback

### Fixed
- Stripe webhook field processing issues
- Onboarding redirect logic
- Currency conversion accuracy
- Test coverage and reliability

## [0.8.0] - 2024-12-18

### Added
- Team collaboration features
- Role-based access control
- Invite system for team members
- Audit logging for security compliance
- KPI dashboard with spending analytics
- Reminder system for subscription renewals
- Timezone support for global users

### Changed
- Enhanced subscription management interface
- Improved billing integration
- Updated authentication flow with WorkOS SSO
- Better mobile responsiveness

### Fixed
- Authentication edge cases
- Data synchronization issues
- Performance optimizations

## [0.7.0] - 2024-12-17

### Added
- Stripe billing integration
- Subscription management dashboard
- User authentication with Supabase
- Basic CRUD operations for subscriptions
- Responsive design with Tailwind CSS
- Dark mode support

### Changed
- Initial project setup
- Core architecture implementation
- Database schema design

### Fixed
- Initial bugs and issues

---

## Migration Guides

### Upgrading to 0.9.0

1. **Database Migrations**: Run the latest migrations to add new fields:
   ```bash
   supabase db reset
   ```

2. **Environment Variables**: Add new required environment variables:
   ```bash
   VITE_POSTHOG_KEY=your_posthog_key
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```

3. **Stripe Webhook**: Update your Stripe webhook endpoint to handle new fields:
   - `seat_count`
   - `current_period_end`
   - `cancel_at`

4. **Plan Limits**: Free plan users are now limited to 5 subscriptions. Existing users with more than 5 subscriptions will need to upgrade.

### Upgrading to 0.8.0

1. **Team Features**: New team-related tables and RLS policies have been added
2. **Audit Logging**: Audit logs are now automatically created for sensitive operations
3. **Timezone Support**: Users can now set their preferred timezone

### Upgrading to 0.7.0

1. **Authentication**: New authentication system with Supabase
2. **Billing**: Stripe integration for subscription management
3. **Database**: Complete database schema redesign

---

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the contributing guidelines

---

## Contributors

Thank you to all contributors who have helped make SubTrack better!

<!--
## Template for new versions:

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes
--> 