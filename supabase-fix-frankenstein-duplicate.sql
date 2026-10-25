-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Удаляет случайно созданный дубль лекции о "Франкенштейне" (27 октября).
-- Удаляется только та копия, на которую нет ни одной регистрации,
-- настоящая лекция с оплаченными местами остаётся.

-- 1) Сначала посмотри: должно быть две строки, у дубля registrations = 0.
select l.id, l.created_at, count(r.id) as registrations
from lectures l
left join registrations r on r.lecture_id = l.id
where l.event_date = '2026-10-27'
group by l.id, l.created_at
order by l.created_at;

-- 2) Удаление дубля.
delete from lectures l
where l.event_date = '2026-10-27'
  and not exists (select 1 from registrations r where r.lecture_id = l.id);
