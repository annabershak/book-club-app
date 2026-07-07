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
        <h1>Вход в админку</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: '#b23b3b' }}>{error}</p>}
          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Админка</h1>

      <h2 style={{ fontSize: 18, marginTop: 30 }}>Места по встречам</h2>
      <table>
        <thead>
          <tr>
            <th>Книга</th>
            <th>Дата</th>
            <th>Занято / Всего</th>
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

      <h2 style={{ fontSize: 18, marginTop: 30 }}>Все записи</h2>
      <table>
        <thead>
          <tr>
            <th>Книга</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Статус</th>
            <th>Когда</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>{bookTitle(r.book_id)}</td>
              <td>{r.name}</td>
              <td>{r.phone}</td>
              <td>{r.status === 'paid' ? '✅ оплачено' : '⏳ ожидание'}</td>
              <td>{new Date(r.created_at).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
