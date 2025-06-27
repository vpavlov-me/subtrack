import { Badge } from '@/components/ui/badge';
export default function RoleBadge({
  role,
}: {
  role: 'owner' | 'admin' | 'member';
}) {
  const color =
    role === 'owner'
      ? 'bg-emerald-500'
      : role === 'admin'
        ? 'bg-sky-500'
        : 'bg-zinc-500';
  return <Badge className={`${color} text-white capitalize`}>{role}</Badge>;
}
