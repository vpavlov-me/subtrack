import { useEffect, useState } from 'react'
import { useTeams } from '@/features/teams/TeamsProvider'
import { fetchTeamMembers, removeMember } from '@/features/teams/api'
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import RoleBadge from '@/features/teams/components/RoleBadge'
import InviteModal from '@/features/teams/components/InviteModal'

interface TeamMember {
  member_id: string
  role: 'owner' | 'admin' | 'member'
  email?: string
  full_name?: string
}

export default function TeamSettings() {
  const { currentTeam } = useTeams()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentTeam) {
      setLoading(true)
      setError(null)
      fetchTeamMembers(currentTeam.id)
        .then(setMembers)
        .catch((err) => {
          console.error('Failed to fetch team members:', err)
          setError('Failed to load team members')
        })
        .finally(() => setLoading(false))
    }
  }, [currentTeam])

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return
    
    try {
      await removeMember(currentTeam.id, memberId)
      // Обновляем список участников
      const updatedMembers = members.filter(m => m.member_id !== memberId)
      setMembers(updatedMembers)
    } catch (err) {
      console.error('Failed to remove member:', err)
      setError('Failed to remove team member')
    }
  }

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">No team selected.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading team members...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team: {currentTeam.name}</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <InviteModal teamId={currentTeam.id} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.member_id}>
                <TableCell>{member.email || member.member_id}</TableCell>
                <TableCell>
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell>
                  {member.role !== 'owner' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleRemoveMember(member.member_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 