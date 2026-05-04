import { type NextRequest } from 'next/server';
import Stripe from 'stripe';

import { getSupabase } from '@/lib/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : null;

    if (!userId || !credits) {
      console.error('Webhook missing metadata:', session.metadata);
      return new Response('Missing metadata', { status: 400 });
    }

    // Atomic increment via RPC — avoids read-modify-write race
    const { error: rpcError } = await getSupabase().rpc('add_credits', {
      p_user_id: userId,
      p_amount: credits,
    });

    if (rpcError) {
      console.error('Failed to add credits:', rpcError);
      return new Response('DB update failed', { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
