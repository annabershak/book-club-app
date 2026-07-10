import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

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

  return (
    <div className="container">
      <header className="site-header">
        <a href="/" className="wordmark">
          notfrommunich<span> bookclub</span>
        </a>
      </header>

      <h1>Upcoming meetups</h1>
      <p className="subtitle">
        A small, informal book club. Pick a book below to reserve your seat.
      </p>

      <div className="book-list">
        {booksWithSpots.map((book, i) => {
          const full = book.spotsLeft <= 0;
          const low = book.spotsLeft > 0 && book.spotsLeft <= 3;
          return (
            <Link
              key={book.id}
              href={full ? '#' : `/book/${book.id}`}
              className={`card ${full ? 'disabled' : ''}`}
            >
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

      {booksWithSpots.length === 0 && (
        <p className="empty">No meetups scheduled yet.</p>
      )}
    </div>
  );
}
