import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import NavTabs from '../components/NavTabs';

export const revalidate = 0; // always fresh seat counts

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    .toUpperCase();
}

export default async function LecturesPage() {
  const { data: lectures } = await supabaseAdmin
    .from('lectures')
    .select('id, title, event_date, description, capacity, cover_url')
    .order('event_date', { ascending: true });

  // Count paid registrations for each lecture
  const lecturesWithSpots = await Promise.all(
    (lectures || []).map(async (lecture) => {
      const { count } = await supabaseAdmin
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('lecture_id', lecture.id)
        .eq('status', 'paid');
      const taken = count || 0;
      return { ...lecture, spotsLeft: lecture.capacity - taken };
    })
  );

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="wordmark">
          notfrommunich<span> bookclub</span>
        </a>
        <NavTabs />
      </header>

      <h1>Upcoming lectures</h1>
      <p className="subtitle">
        Short evening lectures, open to everyone. Pick one below to reserve your seat.
      </p>

      <div className="book-list">
        {lecturesWithSpots.map((lecture, i) => {
          const full = lecture.spotsLeft <= 0;
          const low = lecture.spotsLeft > 0 && lecture.spotsLeft <= 3;
          return (
            <Link
              key={lecture.id}
              href={full ? '#' : `/lecture/${lecture.id}`}
              className={`card ${full ? 'disabled' : ''}`}
            >
              <div className="book-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="book-cover">
                {lecture.cover_url && <img src={lecture.cover_url} alt="" />}
              </div>
              <div>
                <div className="book-date">{formatDate(lecture.event_date)}</div>
                <div className="book-title">{lecture.title}</div>
                {lecture.description && <div className="book-desc">{lecture.description}</div>}
              </div>
              <div className={`spots ${full ? 'full' : low ? 'low' : 'ok'}`}>
                {full ? 'Full' : `${lecture.spotsLeft} / ${lecture.capacity} left`}
              </div>
            </Link>
          );
        })}
      </div>

      {lecturesWithSpots.length === 0 && (
        <p className="empty">No lectures scheduled yet.</p>
      )}
    </div>
  );
}
