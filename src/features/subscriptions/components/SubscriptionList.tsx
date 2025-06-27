import { Subscription } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getServiceIconUrl } from '@/features/subscriptions/icon';

interface Props {
  subscriptions: Subscription[];
  onDelete?: (id: string) => void;
  onEdit?: (subscription: Subscription) => void;
}

export function SubscriptionList({ subscriptions, onDelete, onEdit }: Props) {
  if (subscriptions.length === 0) {
    return <p className="text-muted-foreground">No subscriptions yet.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map(sub => (
        <Card key={sub.id} className="relative">
          <img
            src={getServiceIconUrl(sub.name)}
            alt={`${sub.name} logo`}
            loading="lazy"
            className="absolute -top-4 -left-4 w-8 h-8 rounded-md bg-white shadow"
          />
          <CardHeader>
            <CardTitle>{sub.name}</CardTitle>
            <CardDescription>
              Next billing: {format(sub.nextBillingDate, 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {sub.currency ? sub.currency + ' ' : '$'}
              {sub.price.toFixed(2)}
              <span className="text-sm text-muted-foreground">
                /{sub.billingCycle}
              </span>
            </p>
            <div className="absolute top-2 right-2 flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sub)}
                  type="button"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(sub.id)}
                  type="button"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
