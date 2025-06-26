// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

const BASES = ['USD', 'EUR']
const TARGETS = ['USD','EUR','GBP','JPY','RUB']

async function fetchRates(base: string) {
  const res = await fetch(`https://api.exchangerate.host/latest?base=${base}`)
  const json = await res.json()
  return json.rates as Record<string, number>
}

export const handler = async () => {
  for (const base of BASES) {
    const rates = await fetchRates(base)
    const upserts = TARGETS.filter(t=>t!==base).map(t=>({ base, target: t, rate: rates[t] || 1 }))
    if (upserts.length) {
      await supabase.from('currency_rates').upsert(upserts)
    }
  }
  return new Response('ok')
}

Deno.serve(handler) 