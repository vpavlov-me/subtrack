#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n🔍 Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
    
    // Test profiles table
    console.log('\n🔍 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      return false;
    }
    
    console.log('✅ Profiles table accessible');
    console.log('📊 Profiles count:', profiles?.length || 0);
    
    // Test auth
    console.log('\n🔍 Testing auth...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️ Auth test (expected for anonymous user):', authError.message);
    } else {
      console.log('✅ Auth working');
      console.log('👤 Current user:', user?.email || 'anonymous');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Supabase is properly configured.');
  } else {
    console.log('\n💥 Some tests failed. Check your configuration.');
    process.exit(1);
  }
}); 