'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default function BookPage() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<any>(null);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/checkout?book_id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBook(data.book);
        setSpotsLeft(data.spotsLeft);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Заполни имя и телефон');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: id, name, phone }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // редирект на оплату Stripe
      } else {
        setError(data.error || 'Что-то пошло не так, попробуй ещё раз');
        setLoading(false);
      }
    } catch (err) {
      setError('Ошибка сети, попробуй ещё раз');
      setLoading(false);
    }
  }

  if (!book) {
    return (
      <div className="container">
        <p>Загрузка...</p>
      </div>
    );
  }

  const full = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="container">
      <a href="/" className="back-link">&larr; Ко всем встречам</a>
      <h1>{book.title}</h1>
      <div className="book-date">{formatDate(book.event_date)}</div>
      {book.description && <p className="book-desc">{book.description}</p>}
      <p className={`spots ${full ? 'full' : ''}`}>
        {full ? 'Мест нет' : `Осталось мест: ${spotsLeft} из ${book.capacity}`}
      </p>

      {full ? (
        <p>К сожалению, места на эту встречу закончились.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут" />
          </div>
          <div>
            <label>Номер телефона (привязанный к Instagram)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 ..." />
          </div>
          {error && <p style={{ color: '#b23b3b', fontSize: 14 }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Переход к оплате...' : `Записаться и оплатить ${(book.price_cents / 100).toFixed(2)} €`}
          </button>
        </form>
      )}
    </div>
  );
}
