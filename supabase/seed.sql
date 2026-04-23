-- Seed data for Internal Tool template
-- Note: These inserts bypass RLS (run via supabase db seed or psql as superuser).
-- created_by is NULL because no auth.users exist in seed; the app will
-- create real records linked to logged-in users.

INSERT INTO public.records (title, status, category, value, created_at) VALUES
  ('Q1 Revenue Report',      'completed', 'finance',    15200,  '2024-01-15T10:00:00Z'),
  ('Employee Onboarding',    'active',    'hr',          3400,  '2024-02-03T09:30:00Z'),
  ('Server Migration',       'active',    'engineering', 8900,  '2024-02-20T14:00:00Z'),
  ('Marketing Campaign Q2',  'pending',   'marketing',  12500,  '2024-03-01T11:00:00Z'),
  ('Security Audit',         'completed', 'engineering',  6700,  '2024-03-10T08:45:00Z'),
  ('Budget Proposal 2025',   'pending',   'finance',    42000,  '2024-04-02T16:00:00Z'),
  ('Product Launch Alpha',   'active',    'product',    25000,  '2024-04-18T13:00:00Z'),
  ('Customer Support Bot',   'active',    'engineering',  9500,  '2024-05-05T10:15:00Z'),
  ('Office Renovation',      'completed', 'operations',  18000,  '2024-05-22T09:00:00Z'),
  ('Data Pipeline Upgrade',  'pending',   'engineering', 11200,  '2024-06-01T15:30:00Z'),
  ('Annual Review Process',  'active',    'hr',          2800,  '2024-06-15T12:00:00Z'),
  ('Brand Refresh',          'completed', 'marketing',   7600,  '2024-07-01T10:00:00Z');

INSERT INTO public.activity_log (action, created_at) VALUES
  ('Seeded initial records',            '2024-01-15T10:00:00Z'),
  ('Completed Q1 Revenue Report',       '2024-01-30T17:00:00Z'),
  ('Started Server Migration',          '2024-02-20T14:00:00Z'),
  ('Completed Security Audit',          '2024-03-25T16:00:00Z'),
  ('Launched Product Alpha',            '2024-04-18T13:00:00Z'),
  ('Completed Office Renovation',       '2024-05-30T09:00:00Z'),
  ('Completed Brand Refresh',           '2024-07-15T11:00:00Z'),
  ('Started Data Pipeline Upgrade',     '2024-06-01T15:30:00Z');
