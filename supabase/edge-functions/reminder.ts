// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { zonedTimeToUtc, utcToZonedTime, format as fmt } from 'https://cdn.skypack.dev/date-fns-tz@3.0.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
})

// util to convert amount to profile currency
async function convert(amount: number, from: string, to: string) {
  if (from === to) return amount
  const { data } = await supabase
    .from('currency_rates')
    .select('rate')
    .eq('base', from)
    .eq('target', to)
    .single()
  if (!data) return amount
  return Number((amount * data.rate).toFixed(2))
}

export const handler = async () => {
  // fetch prefs joined with subscriptions + profiles
  const { data: rows, error } = await supabase.rpc('fetch_due_reminders') // assume SQL RPC (create separately)
  if (error) {
    console.error(error)
    return new Response('error', { status: 500 })
  }

  const grouped: Record<string, any[]> = {}
  for (const row of rows) {
    const { user_id } = row
    if (!grouped[user_id]) grouped[user_id] = []
    grouped[user_id].push(row)
  }

  for (const [userId, list] of Object.entries(grouped)) {
    const { data: profile } = await supabase.from('profiles').select('subscription_status, customer_id, subscription_id').eq('user_id', userId).single()
    const pref = list[0]
    const userTz = pref.tz || 'UTC'

    const lines: string[] = []
    let total = 0
    for (const sub of list) {
      const nextUtc = zonedTimeToUtc(sub.next_payment_date, sub.tz)
      const nextLocal = utcToZonedTime(nextUtc, userTz)
      const converted = await convert(sub.amount, sub.currency, pref.profile_currency)
      total += converted
      lines.push(`• ${sub.name} – ${fmt(nextLocal, 'yyyy-MM-dd', { timeZone: userTz })} (${pref.profile_currency} ${converted})`)
    }

    const subject = `SubTrack: платежей через ${pref.days_before} дн. на сумму ${pref.profile_currency} ${total.toFixed(2)}`
    const content = `Здравствуйте!\n\n${lines.join('\n')}\n\n– SubTrack`

    await supabase.functions.invoke('send-reminder-email', {
      body: { to: pref.email, subject, content },
    })
  }

  return new Response('ok', { status: 200 })
}

Deno.serve(handler) 