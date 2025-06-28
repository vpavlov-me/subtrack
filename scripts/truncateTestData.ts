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

const testEmails = ['admin@demo.dev', 'member@demo.dev'];

async function deleteTestUser(email: string): Promise<void> {
  try {
    console.log(`🔧 Deleting test user: ${email}`);
    
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.log(`⚠️ User ${email} not found, skipping...`);
      return;
    }
    
    // Delete user via Admin API (this will cascade delete profile and related data)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error(`❌ Failed to delete user ${email}:`, deleteError);
      throw deleteError;
    }
    
    console.log(`✅ Deleted test user: ${email}`);
    
  } catch (error) {
    console.error(`❌ Failed to delete test user ${email}:`, error);
    throw error;
  }
}

async function cleanupTestData(): Promise<void> {
  console.log('🧹 Starting test data cleanup...');
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  
  try {
    // Delete test users (this will cascade delete all related data)
    for (const email of testEmails) {
      await deleteTestUser(email);
    }
    
    // Additional cleanup: delete any remaining test data
    console.log('🔧 Cleaning up any remaining test data...');
    
    // Get test user IDs first
    const { data: testProfiles, error: profileQueryError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('is_test', true);
    
    if (profileQueryError) {
      console.error('⚠️ Failed to query test profiles:', profileQueryError);
    } else if (testProfiles && testProfiles.length > 0) {
      const testUserIds = testProfiles.map(p => p.user_id);
      
      // Delete test subscriptions
      const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .in('user_id', testUserIds);
      
      if (subError) {
        console.error('⚠️ Failed to cleanup test subscriptions:', subError);
      } else {
        console.log('✅ Cleaned up test subscriptions');
      }
      
      // Delete test team members
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .in('member_id', testUserIds);
      
      if (teamError) {
        console.error('⚠️ Failed to cleanup test team members:', teamError);
      } else {
        console.log('✅ Cleaned up test team members');
      }
      
      // Delete test teams (owned by test users)
      const { error: teamsError } = await supabase
        .from('teams')
        .delete()
        .in('owner_id', testUserIds);
      
      if (teamsError) {
        console.error('⚠️ Failed to cleanup test teams:', teamsError);
      } else {
        console.log('✅ Cleaned up test teams');
      }
    }
    
    // Delete test profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('is_test', true);
    
    if (profileError) {
      console.error('⚠️ Failed to cleanup test profiles:', profileError);
    } else {
      console.log('✅ Cleaned up test profiles');
    }
    
    console.log('✅ Test data cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupTestData();
}

export { cleanupTestData, testEmails }; 