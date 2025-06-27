import { EnhancedCSVImport } from '@/features/import/components/EnhancedCSVImport';
import Skeleton from '@/components/ui/skeleton';

export default function Import() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Subscriptions</h1>
          <p className="text-muted-foreground">
            Import your existing subscriptions from a CSV file. Our enhanced
            import tool will help you map columns and validate your data.
          </p>
        </div>

        <EnhancedCSVImport />
      </div>
    </div>
  );
}
