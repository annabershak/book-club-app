import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0; // всегда свежие данные о местах

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default async function HomePage() {
  const { data: books } = await supabase
    .from('books')
    .select('id, title, event_date, description, capacity')
    .order('event_date', { ascending: true });

  // Считаем оплаченные регистрации по каждой книге
  const booksWithSpots = await Promise.all(
    (books || []).map(async (book) => {
      const { count } = await supabase
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
      <h1>Книжный клуб</h1>
      <p className="subtitle">Ближайшие встречи — выбери книгу, чтобы записаться</p>

      {booksWithSpots.map((book) => {
        const full = book.spotsLeft <= 0;
        const low = book.spotsLeft > 0 && book.spotsLeft <= 3;
        return (
          <Link
            key={book.id}
            href={full ? '#' : `/book/${book.id}`}
            className={`card ${full ? 'disabled' : ''}`}
          >
            <div className="book-date">{formatDate(book.event_date)}</div>
            <div className="book-title">{book.title}</div>
            {book.description && <div className="book-desc">{book.description}</div>}
            <div className={`spots ${full ? 'full' : low ? 'low' : 'ok'}`}>
              {full ? 'Мест нет' : `Осталось мест: ${book.spotsLeft} из ${book.capacity}`}
            </div>
          </Link>
        );
      })}

      {booksWithSpots.length === 0 && <p>Пока нет запланированных встреч.</p>}
    </div>
  );
}
