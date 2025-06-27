import { AdvancedTeamFeatures } from '@/features/teams/components/AdvancedTeamFeatures';
import Skeleton from '@/components/ui/skeleton';

export default function TeamAdvanced() {
  // For demo, add loading state
  const loading = false;
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <AdvancedTeamFeatures />
      </div>
    </div>
  );
}
