-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Исправляет ссылку на Google Maps для лекции о "Франкенштейне" (Kulturhaus Milbertshofen).

update lectures
set venue_url = 'https://maps.app.goo.gl/hJ9k1WNb1YHRdC1m8'
where event_date = '2026-10-27';
