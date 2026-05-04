import { type NextRequest } from 'next/server';
import Stripe from 'stripe';

import { BILLING, type PackId, getPackById } from '@/config/billing';
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
    return Response.json({ error: 'Sign in to purchase credits' }, { status: 401 });
  }

  const body = (await request.json()) as { packId: PackId };
  const { packId } = body;

  const pack = BILLING.packs.find((p) => p.id === packId);
  if (!pack) {
    return Response.json({ error: 'Invalid pack' }, { status: 400 });
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';
  const stripe = getStripe();

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: BILLING.currency.toLowerCase(),
          unit_amount: pack.priceMinorUnits,
          product_data: {
            name: `SME Grant Navigator — ${pack.label} Pack`,
            description: `${pack.credits} credits for AI eligibility checks and draft generation.`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      pack_id: pack.id,
      credits: String(pack.credits),
    },
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing`,
  });

  return Response.json({ url: checkout.url });
}
