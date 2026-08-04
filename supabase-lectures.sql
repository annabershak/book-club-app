-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Добавляет отдельный раздел "Лекции" со своим списком и записью.

create table lectures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time text, -- e.g. '18:00', shown next to the date
  description text, -- short subtitle shown in the list and under the title
  speaker text, -- who's leading the lecture, shown highlighted on the page
  body text, -- long-form write-up shown on the lecture page
  cover_url text,
  capacity int not null default 10,
  price_cents int not null default 500,
  created_at timestamptz default now()
);

alter table lectures enable row level security;

create policy "lectures are readable by everyone"
  on lectures for select
  using (true);

-- Регистрации на лекции используют ту же таблицу registrations,
-- что и книжный клуб, но со своим lecture_id.
alter table registrations add column lecture_id uuid references lectures(id);
alter table registrations alter column book_id drop not null;

alter table registrations add constraint registrations_one_event_check
  check (
    (book_id is not null and lecture_id is null) or
    (book_id is null and lecture_id is not null)
  );

