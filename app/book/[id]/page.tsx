'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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
      setError('Please fill in your name and phone number');
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
        window.location.href = data.url; // redirect to Stripe checkout
      } else {
        setError(data.error || 'Something went wrong, please try again');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error, please try again');
      setLoading(false);
    }
  }

  if (!book) {
    return (
      <div className="container">
        <p className="empty">Loading...</p>
      </div>
    );
  }

  const full = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="container">
      <a href="/" className="back-link">&larr; All meetups</a>
      <h1>{book.title}</h1>
      <div className="book-date" style={{ marginBottom: 16 }}>{formatDate(book.event_date)}</div>
      {book.description && <p className="book-desc" style={{ fontSize: 15, marginBottom: 16 }}>{book.description}</p>}
      <p className={`spots ${full ? 'full' : ''}`} style={{ textAlign: 'left' }}>
        {full ? 'Full' : `${spotsLeft} / ${book.capacity} seats left`}
      </p>

      {full ? (
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Sorry, this meetup is fully booked.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label>Phone number (the one linked to your Instagram)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 ..." />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Redirecting to payment...' : `Reserve a seat — ${(book.price_cents / 100).toFixed(2)} €`}
          </button>
        </form>
      )}
    </div>
  );
}
