import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useTeams } from '@/features/teams/TeamsProvider'
import { inviteMember } from '@/features/teams/api'
import { useOnboarding } from '../OnboardingContext'

export default function Step3Invite() {
  const { complete, prev } = useOnboarding()
  const { currentTeam } = useTeams()
  const [email,setEmail]=useState('')
  async function finish() {
    if (currentTeam && email) await inviteMember(currentTeam.id,email)
    complete()
    window.location.href='/dashboard'
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Invite teammates</h2>
      <Input placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="secondary" onClick={prev}>Back</Button>
        <Button onClick={finish}>Finish</Button>
      </div>
    </div>
  )
} 