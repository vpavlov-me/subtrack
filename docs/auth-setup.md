# Authentication Setup Guide

## Current Status ✅

Your Supabase project is properly configured with:
- ✅ Environment variables set in `.env.local`
- ✅ Supabase client initialized correctly
- ✅ OAuth providers configured
- ⚠️ Database schema needs to be applied

## Required Setup Steps

### 1. Apply Database Schema

**Option A: Manual Setup (Recommended)**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`aewznkhihjgkiggqszbj`)
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `scripts/setup-database.sql`
5. Click **Run**

**Option B: CLI Setup**
```bash
# Login to Supabase (requires browser)
npx supabase login

# Link project
npx supabase link --project-ref aewznkhihjgkiggqszbj

# Apply migrations
npx supabase db push
```

### 2. Configure Auth Settings

In Supabase Dashboard > Authentication > Settings:

1. **Site URL**: Set to `http://localhost:5173`
2. **Redirect URLs**: Add `http://localhost:5173/**`
3. **Email Confirmations**: Disable for development
4. **Enable signups**: Ensure enabled

### 3. Configure OAuth Providers (Optional)

For Google/GitHub login:

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add `http://localhost:5173/auth/callback` to authorized redirect URIs
   - Add credentials to Supabase Dashboard > Auth > Providers > Google

2. **GitHub OAuth**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create new OAuth App
   - Add `http://localhost:5173/auth/callback` to callback URL
   - Add credentials to Supabase Dashboard > Auth > Providers > GitHub

## Testing Authentication

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Authentication Flow
1. Open http://localhost:5173
2. Try registering with a real email address
3. Check email confirmation (if enabled)
4. Test login/logout
5. Test social login (if configured)

### 3. Verify Database Integration
After successful registration:
1. Check Supabase Dashboard > Table Editor > profiles
2. Verify a profile was created for the new user
3. Test protected routes in the app

## Development Backdoor

If you're running in development mode without proper Supabase setup, the app includes a development backdoor:

- **Dev Login**: `dev@subtrack.dev` / `dev123`
- **Dev Register**: Same credentials
- **Mock Supabase**: Automatically used when env vars are missing

## Troubleshooting

### "Email address is invalid"
- Check Supabase Auth settings
- Ensure email confirmations are properly configured
- Try with a real email address

### "relation does not exist"
- Apply database schema using `scripts/setup-database.sql`
- Check that tables are created in Table Editor

### OAuth not working
- Verify redirect URLs are correct
- Check OAuth provider settings in Supabase Dashboard
- Ensure provider credentials are valid

### Protected routes not working
- Check that user is authenticated
- Verify RLS policies are applied
- Check browser console for errors

## Environment Variables

Ensure your `.env.local` contains:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Regularly rotate API keys
- Enable email confirmations in production

## Overview

SubTrack uses Supabase for authentication with email/password login. The authentication system is built with React Context and provides a clean API for managing user sessions.

## Components

### AuthProvider

The main authentication context provider that manages:
- User session state
- Authentication methods (sign in, sign up, sign out)
- Session persistence

**Location**: `src/app/AuthProvider.tsx`

**Usage**:
```tsx
import { AuthProvider, useAuth } from '@/app/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  // ...
}
```

### ProtectedRoute

A wrapper component that ensures routes are only accessible to authenticated users.

**Location**: `src/components/ProtectedRoute.tsx`

**Usage**:
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Authentication Flow

1. **Sign Up**: User registers with email/password
2. **Email Confirmation**: User confirms email (if enabled in Supabase)
3. **Sign In**: User logs in with credentials
4. **Session Management**: AuthProvider maintains session state
5. **Protected Routes**: Routes check authentication status

## API Functions

### AuthProvider Methods

- `signIn(email, password)`: Authenticate user
- `signUp(email, password)`: Register new user
- `signOut()`: Log out user
- `user`: Current user object
- `session`: Current session object
- `loading`: Loading state

### Skip Onboarding

- `skipOnboarding()`: Mark onboarding as complete and redirect to dashboard

## Database Schema

The authentication system relies on the `profiles` table:

```sql
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  customer_id text,
  subscription_id text,
  subscription_status text,
  seat_count int NOT NULL DEFAULT 1,
  onboarding_complete boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Development Backdoor

When running in development mode (`NODE_ENV=development`) and Supabase environment variables are not set, the app runs in mock mode with a development backdoor:

### Dev Login
- **Credentials**: `dev@subtrack.dev` / `dev123`
- **Button**: "🚀 Dev Login" appears on login page
- **Auto-login**: Click the button to automatically sign in

### Dev Register
- **Button**: "🚀 Dev Register" appears on register page
- **Auto-register**: Click the button to automatically create account

### Mock Features
- All auth methods work (login, register, OAuth, password reset)
- Session persistence in memory
- Auth state change listeners
- No external dependencies

### Usage
```bash
# Run without Supabase env vars to enable dev backdoor
npm run dev
```

## Testing

Run authentication tests:

```bash
npm test src/app/AuthProvider.test.tsx
npm test src/features/onboarding/api/skipOnboarding.test.ts
```

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS policies
2. **Session Management**: Sessions are managed by Supabase
3. **Protected Routes**: All sensitive routes are wrapped with ProtectedRoute
4. **Input Validation**: Forms use Zod validation
5. **Error Handling**: Proper error messages without exposing sensitive data
6. **Development Backdoor**: Only available in development mode without Supabase config

## Migration from WorkOS

The authentication system was migrated from WorkOS AuthKit to Supabase Auth:

- Removed WorkOS dependencies
- Implemented custom AuthProvider
- Updated all components to use Supabase auth
- Maintained existing functionality

## Future Enhancements

- [ ] Social login (Google, GitHub)
- [ ] Multi-factor authentication
- [ ] Password reset functionality
- [ ] Account deletion
- [ ] Session timeout handling 