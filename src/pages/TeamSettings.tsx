import { useEffect, useState } from 'react'
import { useTeams } from '@/features/teams/TeamsProvider'
import { fetchTeamMembers, updateMemberRole, removeMember } from '@/features/teams/api'
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import RoleBadge from '@/features/teams/components/RoleBadge'
import InviteModal from '@/features/teams/components/InviteModal'

export default function TeamSettings() {
  const { currentTeam } = useTeams()
  const [members,setMembers]=useState<any[]>([])
  useEffect(()=>{ if(currentTeam){ fetchTeamMembers(currentTeam.id).then(setMembers) } },[currentTeam])

  if(!currentTeam) return <p>No team selected.</p>
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team: {currentTeam.name}</h1>
      <InviteModal teamId={currentTeam.id} />
      <Table>
        <TableHeader>
          <TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {members.map(m=> (
            <TableRow key={m.member_id}>
              <TableCell>{m.member_id}</TableCell>
              <TableCell><RoleBadge role={m.role} /></TableCell>
              <TableCell>
                {m.role!=='owner' && (
                  <Button size="sm" variant="outline" onClick={()=>removeMember(currentTeam.id,m.member_id)}>Remove</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 