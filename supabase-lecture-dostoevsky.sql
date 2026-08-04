-- Выполни этот скрипт в Supabase: SQL Editor -> New query -> вставить -> Run
-- Добавляет первую лекцию: "Crime, Punishment, and Everything in Between".
-- Требует, чтобы supabase-lectures.sql (и, если нужно,
-- supabase-lectures-add-fields.sql) уже были выполнены.

insert into lectures (title, event_date, event_time, description, body, capacity, price_cents) values (
  'Crime, Punishment, and Everything in Between: Lecture on Dostoevsky',
  '2026-08-11',
  '18:00',
  'An evening dedicated to Fyodor Dostoevsky: his remarkable life, the ideas behind his novels, and the questions that continue to make his work deeply relevant today.',
  $$#1

What would you write if every word had consequences?

One December morning in 1849, a young writer stood before a firing squad.

His crime? Reading, discussing, and questioning ideas the government considered dangerous.

Only moments before the order to fire, his sentence was revoked.

That writer was Fyodor Dostoevsky.

Everything that followed — years in a Siberian prison camp, government surveillance, impossible debts, compulsive gambling, profound faith, and extraordinary love — would shape some of the greatest novels ever written.

His books would influence everyone from Nietzsche and Freud to Kafka and Camus, asking questions that remain painfully relevant today:

What makes a good person?

Why are we drawn to suffering?

Can freedom exist without responsibility?

And why do governments fear ideas?

Join Lectures on Literature for an evening that begins with Dostoevsky but explores far more than one writer.

Together we'll examine power, censorship, love, redemption, and why novels written more than 150 years ago continue to explain the modern world with unsettling clarity.$$,
  10,
  1000
);
