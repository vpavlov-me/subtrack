#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Authentication...');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined');
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    // Test 1: Check current user (should be null for anonymous)
    console.log('\n🔍 Test 1: Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('ℹ️ Expected error for anonymous user:', userError.message);
    } else {
      console.log('✅ Auth service working');
      console.log('👤 Current user:', user?.email || 'anonymous');
    }
    
    // Test 2: Test signup
    console.log('\n🔍 Test 2: Testing signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signupError) {
      console.log('⚠️ Signup test:', signupError.message);
    } else {
      console.log('✅ Signup working');
      console.log('📧 User created:', signupData.user?.email);
    }
    
    // Test 3: Test signin (if signup worked)
    if (signupData?.user) {
      console.log('\n🔍 Test 3: Testing signin...');
      
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signinError) {
        console.log('⚠️ Signin test:', signinError.message);
      } else {
        console.log('✅ Signin working');
        console.log('🔑 Session created:', !!signinData.session);
      }
      
      // Test 4: Test signout
      console.log('\n🔍 Test 4: Testing signout...');
      const { error: signoutError } = await supabase.auth.signOut();
      
      if (signoutError) {
        console.log('⚠️ Signout test:', signoutError.message);
      } else {
        console.log('✅ Signout working');
      }
    }
    
    // Test 5: Test OAuth providers
    console.log('\n🔍 Test 5: Testing OAuth providers...');
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173'
      }
    });
    
    if (oauthError) {
      console.log('ℹ️ OAuth test (expected for test):', oauthError.message);
    } else {
      console.log('✅ OAuth configuration working');
      console.log('🔗 OAuth URL:', oauthData.url ? 'Generated' : 'None');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return false;
  }
}

testAuth().then(success => {
  if (success) {
    console.log('\n🎉 Authentication tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Apply database schema using scripts/setup-database.sql');
    console.log('2. Test the full authentication flow in the browser');
    console.log('3. Check that user profiles are created automatically');
  } else {
    console.log('\n💥 Authentication tests failed. Check your configuration.');
    process.exit(1);
  }
}); 