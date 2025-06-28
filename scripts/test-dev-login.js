#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🧪 Testing Dev Login');
console.log('==================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n1️⃣ Environment check:');
console.log('   Has URL:', !!supabaseUrl);
console.log('   Has Key:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n⚠️ No Supabase env vars - should use mock client');
} else {
  console.log('\n✅ Supabase env vars present - will try real client first');
}

console.log('\n2️⃣ Testing dev credentials:');
const devEmail = 'dev@subtrack.dev';
const devPassword = 'dev123';

console.log('   Email:', devEmail);
console.log('   Password:', devPassword);

// Test with real Supabase first
if (supabaseUrl && supabaseKey) {
  console.log('\n3️⃣ Testing with real Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword
    });
    
    if (error) {
      console.log('   ❌ Real Supabase failed:', error.message);
      
      if (error.message.includes('relation') || error.message.includes('table')) {
        console.log('   ℹ️ This is expected - tables don\'t exist');
        console.log('   🔄 Should fall back to local storage');
      }
    } else {
      console.log('   ✅ Real Supabase login successful');
      console.log('   User:', data.user?.email);
    }
  } catch (error) {
    console.log('   ❌ Real Supabase error:', error.message);
  }
}

console.log('\n4️⃣ Testing development server...');
try {
  const response = await fetch('http://localhost:5177');
  if (response.ok) {
    console.log('   ✅ Dev server is running');
    console.log('   📍 URL: http://localhost:5177');
  } else {
    console.log('   ❌ Dev server error:', response.status);
  }
} catch (error) {
  console.log('   ❌ Dev server not accessible:', error.message);
}

console.log('\n📋 Instructions for testing dev login:');
console.log('=====================================');
console.log('');
console.log('1. Open browser and go to http://localhost:5177');
console.log('2. Look for "🚀 Dev Login (dev@subtrack.dev)" button');
console.log('3. Click the button');
console.log('4. Check browser console for logs');
console.log('5. Should redirect to /dashboard if successful');
console.log('');
console.log('🔧 If dev login doesn\'t work:');
console.log('- Check browser console for errors');
console.log('- Verify the button is visible (only in dev mode)');
console.log('- Try removing env vars to force mock mode');
console.log('- Check if tables exist in Supabase');
console.log('');
console.log('🎯 Expected behavior:');
console.log('- Button should be visible in development mode');
console.log('- Clicking should log in with dev@subtrack.dev');
console.log('- Should redirect to dashboard');
console.log('- Console should show detailed logs'); 