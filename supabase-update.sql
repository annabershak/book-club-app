-- Run this once in Supabase SQL Editor to bring existing rows up to date
-- with the current site: 10 seats per meetup + cover images.
-- (Titles/descriptions were already fixed separately and don't need re-running.)

update books set capacity = 10
where event_date in ('2026-07-26', '2026-08-22', '2026-09-12');

update books set cover_url = 'https://covers.openlibrary.org/b/id/8742783-L.jpg'
where event_date = '2026-07-26';

update books set cover_url = 'https://covers.openlibrary.org/b/id/14598226-L.jpg'
where event_date = '2026-08-22';

update books set cover_url = 'https://covers.openlibrary.org/b/id/8231782-L.jpg'
where event_date = '2026-09-12';

-- Verify:
select title, event_date, capacity, cover_url from books order by event_date;
