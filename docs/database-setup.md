# Database Setup Instructions

## Manual Database Setup

Since automatic migration application requires Supabase CLI authentication, you can set up the database manually through the Supabase Dashboard.

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (`aewznkhihjgkiggqszbj`)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Apply Database Schema

Copy and paste the entire contents of `scripts/setup-database.sql` into the SQL Editor and click **Run**.

This will create:
- `profiles` table for user profiles
- `teams` table for team management
- `team_members` table for team membership
- `subscriptions` table for subscription tracking
- Row Level Security (RLS) policies
- Triggers for automatic profile creation
- Indexes for performance
- Dashboard view for user data

### Step 3: Verify Setup

After running the SQL, you should see:
- Tables created in **Table Editor**
- RLS policies enabled
- Triggers active

### Step 4: Test Authentication

Once the database is set up, test the authentication flow:

1. Start the development server: `npm run dev`
2. Open http://localhost:5173
3. Try registering a new user
4. Check that a profile is automatically created
5. Test login/logout functionality

## Alternative: Using Supabase CLI

If you have access to Supabase CLI with proper authentication:

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref aewznkhihjgkiggqszbj

# Apply migrations
npx supabase db push
```

## Troubleshooting

### "relation does not exist" errors
- Make sure you've run the SQL setup script
- Check that tables are created in the Table Editor
- Verify RLS policies are enabled

### Authentication issues
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`
- Verify the keys match your Supabase project settings
- Ensure email confirmations are disabled in Auth settings if testing locally

### RLS Policy issues
- Make sure RLS is enabled on all tables
- Check that policies allow the operations you're trying to perform
- Verify the user is authenticated when making requests 