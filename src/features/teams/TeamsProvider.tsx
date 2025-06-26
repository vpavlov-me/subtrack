import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Team, fetchMyTeams } from './api'

interface Ctx {
  teams: Team[]
  currentTeam?: Team
  setCurrentTeam: (id: string) => void
  reload: () => void
}
const TeamsContext = createContext<Ctx | undefined>(undefined)

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentId, setCurrentId] = useState<string | undefined>()

  const reload = async () => {
    const list = await fetchMyTeams()
    setTeams(list)
    if (!currentId && list.length) setCurrentId(list[0].id)
  }
  useEffect(() => { void reload() }, [])

  const currentTeam = teams.find(t=>t.id===currentId)

  return (
    <TeamsContext.Provider value={{ teams, currentTeam, setCurrentTeam: setCurrentId, reload }}>
      {children}
    </TeamsContext.Provider>
  )
}
export function useTeams() {
  const ctx = useContext(TeamsContext)
  if (!ctx) throw new Error('useTeams must be within TeamsProvider')
  return ctx
} 