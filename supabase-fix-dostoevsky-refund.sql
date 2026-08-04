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
where id = 'e6ab4069-0f10-4fac-8f5b-0760dce12e8e';
