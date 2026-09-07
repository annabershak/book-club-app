'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [resending, setResending] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<{ id: string; ok: boolean } | null>(null);
  const [announcingSeptember, setAnnouncingSeptember] = useState(false);
  const [announceSeptemberResult, setAnnounceSeptemberResult] = useState<{ sent: number; failed: string[] } | string | null>(null);

  async function loadData() {
    const res = await fetch('/api/admin-data');
    if (res.ok) {
      const data = await res.json();
      setBooks(data.books || []);
      setLectures(data.lectures || []);
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
      setError('Wrong password');
    }
  }

  function eventTitle(registration: any) {
    if (registration.lecture_id) {
      return lectures.find((l) => l.id === registration.lecture_id)?.title || '—';
    }
    return books.find((b) => b.id === registration.book_id)?.title || '—';
  }

  async function handleResend(registrationId: string) {
    setResending(registrationId);
    setResendResult(null);
    const res = await fetch('/api/admin-resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id: registrationId }),
    });
    setResending(null);
    setResendResult({ id: registrationId, ok: res.ok });
  }

  async function handleAnnounceSeptember() {
    setAnnouncingSeptember(true);
    setAnnounceSeptemberResult(null);
    const res = await fetch('/api/admin-announce-september', { method: 'POST' });
    const data = await res.json();
    setAnnouncingSeptember(false);
    setAnnounceSeptemberResult(res.ok ? data : data.error || 'Failed to send');
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

      <h2>One-off: Sept 12 meetup announcement</h2>
      <button type="button" disabled={announcingSeptember} onClick={handleAnnounceSeptember}>
        {announcingSeptember ? 'Sending...' : 'Send September meetup announcement'}
      </button>
      {announceSeptemberResult && (
        <p style={{ fontSize: 13, marginTop: 12 }}>
          {typeof announceSeptemberResult === 'string'
            ? announceSeptemberResult
            : `Sent: ${announceSeptemberResult.sent}${announceSeptemberResult.failed.length ? `, failed: ${announceSeptemberResult.failed.join(', ')}` : ''}`}
        </p>
      )}

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

      <h2>Seats per lecture</h2>
      <table>
        <thead>
          <tr>
            <th>Lecture</th>
            <th>Date</th>
            <th>Taken / Total</th>
          </tr>
        </thead>
        <tbody>
          {lectures.map((l) => {
            const paidCount = registrations.filter(
              (r) => r.lecture_id === l.id && r.status === 'paid'
            ).length;
            return (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.event_date}</td>
                <td>{paidCount} / {l.capacity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>All registrations</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Book / Lecture</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>When</th>
            <th>Email confirmation</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>{r.lecture_id ? 'Lecture' : 'Book'}</td>
              <td>{eventTitle(r)}</td>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.phone}</td>
              <td>{r.status === 'paid' ? '✅ paid' : '⏳ pending'}</td>
              <td>{new Date(r.created_at).toLocaleString('en-US')}</td>
              <td>
                {r.status === 'paid' && (
                  <button
                    type="button"
                    style={{ padding: '6px 10px', fontSize: 11 }}
                    disabled={resending === r.id}
                    onClick={() => handleResend(r.id)}
                  >
                    {resending === r.id ? 'Sending...' : 'Resend'}
                  </button>
                )}
                {resendResult?.id === r.id && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: resendResult.ok ? 'var(--ok)' : 'var(--danger)' }}>
                    {resendResult.ok ? 'Sent' : 'Failed'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
