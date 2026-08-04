import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSpotsLeft(lectureId: string, capacity: number) {
  const { count } = await supabaseAdmin
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('lecture_id', lectureId)
    .eq('status', 'paid');
  return capacity - (count || 0);
}

// GET /api/lecture-checkout?lecture_id=... -> данные лекции + сколько мест осталось
export async function GET(req: NextRequest) {
  const lectureId = req.nextUrl.searchParams.get('lecture_id');
  if (!lectureId) return NextResponse.json({ error: 'lecture_id is required' }, { status: 400 });

  const { data: lecture, error } = await supabaseAdmin
    .from('lectures')
    .select('*')
    .eq('id', lectureId)
    .single();

  if (error || !lecture) return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });

  const spotsLeft = await getSpotsLeft(lectureId, lecture.capacity);
  return NextResponse.json({ lecture, spotsLeft });
}

// POST /api/lecture-checkout -> создаёт pending-регистрацию и Stripe checkout сессию
export async function POST(req: NextRequest) {
  const { lecture_id, name, phone, email } = await req.json();

  if (!lecture_id || !name || !phone || !email) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const { data: lecture, error: lectureError } = await supabaseAdmin
    .from('lectures')
    .select('*')
    .eq('id', lecture_id)
    .single();

  if (lectureError || !lecture) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  const spotsLeft = await getSpotsLeft(lecture_id, lecture.capacity);
  if (spotsLeft <= 0) {
    return NextResponse.json({ error: 'No seats left' }, { status: 400 });
  }

  // Создаём "ожидающую оплаты" запись
  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .insert({ lecture_id, name, phone, email, status: 'pending' })
    .select()
    .single();

  if (regError || !registration) {
    return NextResponse.json({ error: 'Could not create registration' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: lecture.price_cents,
          product_data: { name: `notfrommunich bookclub — ${lecture.title}` },
        },
        quantity: 1,
      },
    ],
    metadata: { registration_id: registration.id },
    success_url: `${siteUrl}/lecture/${lecture_id}?success=1`,
    cancel_url: `${siteUrl}/lecture/${lecture_id}?canceled=1`,
  });

  // Сохраняем id сессии, чтобы потом сопоставить в вебхуке
  await supabaseAdmin
    .from('registrations')
    .update({ stripe_session_id: session.id })
    .eq('id', registration.id);

  return NextResponse.json({ url: session.url });
}
