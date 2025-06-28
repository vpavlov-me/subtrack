import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Supabase client for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for E2E tests');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'member';
}

const testUsers: TestUser[] = [
  {
    email: 'admin@demo.dev',
    password: 'test123456',
    name: 'Test Admin',
    role: 'admin'
  },
  {
    email: 'member@demo.dev',
    password: 'test123456',
    name: 'Test Member',
    role: 'member'
  }
];

/**
 * Login as test user using magic link
 */
export async function loginAs(page: Page, email: string): Promise<void> {
  const testUser = testUsers.find(u => u.email === email);
  if (!testUser) {
    throw new Error(`Test user ${email} not found`);
  }

  console.log(`🔧 Logging in as test user: ${email}`);

  try {
    // Generate magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: testUser.email,
      options: {
        redirectTo: `${process.env.BASE_URL || 'http://localhost:5173'}/dashboard`
      }
    });

    if (error) {
      throw error;
    }

    if (!data.properties.action_link) {
      throw new Error('No action link generated');
    }

    // Navigate to magic link
    await page.goto(data.properties.action_link);
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    console.log(`✅ Successfully logged in as ${email}`);

  } catch (error) {
    console.error(`❌ Failed to login as ${email}:`, error);
    throw error;
  }
}

/**
 * Login as admin test user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  return loginAs(page, 'admin@demo.dev');
}

/**
 * Login as member test user
 */
export async function loginAsMember(page: Page): Promise<void> {
  return loginAs(page, 'member@demo.dev');
}

/**
 * Login using traditional form (fallback)
 */
export async function loginWithForm(page: Page, email: string, password: string): Promise<void> {
  console.log(`🔧 Logging in with form: ${email}`);

  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  console.log(`✅ Successfully logged in with form as ${email}`);
}

/**
 * Login as test user with form (fallback method)
 */
export async function loginAsWithForm(page: Page, email: string): Promise<void> {
  const testUser = testUsers.find(u => u.email === email);
  if (!testUser) {
    throw new Error(`Test user ${email} not found`);
  }

  return loginWithForm(page, testUser.email, testUser.password);
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  console.log('🔧 Logging out...');

  // Click logout button (assuming it exists in the UI)
  await page.click('[data-testid="logout-button"], button:has-text("Logout"), [aria-label="Logout"]');
  
  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: 5000 });
  
  console.log('✅ Successfully logged out');
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check if we're on dashboard or authenticated page
    const currentUrl = page.url();
    return currentUrl.includes('/dashboard') || currentUrl.includes('/subscriptions');
  } catch {
    return false;
  }
}

/**
 * Get test user by email
 */
export function getTestUser(email: string): TestUser | undefined {
  return testUsers.find(u => u.email === email);
}

/**
 * Get all test users
 */
export function getTestUsers(): TestUser[] {
  return testUsers;
} 