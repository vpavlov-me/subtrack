#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function run() {
  const email = 'demo@subtrack.dev';
  const password = 'demo123';

  console.log('Creating demo user with email:', email);
  console.log('Password:', password);

  // Check if user already exists
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const userExists = existingUser.users.find(u => u.email === email);

  let userId: string;

  if (userExists) {
    console.log('Demo user already exists, using existing user');
    userId = userExists.id;
  } else {
    // Create user
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('Failed to create user:', error);
      return;
    }

    userId = user?.user?.id;
    if (!userId) throw new Error('failed to create user');
    console.log('Demo user created successfully');
  }

  // Create team
  const teamId = randomUUID();
  await supabase.from('teams').upsert(
    {
      id: teamId,
      name: 'Demo Team',
      owner_id: userId,
    },
    { onConflict: 'id' }
  );

  // Clear existing subscriptions for this user
  await supabase.from('subscriptions').delete().eq('user_id', userId);

  // Create 3 demo subscriptions
  const now = new Date();
  const subscriptions = [
    {
      user_id: userId,
      name: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      billing_cycle: 'monthly',
      next_payment_date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      category: 'Entertainment',
      tz: 'UTC',
    },
    {
      user_id: userId,
      name: 'Figma',
      amount: 12.0,
      currency: 'USD',
      billing_cycle: 'monthly',
      next_payment_date: new Date(now.getFullYear(), now.getMonth() + 1, 3),
      category: 'Productivity',
      tz: 'UTC',
    },
    {
      user_id: userId,
      name: 'Spotify',
      amount: 9.99,
      currency: 'USD',
      billing_cycle: 'monthly',
      next_payment_date: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      category: 'Entertainment',
      tz: 'UTC',
    },
  ];

  await supabase.from('subscriptions').insert(subscriptions);

  // Set reminder preferences
  await supabase.from('reminder_prefs').upsert({
    user_id: userId,
    days_before: 3,
    channel: 'email',
  });

  // Mark onboarding as complete
  await supabase
    .from('profiles')
    .update({
      onboarding_complete: true,
      base_currency: 'USD',
    })
    .eq('user_id', userId);

  console.log('✅ Seed completed successfully');
  console.log('📧 Demo user email:', email);
  console.log('🔑 Demo user password:', password);
  console.log('📊 Created 3 demo subscriptions');
  console.log('🎯 Onboarding marked as complete');
}

run().catch(console.error);
