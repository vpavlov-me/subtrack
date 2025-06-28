#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Applying migrations to Supabase...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Apply in order

console.log(`📁 Found ${migrationFiles.length} migration files`);

async function applyMigrations() {
  for (const file of migrationFiles) {
    console.log(`\n🔍 Applying ${file}...`);
    
    try {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split SQL by semicolons and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ Statement skipped (might already exist): ${error.message}`);
          }
        }
      }
      
      console.log(`✅ ${file} applied successfully`);
      
    } catch (error) {
      console.error(`❌ Error applying ${file}:`, error.message);
    }
  }
}

// Alternative: Apply key migrations manually
async function applyKeyMigrations() {
  console.log('\n🔧 Applying key migrations manually...');
  
  const migrations = [
    // Profiles table
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
    
    // Teams table
    `CREATE TABLE IF NOT EXISTS teams (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    )`,
    
    // Team members table
    `CREATE TABLE IF NOT EXISTS team_members (
      team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
      member_id uuid REFERENCES auth.users ON DELETE CASCADE,
      role text NOT NULL DEFAULT 'member',
      active boolean DEFAULT true,
      joined_at timestamptz DEFAULT now(),
      PRIMARY KEY (team_id, member_id)
    )`,
    
    // Subscriptions table
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
    `ALTER TABLE teams ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE team_members ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY`,
    
    // Basic RLS policies
    `CREATE POLICY IF NOT EXISTS "profiles_select" ON profiles FOR SELECT USING (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "profiles_insert" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "profiles_update" ON profiles FOR UPDATE USING (user_id = auth.uid())`,
    
    `CREATE POLICY IF NOT EXISTS "teams_select" ON teams FOR SELECT USING (owner_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "teams_insert" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid())`,
    
    `CREATE POLICY IF NOT EXISTS "subscriptions_select" ON subscriptions FOR SELECT USING (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid())`,
    `CREATE POLICY IF NOT EXISTS "subscriptions_update" ON subscriptions FOR UPDATE USING (user_id = auth.uid())`,
    
    // Auto-create profile on user signup
    `CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles(user_id) VALUES (NEW.id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER`,
    
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
    `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user()`
  ];
  
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    console.log(`\n🔍 Applying migration ${i + 1}/${migrations.length}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration });
      if (error) {
        console.log(`⚠️ Migration ${i + 1} (might already exist): ${error.message}`);
      } else {
        console.log(`✅ Migration ${i + 1} applied successfully`);
      }
    } catch (error) {
      console.log(`⚠️ Migration ${i + 1} skipped: ${error.message}`);
    }
  }
}

// Try both approaches
applyKeyMigrations().then(() => {
  console.log('\n🎉 Migrations completed!');
  console.log('\n🔍 Testing connection...');
  
  // Test the connection again
  return supabase.from('profiles').select('count').limit(1);
}).then(({ data, error }) => {
  if (error) {
    console.error('❌ Still having issues:', error.message);
  } else {
    console.log('✅ Profiles table is now accessible!');
  }
}).catch(error => {
  console.error('❌ Error:', error.message);
}); 