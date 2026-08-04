-- Выполни этот скрипт ТОЛЬКО если ты уже запускала supabase-lectures.sql раньше
-- (до того, как в таблицу lectures добавили event_time и body).
-- Если ты ещё не запускала supabase-lectures.sql вообще — просто запусти
-- его обновлённую версию, этот файл не нужен.

alter table lectures add column if not exists event_time text;
alter table lectures add column if not exists body text;
alter table lectures add column if not exists speaker text;
