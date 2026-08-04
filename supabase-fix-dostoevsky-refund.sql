-- Шаг 1: найди свою тестовую регистрацию на лекцию о Достоевском
select id, name, email, status, created_at
from registrations
where lecture_id = (
  select id from lectures
  where title = 'Crime, Punishment, and Everything in Between: Lecture on Dostoevsky'
)
order by created_at desc;

-- Шаг 2: скопируй запрос ниже в новый query в Supabase SQL Editor и нажми Run.

update registrations
set status = 'refunded'
where id = '15d189a8-ee44-44b2-9f92-22f212bbca3a';
