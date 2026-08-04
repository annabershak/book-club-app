-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Добавляет спикера к уже созданной лекции о Достоевском.
-- Требует, чтобы supabase-lectures-add-fields.sql (колонка speaker) уже был выполнен.

update lectures
set speaker = $$The evening will be led by Catherine, a speaker, journalist, and self-described biggest book lover you'll meet!$$
where title = 'Crime, Punishment, and Everything in Between: Lecture on Dostoevsky';
