-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run

create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text,
  cover_url text,
  capacity int not null default 10,
  price_cents int not null default 500, -- 5 евро = 500 центов
  created_at timestamptz default now()
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) not null,
  name text not null,
  phone text not null,
  email text not null,
  status text not null default 'pending', -- pending | paid
  stripe_session_id text,
  created_at timestamptz default now()
);

-- Включаем Row Level Security и даём анонимному ключу только читать книги
alter table books enable row level security;
alter table registrations enable row level security;

create policy "books are readable by everyone"
  on books for select
  using (true);

-- registrations не читаются напрямую с фронта (только через service role в API),
-- поэтому политик на select не даём анонимному ключу.

-- Sample meetups (edit dates/titles as needed)
insert into books (title, event_date, description, capacity, price_cents, cover_url) values
  ('Drive Your Plow Over the Bones of the Dead', '2026-07-26', 'Novel by Olga Tokarczuk', 10, 500, 'https://covers.openlibrary.org/b/id/8742783-L.jpg'),
  ('White Nights', '2026-08-22', 'Novel by Fyodor Dostoevsky', 10, 500, 'https://covers.openlibrary.org/b/id/14598226-L.jpg'),
  ('Memoirs of a Geisha', '2026-09-12', 'Novel by Arthur Golden', 10, 500, 'https://covers.openlibrary.org/b/id/8231782-L.jpg');
