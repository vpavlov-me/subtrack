import { supabase } from '@/lib/supabase';
export type Team = { id: string; name: string; owner_id: string };
export type TeamMember = {
  team_id: string;
  member_id: string;
  role: 'owner' | 'admin' | 'member';
  active: boolean;
};

export async function fetchMyTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) {
    console.error(error);
    return [];
  }
  return data as Team[];
}

export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId);
  if (error) {
    console.error(error);
    return [];
  }
  return data as TeamMember[];
}

export async function inviteMember(
  teamId: string,
  email: string,
  role: 'admin' | 'member' = 'member'
) {
  const { error } = await supabase.functions.invoke('send-invite-email', {
    body: { teamId, email, role },
  });
  if (error) throw error;
}

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  role: 'admin' | 'member'
) {
  await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('member_id', memberId);
}

export async function removeMember(teamId: string, memberId: string) {
  await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('member_id', memberId);
}
