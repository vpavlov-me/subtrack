// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

export const handler = async (req: Request): Promise<Response> => {
  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_SECRET);
  } catch (err) {
    console.error('Webhook signature failed', err);
    return new Response('Signature error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.client_reference_id;

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      await supabase
        .from('profiles')
        .update({
          customer_id: session.customer,
          subscription_id: session.subscription,
          subscription_status: subscription.status,
          billing_status: subscription.status,
          seat_count: subscription.quantity ?? 1,
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null,
        })
        .eq('user_id', userId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as any;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('subscription_id', sub.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: sub.status,
            billing_status: sub.status,
            seat_count: sub.quantity ?? 1,
            current_period_end: new Date(sub.current_period_end * 1000),
            cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
          })
          .eq('user_id', profile.user_id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('subscription_id', sub.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            billing_status: 'free',
            seat_count: 1,
            current_period_end: null,
            cancel_at: null,
          })
          .eq('user_id', profile.user_id);
      }
      break;
    }

    default:
      console.log('Unhandled event', event.type);
  }

  return new Response('ok', { status: 200 });
};

Deno.serve(handler);
