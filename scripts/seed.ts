#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(url, key)

async function run() {
  const email = 'demo@subtrack.dev'
  const password = 'demo123'

  // create user
  const { data: user } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  const userId = user?.user?.id
  if (!userId) throw new Error('failed to create user')

  // create team
  const teamId = randomUUID()
  await supabase.from('teams').insert({ id: teamId, name: 'Demo Team', owner_id: userId })

  // subscriptions
  const now = new Date()
  await supabase.from('subscriptions').insert([
    { user_id: userId, name: 'Netflix', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', next_payment_date: new Date(now.getFullYear(), now.getMonth()+1, 1), category: 'Entertainment', tz: 'UTC' },
    { user_id: userId, name: 'Figma', amount: 12.00, currency: 'USD', billing_cycle: 'monthly', next_payment_date: new Date(now.getFullYear(), now.getMonth()+1, 3), category: 'Productivity', tz: 'UTC' },
    { user_id: userId, name: 'Spotify', amount: 9.99, currency: 'USD', billing_cycle: 'monthly', next_payment_date: new Date(now.getFullYear(), now.getMonth()+1, 5), category: 'Entertainment', tz: 'UTC' },
  ])

  await supabase.from('reminder_prefs').upsert({ user_id: userId, days_before: 3, channel: 'email' })

  console.log('Seed completed')
}

run() 