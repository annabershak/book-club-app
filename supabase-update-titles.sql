-- Run this once in Supabase SQL Editor to translate existing book rows to English.
-- Matches by event_date, so it works regardless of the current (Russian) title text.

update books set
  title = 'Drive Your Plow Over the Bones of the Dead',
  description = 'Novel by Olga Tokarczuk'
where event_date = '2026-07-26';

update books set
  title = 'White Nights',
  description = 'Novel by Fyodor Dostoevsky'
where event_date = '2026-08-22';

update books set
  title = 'Memoirs of a Geisha',
  description = 'Novel by Arthur Golden'
where event_date = '2026-09-12';

-- Verify:
select title, event_date, description from books order by event_date;
