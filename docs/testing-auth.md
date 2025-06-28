# Test Authentication Guide

## Overview

SubTrack implements a secure test authentication system that separates development/CI testing from production data. This system ensures that test users can only access test data and production users can only access production data.

## Architecture

### Test User Isolation

- **Test Users**: `admin@demo.dev`, `member@demo.dev`
- **Test Flag**: `is_test` column in profiles table
- **JWT Claims**: Custom claims for test user identification
- **RLS Policies**: Data isolation based on test status

### Environment Separation

```
Production Environment:
├── Production Supabase Project
├── Production Data
└── Production Users (is_test = false)

Development Environment:
├── Development Supabase Project  
├── Test Data
└── Test Users (is_test = true)
```

## Setup

### 1. Environment Variables

Create `.env.local` with the following variables:

```env
# Production (Server-side only)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Development (Client-side)
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_SUPABASE_DEV_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_DEV_ANON_KEY=your-dev-anon-key

# Test Authentication
VITE_TEST_AUTH=1

# Test Users
TEST_ADMIN_EMAIL=admin@demo.dev
TEST_MEMBER_EMAIL=member@demo.dev
TEST_USER_PASSWORD=test123456
```

### 2. Database Setup

Apply the test authentication migrations:

```bash
# Apply migrations
npx supabase db push

# Or manually run SQL files:
# - supabase/migrations/20250706_add_is_test.sql
# - supabase/migrations/20250706_test_rls_policies.sql
# - supabase/migrations/20250706_test_jwt_claims.sql
```

### 3. Seed Test Users

```bash
# Create test users
npm run seed:test

# Clean up test data
npm run truncate:test
```

## Usage

### Development

1. **Enable Test Auth**: Set `VITE_TEST_AUTH=1` in your environment
2. **Test User Switcher**: Use the dropdown in the UI to switch between test users
3. **Data Isolation**: Test users can only see test data

### CI/CD

The CI pipeline automatically:
1. Seeds test users before E2E tests
2. Runs tests with test authentication enabled
3. Cleans up test data after tests complete

### E2E Testing

```typescript
import { loginAsAdmin, loginAsMember, logout } from './utils/login';

test('test subscription flow', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page);
  
  // Test functionality
  await page.click('button:has-text("Add Subscription")');
  
  // Logout
  await logout(page);
});
```

## Security Features

### 1. Data Isolation

- **RLS Policies**: Test users can only access data where `is_test = true`
- **JWT Claims**: Custom claims prevent cross-environment access
- **Environment Separation**: Different Supabase projects for dev/prod

### 2. Access Control

- **Test Flag Validation**: Only allowed test emails can be used
- **Environment Checks**: Test auth only works in development
- **Password Protection**: Test users have secure passwords

### 3. Cleanup

- **Automatic Cleanup**: CI automatically removes test data
- **Manual Cleanup**: `npm run truncate:test` removes all test data
- **User Deletion**: Test users are completely removed after cleanup

## Test Users

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| `admin@demo.dev` | Admin | `test123456` | Admin functionality testing |
| `member@demo.dev` | Member | `test123456` | Member functionality testing |

## Database Schema

### Profiles Table

```sql
ALTER TABLE profiles ADD COLUMN is_test boolean DEFAULT false;
```

### RLS Policies

```sql
-- Test users can only see test data
CREATE POLICY "test_data_isolation" ON subscriptions
  FOR ALL USING (
    (jwt.claims ->> 'is_test')::boolean = true AND 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true)
  );
```

### JWT Claims

```sql
-- Set test user claims
CREATE OR REPLACE FUNCTION set_test_user_claims(user_id uuid, is_test boolean)
RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', 
    json_build_object('is_test', is_test)::text, 
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Troubleshooting

### Test Users Not Created

```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Re-run seeding
npm run seed:test
```

### Test Auth Not Working

1. **Check Environment**: Ensure `VITE_TEST_AUTH=1`
2. **Check Database**: Verify migrations are applied
3. **Check Users**: Ensure test users exist in database

### Data Isolation Issues

1. **Check RLS**: Verify RLS policies are enabled
2. **Check JWT Claims**: Ensure test users have correct claims
3. **Check Environment**: Verify using correct Supabase project

### CI Failures

1. **Check Secrets**: Verify GitHub secrets are set
2. **Check Permissions**: Ensure service role key has admin access
3. **Check Network**: Verify CI can access Supabase

## Best Practices

### Development

1. **Always use test users** for development testing
2. **Never use production data** in development
3. **Clean up test data** regularly
4. **Use environment variables** for configuration

### Testing

1. **Test both admin and member roles**
2. **Verify data isolation** between users
3. **Test cleanup procedures**
4. **Use realistic test data**

### Security

1. **Never commit test passwords** to version control
2. **Rotate test passwords** regularly
3. **Monitor test user activity**
4. **Use separate environments** for dev/prod

## Migration from Old System

If migrating from the old development backdoor:

1. **Update environment variables** to use new structure
2. **Apply database migrations** for test isolation
3. **Seed new test users** using the new system
4. **Update E2E tests** to use new login utilities
5. **Remove old dev backdoor** code

## Future Enhancements

- [ ] Multi-tenant test environments
- [ ] Automated test data generation
- [ ] Test user role management
- [ ] Test environment monitoring
- [ ] Test data backup/restore 