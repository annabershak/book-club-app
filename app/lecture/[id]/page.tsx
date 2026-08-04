'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LecturePage() {
  const params = useParams();
  const id = params.id as string;

  const [lecture, setLecture] = useState<any>(null);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/lecture-checkout?lecture_id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLecture(data.lecture);
        setSpotsLeft(data.spotsLeft);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please fill in your name, phone number and email');
      return;
    }
    const cleanedPhone = phone.trim().replace(/[\s-]/g, '');
    if (!/^\+\d{7,15}$/.test(cleanedPhone)) {
      setError('Please include your country code, e.g. +1 234 567 8900');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/lecture-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecture_id: id, name, phone, email }),
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

  if (!lecture) {
    return (
      <div className="container">
        <p className="empty">Loading...</p>
      </div>
    );
  }

  const full = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="container">
      <a href="/lectures" className="back-link">&larr; All lectures</a>
      <h1>{lecture.title}</h1>
      <div className="book-date" style={{ marginBottom: 16 }}>
        {formatDate(lecture.event_date)}
        {lecture.event_time && ` · ${lecture.event_time}`}
      </div>
      {lecture.description && <p className="book-desc" style={{ fontSize: 15, marginBottom: 16 }}>{lecture.description}</p>}
      <p className="fee-note">Venue to be announced — you'll get the details by email and in the WhatsApp group closer to the date.</p>

      {lecture.body && (
        <div className="lecture-body">
          {lecture.body.split('\n\n').map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      <p className={`spots ${full ? 'full' : ''}`} style={{ textAlign: 'left' }}>
        {full ? 'Full' : `${spotsLeft} / ${lecture.capacity} seats left`}
      </p>

      {full ? (
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Sorry, this lecture is fully booked.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label>Phone number (the one linked to your WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Redirecting to payment...' : `Reserve a seat — ${(lecture.price_cents / 100).toFixed(2)} €`}
          </button>
          <p className="fee-note">
            We ask for a small deposit to make sure everyone who signs up actually shows up.
          </p>
          <p className="fee-note">
            Once you've reserved your seat, you'll get a confirmation email with all the details — thanks for joining us!
          </p>
        </form>
      )}
    </div>
  );
}
