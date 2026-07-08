-- Run this once in Supabase SQL Editor to add cover images to the existing rows.
-- Covers sourced from Open Library (covers.openlibrary.org).

update books set cover_url = 'https://covers.openlibrary.org/b/id/8742783-L.jpg'
where event_date = '2026-07-26';

update books set cover_url = 'https://covers.openlibrary.org/b/id/14598226-L.jpg'
where event_date = '2026-08-22';

update books set cover_url = 'https://covers.openlibrary.org/b/id/8231782-L.jpg'
where event_date = '2026-09-12';

-- Verify:
select title, event_date, cover_url from books order by event_date;
