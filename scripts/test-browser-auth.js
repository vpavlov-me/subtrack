#!/usr/bin/env node

import puppeteer from 'puppeteer';

async function testBrowserAuth() {
  console.log('🌐 Testing authentication in browser...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('🔍 Navigating to http://localhost:5177...');
    await page.goto('http://localhost:5177', { waitUntil: 'networkidle0' });
    
    // Check if we're on login page
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for login form
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found');
      
      // Check for email and password fields
      const emailField = await page.$('input[type="email"]');
      const passwordField = await page.$('input[type="password"]');
      
      if (emailField && passwordField) {
        console.log('✅ Email and password fields found');
        
        // Try to register a new user
        console.log('🔍 Testing registration...');
        
        // Fill in registration form
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'testpassword123');
        
        // Look for register button
        const registerButton = await page.$('button[type="submit"]');
        if (registerButton) {
          console.log('✅ Register button found');
          
          // Click register
          await registerButton.click();
          
          // Wait for navigation or error
          await page.waitForTimeout(2000);
          
          // Check if we're redirected or if there's an error
          const currentUrl = page.url();
          console.log('📍 Current URL:', currentUrl);
          
          // Check for error messages
          const errorMessage = await page.$('.error, .alert, [role="alert"]');
          if (errorMessage) {
            const errorText = await errorMessage.evaluate(el => el.textContent);
            console.log('⚠️ Error message:', errorText);
          } else {
            console.log('✅ No error messages found');
          }
          
          // Check if we're logged in (look for logout button or user menu)
          const logoutButton = await page.$('button:contains("Logout"), a:contains("Logout")');
          const userMenu = await page.$('[data-testid="user-menu"], .user-menu');
          
          if (logoutButton || userMenu) {
            console.log('✅ User appears to be logged in');
          } else {
            console.log('ℹ️ User not logged in (might be expected without database)');
          }
        } else {
          console.log('⚠️ Register button not found');
        }
      } else {
        console.log('⚠️ Email or password fields not found');
      }
    } else {
      console.log('⚠️ Login form not found');
      
      // Check if we're already logged in
      const logoutButton = await page.$('button:contains("Logout"), a:contains("Logout")');
      if (logoutButton) {
        console.log('✅ User appears to be already logged in');
      }
    }
    
    // Check for dev backdoor
    const devButton = await page.$('button:contains("Dev"), button:contains("🚀")');
    if (devButton) {
      console.log('✅ Dev backdoor button found');
      
      // Click dev button
      await devButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we're logged in
      const logoutButton = await page.$('button:contains("Logout"), a:contains("Logout")');
      if (logoutButton) {
        console.log('✅ Dev login successful');
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-auth-screenshot.png' });
    console.log('📸 Screenshot saved as test-auth-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  await testBrowserAuth();
} catch (error) {
  if (error.message.includes('Cannot find module')) {
    console.log('📦 Puppeteer not installed. Installing...');
    console.log('Run: npm install puppeteer');
    console.log('Then run this script again');
  } else {
    console.error('❌ Error:', error.message);
  }
} 