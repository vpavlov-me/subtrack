#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying migrations via REST API...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create client with anon key (limited permissions)
const supabase = createClient(supabaseUrl, supabaseKey);

// Try to create tables using REST API
async function createTablesViaREST() {
  console.log('\n🔍 Attempting to create tables via REST API...');
  
  try {
    // Test if we can access the database
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error && error.message.includes('relation "public.profiles" does not exist')) {
      console.log('ℹ️ Profiles table does not exist, attempting to create...');
      
      // Try to create table via RPC (if available)
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_profiles_table');
      
      if (rpcError) {
        console.log('⚠️ RPC method not available:', rpcError.message);
        return false;
      }
      
      console.log('✅ Profiles table created via RPC');
      return true;
    } else if (error) {
      console.log('⚠️ Other error:', error.message);
      return false;
    } else {
      console.log('✅ Profiles table already exists');
      return true;
    }
    
  } catch (error) {
    console.log('⚠️ Error:', error.message);
    return false;
  }
}

// Alternative: Try to create tables using direct SQL via REST
async function createTablesViaSQL() {
  console.log('\n🔍 Attempting to create tables via SQL...');
  
  const sqlStatements = [
    // Create profiles table
    `CREATE TABLE IF NOT EXISTS profiles (
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
    )`,
    
    // Create subscriptions table
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users ON DELETE CASCADE,
      name text NOT NULL,
      amount decimal(10,2) NOT NULL,
      currency text DEFAULT 'USD',
      billing_cycle text DEFAULT 'monthly',
      next_billing_date date,
      status text DEFAULT 'active',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`,
    
    // Enable RLS
    `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY`,
    
    // Create basic RLS policies
    `CREATE POLICY IF NOT EXISTS "profiles_select" ON profiles FOR SELECT USING (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "profiles_insert" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "profiles_update" ON profiles FOR UPDATE USING (user_id = auth.uid())`,
    
    `CREATE POLICY IF NOT EXISTS "subscriptions_select" ON subscriptions FOR SELECT USING (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "subscriptions_update" ON subscriptions FOR UPDATE USING (user_id = auth.uid())`,
    
    // Create trigger function
    `CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles(user_id) VALUES (NEW.id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER`,
    
    // Create trigger
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
    `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user()`
  ];
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`\n🔍 Executing SQL ${i + 1}/${sqlStatements.length}...`);
    
    try {
      // Try to execute via RPC
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`⚠️ SQL ${i + 1} (might already exist): ${error.message}`);
      } else {
        console.log(`✅ SQL ${i + 1} executed successfully`);
      }
    } catch (error) {
      console.log(`⚠️ SQL ${i + 1} failed: ${error.message}`);
    }
  }
}

// Try to create RPC function first
async function createRPCFunction() {
  console.log('\n🔍 Attempting to create RPC function...');
  
  try {
    // This would require service_role key, but let's try with anon key
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT 1 as test' 
    });
    
    if (error) {
      console.log('⚠️ RPC function not available:', error.message);
      return false;
    }
    
    console.log('✅ RPC function available');
    return true;
  } catch (error) {
    console.log('⚠️ RPC function not available:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting migration application...');
  
  // Try different approaches
  const rpcAvailable = await createRPCFunction();
  
  if (rpcAvailable) {
    await createTablesViaSQL();
  } else {
    await createTablesViaREST();
  }
  
  // Test the result
  console.log('\n🔍 Testing database access...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Still cannot access profiles table:', error.message);
      console.log('\n📋 Manual setup required:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Copy and paste scripts/setup-database.sql');
      console.log('3. Click Run');
    } else {
      console.log('✅ Profiles table is now accessible!');
      console.log('🎉 Database setup completed successfully!');
    }
  } catch (error) {
    console.log('❌ Error testing database:', error.message);
  }
}

main().catch(console.error); 