import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendAnnouncementEmail } from '@/lib/mailer';

// One-off: sends the venue announcement to everyone who paid for the
// Dostoevsky lecture. Safe to remove after use.
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { data: lecture, error: lectureError } = await supabaseAdmin
    .from('lectures')
    .select('*')
    .eq('title', 'Crime, Punishment, and Everything in Between: Lecture on Dostoevsky')
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
    date: 'August 11, 2026',
    time: '18:00',
    venue: 'Botanista Café Club',
    mapUrl: 'https://maps.app.goo.gl/LdhuYU3cZCccdqdMA',
  };

  let sent = 0;
  const failed: string[] = [];

  for (const registration of registrations || []) {
    try {
      await sendAnnouncementEmail(registration, lecture, details);
      sent++;
    } catch (err) {
      failed.push(registration.email);
    }
  }

  return NextResponse.json({ sent, failed });
}
