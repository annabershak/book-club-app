import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendConfirmationEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { registration_id } = await req.json();
  if (!registration_id) {
    return NextResponse.json({ error: 'registration_id is required' }, { status: 400 });
  }

  const { data: registration, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('id', registration_id)
    .single();

  if (regError || !registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('title, event_date, description')
    .eq('id', registration.book_id)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  try {
    await sendConfirmationEmail(registration, book);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to send email: ${err.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
