// @ts-nocheck
// Supabase Edge Function: slackDigest
// Schedules: Set up via supabase dashboard: cron 0 9 * * * (09:00 UTC daily)
// Purpose: send daily digest of upcoming payments to Slack

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  next_billing_date: string;
  category?: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
}

interface ReminderPref {
  user_id: string;
  days_before: number;
  channel: 'email' | 'slack';
  slack_webhook_url?: string;
}

export const handler = async (_req: Request): Promise<Response> => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(
      today.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    // Get subscriptions due in next 7 days
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .gte('next_billing_date', today.toISOString().split('T')[0])
      .lte('next_billing_date', sevenDaysFromNow.toISOString().split('T')[0]);

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
      return new Response(
        JSON.stringify({ message: 'No upcoming payments to report' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
      .select('user_id, days_before, channel, slack_webhook_url')
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

    // Send Slack digests
    let sentCount = 0;
    for (const [userId, userSubs] of Object.entries(grouped)) {
      const profile = profiles?.find((p: UserProfile) => p.user_id === userId);
      const prefs = reminderPrefs?.find(
        (r: ReminderPref) => r.user_id === userId
      );

      if (
        !profile ||
        !prefs ||
        prefs.channel !== 'slack' ||
        !prefs.slack_webhook_url
      )
        continue;

      const totalAmount = userSubs.reduce((sum, sub) => sum + sub.price, 0);
      const currency = userSubs[0]?.currency || 'USD';

      // Group by date
      const byDate: Record<string, Subscription[]> = {};
      for (const sub of userSubs) {
        const date = sub.next_billing_date;
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(sub);
      }

      // Create Slack message
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📅 SubTrack Daily Digest',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello ${profile.full_name || 'there'}! Here are your upcoming payments:`,
          },
        },
        {
          type: 'divider',
        },
      ];

      // Add payments grouped by date
      const sortedDates = Object.keys(byDate).sort();
      for (const date of sortedDates) {
        const subs = byDate[date];
        const dateTotal = subs.reduce((sum, sub) => sum + sub.price, 0);
        const dateStr = new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${dateStr}* (${currency} ${dateTotal.toFixed(2)})`,
          },
        });

        for (const sub of subs) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `• ${sub.name} - ${currency} ${sub.price.toFixed(2)}${sub.category ? ` (${sub.category})` : ''}`,
            },
          });
        }

        blocks.push({ type: 'divider' });
      }

      // Add summary
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Total upcoming: ${currency} ${totalAmount.toFixed(2)}* across ${userSubs.length} subscription(s)`,
        },
      });

      // Add action button
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Dashboard',
              emoji: true,
            },
            url: `${Deno.env.get('SITE_URL')}/dashboard`,
            style: 'primary',
          },
        ],
      });

      // Send to Slack
      try {
        const response = await fetch(prefs.slack_webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocks: blocks,
          }),
        });

        if (response.ok) {
          sentCount++;
          console.log(`Sent Slack digest to ${profile.email}`);
        } else {
          console.error(
            `Failed to send Slack message to ${profile.email}:`,
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          `Error sending Slack message to ${profile.email}:`,
          error
        );
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} Slack digests`,
        total_subscriptions: subscriptions.length,
        sent_count: sentCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Slack digest function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

Deno.serve(handler);
