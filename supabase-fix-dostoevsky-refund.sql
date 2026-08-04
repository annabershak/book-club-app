-- Шаг 1: найди свою тестовую регистрацию на лекцию о Достоевском
select id, name, email, status, created_at
from registrations
where lecture_id = (
  select id from lectures
  where title = 'Crime, Punishment, and Everything in Between: Lecture on Dostoevsky'
)
order by created_at desc;

-- Шаг 2: скопируй id нужной строки из результата выше и вставь его сюда,
-- затем выполни отдельно (или раскомментируй и замени PASTE_ID_HERE):

-- update registrations
-- set status = 'refunded'
-- where id = 'PASTE_ID_HERE';
