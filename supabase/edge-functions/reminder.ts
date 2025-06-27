// @ts-nocheck
// Supabase Edge Function: reminder
// Schedules: Set up via supabase dashboard: cron 0 9 * * * (09:00 UTC daily)
// Purpose: send payment reminder emails for subscriptions occurring in next 3 days

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables are automatically injected by Supabase when deployed
// For local testing via `supabase functions serve`, provide them in .env
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Admin client (service role) – required for RLS bypass & sending emails
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  next_payment_date: string;
  category?: string;
}

interface UserProfile {
  user_id: string;
  full_name?: string;
  email?: string;
}

interface ReminderPref {
  user_id: string;
  days_before: number;
  channel: 'email' | 'slack';
}

export const handler = async (_req: Request): Promise<Response> => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );

    // Get subscriptions due in next 3 days
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .gte('next_payment_date', today.toISOString().split('T')[0])
      .lte('next_payment_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Group subscriptions by user
    const grouped: Record<string, Subscription[]> = {};
    for (const sub of subscriptions) {
      if (!grouped[sub.user_id]) {
        grouped[sub.user_id] = [];
      }
      grouped[sub.user_id].push(sub);
    }

    // Get user profiles and reminder preferences
    const userIds = Object.keys(grouped);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);

    const { data: reminderPrefs, error: prefError } = await supabase
      .from('reminder_prefs')
      .select('user_id, days_before, channel')
      .in('user_id', userIds);

    if (profileError || prefError) {
      console.error('Failed to fetch user data:', { profileError, prefError });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send reminders
    let sentCount = 0;
    for (const [userId, userSubs] of Object.entries(grouped)) {
      const profile = profiles?.find((p: UserProfile) => p.user_id === userId);
      const prefs = reminderPrefs?.find(
        (r: ReminderPref) => r.user_id === userId
      );

      if (!profile || !prefs) continue;

      const totalAmount = userSubs.reduce((sum, sub) => sum + sub.price, 0);
      const currency = userSubs[0]?.currency || 'USD';

      // Send email reminder
      if (prefs.channel === 'email') {
        const { error: emailError } = await supabase.auth.admin.sendRawEmail({
          to: profile.email || '',
          subject: 'Payment Reminder - SubTrack',
          html: `
            <h2>Payment Reminder</h2>
            <p>Hello ${profile.full_name || 'there'},</p>
            <p>You have ${userSubs.length} subscription(s) due in the next ${prefs.days_before} days:</p>
            <ul>
              ${userSubs.map(sub => `<li>${sub.name}: ${sub.currency} ${sub.price}</li>`).join('')}
            </ul>
            <p><strong>Total: ${currency} ${totalAmount.toFixed(2)}</strong></p>
            <p>Visit your dashboard to manage your subscriptions.</p>
          `,
        });

        if (!emailError) {
          sentCount++;
        } else {
          console.error('Failed to send email to', profile.email, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} reminders`,
        total_subscriptions: subscriptions.length,
        sent_count: sentCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Reminder function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
