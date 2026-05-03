import { type NextRequest } from 'next/server';
import Stripe from 'stripe';

import { createClient } from '@/lib/supabase/server';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Sign in to unlock the full draft' }, { status: 401 });
  }

  const body = (await request.json()) as { sessionId: string };
  const { sessionId } = body;

  if (!sessionId) {
    return Response.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const stripe = getStripe();

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 29900, // $299.00
          product_data: {
            name: 'Thunder — Full application draft',
            description: 'Unlock all sections of your AI-generated grant application draft.',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      thunder_session_id: sessionId,
      user_id: user.id,
    },
    success_url: `${origin}/chat/${sessionId}?paid=true`,
    cancel_url: `${origin}/chat/${sessionId}`,
  });

  return Response.json({ url: checkout.url });
}
