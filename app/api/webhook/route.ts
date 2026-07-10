import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendConfirmationEmail } from '@/lib/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registration_id;
    if (registrationId) {
      const { data: registration } = await supabaseAdmin
        .from('registrations')
        .update({ status: 'paid' })
        .eq('id', registrationId)
        .select()
        .single();

      if (registration) {
        const { data: book } = await supabaseAdmin
          .from('books')
          .select('title, event_date, description')
          .eq('id', registration.book_id)
          .single();

        if (book) {
          try {
            await sendConfirmationEmail(registration, book);
          } catch (err) {
            console.error('Failed to send confirmation email', err);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
