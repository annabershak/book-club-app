-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Добавляет 4 новые книги: октябрь-декабрь 2026.
-- Вместимость и цена взяты по умолчанию как у уже существующих встреч
-- (10 мест, 5 €) — поменяй ниже, если нужно другое.

insert into books (title, event_date, description, cover_url, capacity, price_cents) values
  (
    'Yesteryear',
    '2026-10-03',
    'A trad-wife influencer wakes up in 1855 and has to figure out if it''s a hoax, a reality show, or something far stranger. By Caro Claire Burke.',
    'https://covers.openlibrary.org/b/id/15234864-L.jpg',
    10,
    500
  ),
  (
    'Demian',
    '2026-10-24',
    'A boy''s coming-of-age is upended by a mysterious new friend who pulls him toward a darker, truer sense of self. By Hermann Hesse.',
    'https://covers.openlibrary.org/b/id/12569297-L.jpg',
    10,
    500
  ),
  (
    'The Year of Magical Thinking',
    '2026-11-14',
    'A memoir of the year after her husband''s sudden death, and the strange logic grief imposes on the mind. By Joan Didion.',
    'https://covers.openlibrary.org/b/id/13693-L.jpg',
    10,
    500
  ),
  (
    'Simple Passion / Happening',
    '2026-12-05',
    'Two spare, unflinching accounts of desire and an illegal abortion in 1960s France, from the Nobel laureate. By Annie Ernaux. Both novellas are short, so we''re reading them together for this one meetup.',
    'https://covers.openlibrary.org/b/id/8332450-L.jpg',
    10,
    500
  );
