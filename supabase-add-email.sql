-- Run this once in Supabase SQL Editor to add the email field
-- needed for booking confirmation emails.

alter table registrations add column if not exists email text;
