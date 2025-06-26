import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useOnboarding } from '../OnboardingContext'

export default function Step2Reminder() {
  const { next, prev } = useOnboarding()
  const [days,setDays]=useState(3)
  async function save() {
    await supabase.from('reminder_prefs').upsert({ days_before: days, channel: 'email' })
    next()
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Default payment reminder</h2>
      <label className="block">Days before payment
        <Input type="number" min={0} value={days} onChange={e=>setDays(Number(e.target.value))} className="mt-1" />
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={prev}>Back</Button>
        <Button onClick={save}>Next</Button>
      </div>
    </div>
  )
} 