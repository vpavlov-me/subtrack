import { Badge } from '@/components/ui/badge';

const roleVariants = {
  owner: 'bg-emerald-500 text-white',
  admin: 'bg-sky-500 text-white', 
  member: 'bg-muted text-muted-foreground'
};

export default function RoleBadge({
  role,
}: {
  role: 'owner' | 'admin' | 'member';
}) {
  return (
    <Badge className={`${roleVariants[role]} capitalize`}>
      {role}
    </Badge>
  );
}
