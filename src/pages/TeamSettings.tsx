import { useEffect, useState } from 'react'
import { useTeams } from '@/features/teams/TeamsProvider'
import { fetchTeamMembers, removeMember } from '@/features/teams/api'
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import RoleBadge from '@/features/teams/components/RoleBadge'
import InviteModal from '@/features/teams/components/InviteModal'
import { SeatLimitBanner, SeatUsageIndicator } from '@/features/billing/components/SeatLimitBanner'
import { usePlanGuard } from '@/features/billing/hooks/usePlanGuard'
import { supabase } from '@/lib/supabase'

interface TeamMember {
  member_id: string
  role: 'owner' | 'admin' | 'member'
  email?: string
  full_name?: string
}

interface SeatUsage {
  seat_count: number
  current_members: number
  available_seats: number
  is_at_limit: boolean
}

export default function TeamSettings() {
  const { currentTeam } = useTeams()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seatUsage, setSeatUsage] = useState<SeatUsage | null>(null)
  const { openUpgradeModal } = usePlanGuard()

  useEffect(() => {
    if (currentTeam) {
      setLoading(true)
      setError(null)
      
      // Fetch team members and seat usage
      Promise.all([
        fetchTeamMembers(currentTeam.id),
        fetchSeatUsage(currentTeam.id)
      ])
        .then(([membersData, seatData]) => {
          setMembers(membersData)
          setSeatUsage(seatData)
        })
        .catch((err) => {
          console.error('Failed to fetch team data:', err)
          setError('Failed to load team data')
        })
        .finally(() => setLoading(false))
    }
  }, [currentTeam])

  const fetchSeatUsage = async (teamId: string): Promise<SeatUsage> => {
    const { data, error } = await supabase
      .rpc('get_team_seat_usage', { team_id_param: teamId })
    
    if (error) {
      console.error('Failed to fetch seat usage:', error)
      return { seat_count: 1, current_members: 1, available_seats: 0, is_at_limit: false }
    }
    
    return data?.[0] || { seat_count: 1, current_members: 1, available_seats: 0, is_at_limit: false }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return
    
    try {
      await removeMember(currentTeam.id, memberId)
      // Обновляем список участников
      const updatedMembers = members.filter(m => m.member_id !== memberId)
      setMembers(updatedMembers)
      
      // Refresh seat usage
      const newSeatUsage = await fetchSeatUsage(currentTeam.id)
      setSeatUsage(newSeatUsage)
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
      
      {/* Seat Usage Indicator */}
      {seatUsage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Seats
            </h3>
            <span className="text-sm text-gray-500">
              {seatUsage.current_members} of {seatUsage.seat_count} used
            </span>
          </div>
          <SeatUsageIndicator 
            currentMembers={seatUsage.current_members} 
            maxSeats={seatUsage.seat_count} 
          />
        </div>
      )}
      
      {/* Seat Limit Banner */}
      {seatUsage && seatUsage.is_at_limit && (
        <SeatLimitBanner
          currentMembers={seatUsage.current_members}
          maxSeats={seatUsage.seat_count}
          onUpgrade={openUpgradeModal}
        />
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