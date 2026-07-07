import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { data: books } = await supabaseAdmin
    .from('books')
    .select('*')
    .order('event_date', { ascending: true });

  const { data: registrations } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ books, registrations });
}
