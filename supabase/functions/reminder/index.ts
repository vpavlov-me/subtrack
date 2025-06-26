// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: reminder
// Schedules: Set up via supabase dashboard: cron 0 9 * * * (09:00 UTC daily)
// Purpose: send payment reminder emails for subscriptions occurring in next 3 days

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables are automatically injected by Supabase when deployed
// For local testing via `supabase functions serve`, provide them in .env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Admin client (service role) – required for RLS bypass & sending emails
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

export const handler = async (_req: Request): Promise<Response> => {
  const today = new Date()
  const cutoff = new Date()
  cutoff.setDate(today.getDate() + 3)

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .lte('next_billing_date', cutoff.toISOString())

  if (error) {
    console.error('Failed to fetch subscriptions', error)
    return new Response('error', { status: 500 })
  }

  // Group subscriptions by user
  const byUser: Record<string, any[]> = {}
  for (const sub of subs ?? []) {
    if (!byUser[sub.user_id]) byUser[sub.user_id] = []
    byUser[sub.user_id].push(sub)
  }

  // Send email per user
  for (const [userId, userSubs] of Object.entries(byUser)) {
    try {
      const { data: user } = await supabase.auth.admin.getUserById(userId)
      if (!user?.email) continue

      const list = userSubs
        .map((s) => `• ${s.name} – ${new Date(s.next_billing_date).toLocaleDateString()} (${s.currency ?? 'USD'} ${s.price})`)
        .join('\n')

      const subject = `SubTrack: платежи в ближайшие 3 дня`
      const content = `Здравствуйте!\n\nСледующие подписки скоро будут списаны:\n\n${list}\n\n– SubTrack`

      await supabase.functions.invoke('send-reminder-email', {
        body: {
          to: user.email,
          subject,
          content,
        },
      })
    } catch (err) {
      console.error('Error sending email', err)
    }
  }

  return new Response('ok', { status: 200 })
}

// Export for Supabase
// deno-lint-ignore no-undef
Deno.serve(handler) 