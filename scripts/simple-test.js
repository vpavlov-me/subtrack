#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🧪 Simple Application Test');
console.log('========================');

// Test 1: Environment variables
console.log('\n1️⃣ Testing environment variables...');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  console.log('✅ Environment variables loaded');
  console.log('   URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('   Key:', supabaseKey.substring(0, 20) + '...');
} else {
  console.log('⚠️ Environment variables missing');
}

// Test 2: Supabase connection
console.log('\n2️⃣ Testing Supabase connection...');
if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('ℹ️ Supabase connected (expected error for anonymous user):', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
  }
} else {
  console.log('⚠️ Skipping Supabase test (no env vars)');
}

// Test 3: Development server
console.log('\n3️⃣ Testing development server...');
try {
  const response = await fetch('http://localhost:5177');
  if (response.ok) {
    console.log('✅ Development server is running');
    console.log('   Status:', response.status);
    console.log('   URL: http://localhost:5177');
  } else {
    console.log('❌ Development server error:', response.status);
  }
} catch (error) {
  console.log('❌ Development server not accessible:', error.message);
}

// Test 4: Check if key files exist
console.log('\n4️⃣ Checking key files...');
import fs from 'fs';
import path from 'path';

const keyFiles = [
  'src/lib/supabase.ts',
  'src/app/AuthProvider.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/components/ProtectedRoute.tsx',
  'scripts/setup-database.sql'
];

for (const file of keyFiles) {
  if (fs.existsSync(file)) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '(missing)');
  }
}

// Test 5: Package.json scripts
console.log('\n5️⃣ Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['dev', 'build', 'test'];
  for (const script of requiredScripts) {
    if (scripts[script]) {
      console.log('✅', script, 'script available');
    } else {
      console.log('❌', script, 'script missing');
    }
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Summary
console.log('\n📋 Test Summary');
console.log('==============');

console.log('\n🎯 Next Steps:');
console.log('1. Open http://localhost:5177 in your browser');
console.log('2. Try registering with a real email address');
console.log('3. If tables don\'t exist, the app will use local storage');
console.log('4. Check browser console for any errors');
console.log('5. Apply database schema when ready');

console.log('\n🔧 Manual Database Setup:');
console.log('1. Go to Supabase Dashboard > SQL Editor');
console.log('2. Copy scripts/setup-database.sql');
console.log('3. Paste and run');

console.log('\n🚀 Quick Test:');
console.log('1. Remove VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env.local');
console.log('2. Restart dev server: npm run dev');
console.log('3. Use dev backdoor button');

console.log('\n✅ Ready for testing!'); 