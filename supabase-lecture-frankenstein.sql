-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Добавляет хэллоуинскую лекцию о "Франкенштейне" (27 октября, 19:00).
-- Требует, чтобы supabase-lectures.sql (и, если нужно,
-- supabase-lectures-add-fields.sql) уже были выполнены.

-- Новые поля: место проведения и места, занятые вне сайта.
alter table lectures add column if not exists venue text; -- e.g. 'Kulturhaus Milbertshofen — Curt-Mezger-Platz 1, 80809 München'
alter table lectures add column if not exists venue_url text; -- Google Maps link
alter table lectures add column if not exists reserved_seats int not null default 0; -- seats taken outside the site

insert into lectures (title, event_date, event_time, description, speaker, body, venue, venue_url, capacity, reserved_seats, price_cents) values (
  '🎃 halloween special lecture: frankenstein — the monster, the myth & the Mary Shelley',
  '2026-10-27',
  '19:00',
  'what if this halloween, you stepped into the fascinating world of gothic literature?',
  $$🎙️ meet your speaker: Alla, a master's student in english studies, a teacher with six years of experience, and a short-story writer herself.$$,
  $$#2

join us for a special literary lecture exploring mary shelley's frankenstein — the story of a scientist who dares to create life, the creature he brings into the world, and the questions about humanity, loneliness, and monstrosity that make this classic so hauntingly relevant even today.

an evening of gothic literature, meaningful conversations, and thought-provoking discussions with fellow book lovers. 🖤$$,
  'Kulturhaus Milbertshofen — Curt-Mezger-Platz 1, 80809 München',
  'https://maps.app.goo.gl/aQmjVHAweovSqNjPA',
  20,
  3,
  1000
);
