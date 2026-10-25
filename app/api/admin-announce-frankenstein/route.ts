import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendFrankensteinAnnouncementEmail } from '@/lib/mailer';

// One-off: sends the venue/time announcement to everyone who paid for
// the Oct 27, 2026 Halloween lecture (Frankenstein). Safe to remove after use.
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { data: lecture, error: lectureError } = await supabaseAdmin
    .from('lectures')
    .select('*')
    .eq('event_date', '2026-10-27')
    .single();

  if (lectureError || !lecture) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  const { data: registrations, error: regError } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .eq('lecture_id', lecture.id)
    .eq('status', 'paid');

  if (regError) {
    return NextResponse.json({ error: 'Could not load registrations' }, { status: 500 });
  }

  const details = {
    date: 'October 27, 2026',
    time: '19:00',
    venue: 'Kulturhaus Milbertshofen',
    address: 'Curt-Mezger-Platz 1, 80809 München',
    room: '3.11 Martina-Badhorn',
    mapUrl: 'https://maps.app.goo.gl/hJ9k1WNb1YHRdC1m8',
  };

  let sent = 0;
  const failed: string[] = [];

  for (const registration of registrations || []) {
    try {
      await sendFrankensteinAnnouncementEmail(registration, lecture, details);
      sent++;
    } catch (err) {
      failed.push(registration.email);
    }
  }

  return NextResponse.json({ sent, failed });
}
