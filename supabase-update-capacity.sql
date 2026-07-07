-- Run this once in Supabase SQL Editor to change capacity to 10 seats per meetup.

update books set capacity = 10
where event_date in ('2026-07-26', '2026-08-22', '2026-09-12');

-- Verify:
select title, event_date, capacity from books order by event_date;
