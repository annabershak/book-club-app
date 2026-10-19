import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendDemianAnnouncementEmail } from '@/lib/mailer';

// One-off: sends the venue/time announcement to everyone who paid for
// the Oct 24, 2026 book club meetup (Demian). Safe to remove after use.
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('event_date', '2026-10-24')
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
    date: 'October 24, 2026',
    time: '13:00',
    venue: 'Story Café',
    address: 'Augustenstraße 29, 80333 München-Maxvorstadt',
    mapUrl: 'https://maps.app.goo.gl/wUEusJtBJ5cvFWxq8',
  };

  let sent = 0;
  const failed: string[] = [];

  for (const registration of registrations || []) {
    try {
      await sendDemianAnnouncementEmail(registration, book, details);
      sent++;
    } catch (err) {
      failed.push(registration.email);
    }
  }

  return NextResponse.json({ sent, failed });
}
