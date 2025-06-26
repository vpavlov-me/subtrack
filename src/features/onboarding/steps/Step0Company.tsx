import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useOnboarding } from '../OnboardingContext'

export default function Step0Company() {
  const { next } = useOnboarding()
  const [name,setName]=useState('')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Welcome! What's your company name?</h2>
      <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Company Inc." />
      <Button disabled={!name} onClick={next}>Next</Button>
    </div>
  )
} 