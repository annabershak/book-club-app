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

-- Пример добавления книг (замени даты/названия под себя)
insert into books (title, event_date, description, capacity, price_cents) values
  ('Ольга', '2026-07-26', 'Обсуждаем роман "Ольга"', 15, 500),
  ('Белые ночи', '2026-08-22', 'Достоевский, "Белые ночи"', 15, 500),
  ('Мемуары гейши', '2026-09-12', 'Артур Голден, "Мемуары гейши"', 15, 500);
