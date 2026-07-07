'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  async function loadData() {
    const res = await fetch('/api/admin-data');
    if (res.ok) {
      const data = await res.json();
      setBooks(data.books || []);
      setRegistrations(data.registrations || []);
      setAuthed(true);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      loadData();
    } else {
      setError('Неверный пароль');
    }
  }

  function bookTitle(bookId: string) {
    return books.find((b) => b.id === bookId)?.title || '—';
  }

  if (!authed) {
    return (
      <div className="container">
        <h1>Admin login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button type="submit">Log in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Admin</h1>

      <h2>Seats per meetup</h2>
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Date</th>
            <th>Taken / Total</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => {
            const paidCount = registrations.filter(
              (r) => r.book_id === b.id && r.status === 'paid'
            ).length;
            return (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.event_date}</td>
                <td>{paidCount} / {b.capacity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>All registrations</h2>
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>{bookTitle(r.book_id)}</td>
              <td>{r.name}</td>
              <td>{r.phone}</td>
              <td>{r.status === 'paid' ? '✅ paid' : '⏳ pending'}</td>
              <td>{new Date(r.created_at).toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
