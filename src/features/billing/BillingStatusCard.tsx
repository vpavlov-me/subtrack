import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function BillingStatusCard() {
  const [status, setStatus] = useState<string>('loading');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status')
        .single();
      setStatus(data?.subscription_status || 'free');
    })();
  }, []);

  const color =
    status === 'active'
      ? 'text-emerald-600'
      : status === 'past_due'
        ? 'text-red-600'
        : 'text-zinc-600';
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription status</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-semibold ${color}`}>{status}</p>
        {status !== 'active' && (
          <Button asChild variant="link" size="sm">
            <a href="/settings/billing">Manage</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
