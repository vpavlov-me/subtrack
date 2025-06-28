#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'member';
}

const testUsers: TestUser[] = [
  {
    email: 'admin@demo.dev',
    password: 'test123456',
    full_name: 'Test Admin',
    role: 'admin'
  },
  {
    email: 'member@demo.dev',
    password: 'test123456',
    full_name: 'Test Member',
    role: 'member'
  }
];

async function createTestUser(user: TestUser): Promise<void> {
  try {
    console.log(`🔧 Creating test user: ${user.email}`);
    
    // Create user via Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
        is_test: true
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️ User ${user.email} already exists, updating profile...`);
      } else {
        throw authError;
      }
    } else {
      console.log(`✅ Created auth user: ${user.email}`);
    }

    // Get user ID (either from creation or existing user)
    let userId: string;
    if (authUser?.user?.id) {
      userId = authUser.user.id;
    } else {
      // Get existing user
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser.users.find(u => u.email === user.email);
      if (!user) {
        throw new Error(`Could not find user ${user.email}`);
      }
      userId = user.id;
    }

    // Create/update profile with is_test flag
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: user.full_name,
        is_test: true,
        onboarding_complete: true,
        seat_count: 1
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error(`❌ Profile creation failed for ${user.email}:`, profileError);
      throw profileError;
    }

    console.log(`✅ Profile created/updated for ${user.email}`);

    // Set custom claims for test user
    const { error: claimsError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        app_metadata: {
          is_test: true,
          role: user.role
        }
      }
    );

    if (claimsError) {
      console.error(`⚠️ Failed to set claims for ${user.email}:`, claimsError);
    } else {
      console.log(`✅ Claims set for ${user.email}`);
    }

  } catch (error) {
    console.error(`❌ Failed to create test user ${user.email}:`, error);
    throw error;
  }
}

async function seedTestUsers(): Promise<void> {
  console.log('🚀 Starting test user seeding...');
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  
  try {
    // Create test users
    for (const user of testUsers) {
      await createTestUser(user);
    }

    console.log('✅ Test user seeding completed successfully!');
    console.log('\n📋 Created test users:');
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    console.log('\n🔑 Default password for all users: test123456');

  } catch (error) {
    console.error('❌ Test user seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers();
}

export { seedTestUsers, testUsers }; 