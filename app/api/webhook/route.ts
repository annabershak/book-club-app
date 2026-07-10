import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function sendConfirmationEmail(registration: any, book: any) {
  const whatsappUrl = process.env.WHATSAPP_GROUP_URL;

  const html = `
    <p>Hi ${registration.name},</p>
    <p>You're confirmed for <strong>${book.title}</strong> on <strong>${formatDate(book.event_date)}</strong>.</p>
    ${book.description ? `<p>${book.description}</p>` : ''}
    <p>The exact meetup spot will be announced in the book club's WhatsApp group closer to the date.</p>
    ${whatsappUrl ? `<p><a href="${whatsappUrl}">Join the WhatsApp group</a></p>` : ''}
    <p>Any questions — just ask the admins in the group.</p>
    <p>See you soon!<br>notfrommunich bookclub</p>
  `;

  await mailer.sendMail({
    from: `"notfrommunich bookclub" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: `You're in — ${book.title}`,
    html,
  });
}

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
