import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSeptemberAnnouncementEmail } from '@/lib/mailer';

// One-off: sends the venue/time announcement to everyone who paid for
// the Sept 12, 2026 book club meetup. Safe to remove after use.
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('event_date', '2026-09-12')
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const { data: registrations, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('book_id', book.id)
    .eq('status', 'paid');

  if (regError) {
    return NextResponse.json({ error: 'Could not load registrations' }, { status: 500 });
  }

  const details = {
    date: 'September 12, 2026',
    time: '12:00',
    venue: 'Prächtig Tagesbar',
    address: 'Augustenstraße 37, 80333 München-Maxvorstadt',
    mapUrl: 'https://maps.app.goo.gl/C2Q4bemwZuCHs5Ng9?g_st=ic',
  };

  let sent = 0;
  const failed: string[] = [];

  for (const registration of registrations || []) {
    try {
      await sendSeptemberAnnouncementEmail(registration, book, details);
      sent++;
    } catch (err) {
      failed.push(registration.email);
    }
  }

  return NextResponse.json({ sent, failed });
}
