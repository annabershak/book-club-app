import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSpotsLeft(bookId: string, capacity: number) {
  const { count } = await supabaseAdmin
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', bookId)
    .eq('status', 'paid');
  return capacity - (count || 0);
}

// GET /api/checkout?book_id=... -> данные книги + сколько мест осталось
export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get('book_id');
  if (!bookId) return NextResponse.json({ error: 'book_id is required' }, { status: 400 });

  const { data: book, error } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error || !book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

  const spotsLeft = await getSpotsLeft(bookId, book.capacity);
  return NextResponse.json({ book, spotsLeft });
}

// POST /api/checkout -> создаёт pending-регистрацию и Stripe checkout сессию
export async function POST(req: NextRequest) {
  const { book_id, name, phone } = await req.json();

  if (!book_id || !name || !phone) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('id', book_id)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const spotsLeft = await getSpotsLeft(book_id, book.capacity);
  if (spotsLeft <= 0) {
    return NextResponse.json({ error: 'No seats left' }, { status: 400 });
  }

  // Создаём "ожидающую оплаты" запись
  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .insert({ book_id, name, phone, status: 'pending' })
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
          unit_amount: book.price_cents,
          product_data: { name: `notfrommunich bookclub — ${book.title}` },
        },
        quantity: 1,
      },
    ],
    metadata: { registration_id: registration.id },
    success_url: `${siteUrl}/book/${book_id}?success=1`,
    cancel_url: `${siteUrl}/book/${book_id}?canceled=1`,
  });

  // Сохраняем id сессии, чтобы потом сопоставить в вебхуке
  await supabaseAdmin
    .from('registrations')
    .update({ stripe_session_id: session.id })
    .eq('id', registration.id);

  return NextResponse.json({ url: session.url });
}
