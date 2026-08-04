import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import NavTabs from './components/NavTabs';

export const revalidate = 0; // always fresh seat counts

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    .toUpperCase();
}

export default async function HomePage() {
  const { data: books } = await supabaseAdmin
    .from('books')
    .select('id, title, event_date, description, capacity, cover_url')
    .order('event_date', { ascending: true });

  // Count paid registrations for each book
  const booksWithSpots = await Promise.all(
    (books || []).map(async (book) => {
      const { count } = await supabaseAdmin
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('book_id', book.id)
        .eq('status', 'paid');
      const taken = count || 0;
      return { ...book, spotsLeft: book.capacity - taken };
    })
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = booksWithSpots.filter((b) => b.event_date >= todayStr);
  const past = booksWithSpots
    .filter((b) => b.event_date < todayStr)
    .reverse();

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="wordmark">
          notfrommunich
        </a>
        <NavTabs />
      </header>

      <h1>Upcoming events</h1>
      <p className="subtitle">
        a small, informal book club. pick a book below to reserve your seat.
      </p>

      <div className="book-list">
        {upcoming.map((book, i) => {
          const full = book.spotsLeft <= 0;
          const low = book.spotsLeft > 0 && book.spotsLeft <= 3;
          return (
            <Link key={book.id} href={`/book/${book.id}`} className="card">
              <div className="book-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="book-cover">
                {book.cover_url && <img src={book.cover_url} alt="" />}
              </div>
              <div>
                <div className="book-date">{formatDate(book.event_date)}</div>
                <div className="book-title">{book.title}</div>
                {book.description && <div className="book-desc">{book.description}</div>}
              </div>
              <div className={`spots ${full ? 'full' : low ? 'low' : 'ok'}`}>
                {full ? 'Full' : `${book.spotsLeft} / ${book.capacity} left`}
              </div>
            </Link>
          );
        })}
      </div>

      {upcoming.length === 0 && (
        <p className="empty">No meetups scheduled yet.</p>
      )}

      {past.length > 0 && (
        <>
          <h2>Past events</h2>
          <div className="past-grid">
            {past.map((book) => (
              <div key={book.id} className="past-card">
                <div className="past-cover">
                  {book.cover_url && <img src={book.cover_url} alt="" />}
                </div>
                <div className="past-title">{book.title}</div>
                <div className="past-date">{formatDate(book.event_date)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
