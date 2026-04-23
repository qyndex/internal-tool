-- Internal Tool — Initial Schema
-- Tables: profiles, records, activity_log

-- ============================================================
-- Profiles — auto-created on user signup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  role       text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Records — core data table with ownership
-- ============================================================
CREATE TABLE IF NOT EXISTS public.records (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  status     text NOT NULL DEFAULT 'active',
  category   text,
  value      numeric,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read all records
CREATE POLICY "Authenticated users can read all records"
  ON public.records FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own records
CREATE POLICY "Users can insert their own records"
  ON public.records FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own records; admins can update any
CREATE POLICY "Users can update own records or admins update any"
  ON public.records FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can delete their own records; admins can delete any
CREATE POLICY "Users can delete own records or admins delete any"
  ON public.records FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- Activity Log — audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text NOT NULL,
  record_id  uuid REFERENCES public.records(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all activity
CREATE POLICY "Authenticated users can read activity log"
  ON public.activity_log FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert activity entries
CREATE POLICY "Authenticated users can insert activity log"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Trigger: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: auto-update updated_at on records
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS records_updated_at ON public.records;
CREATE TRIGGER records_updated_at
  BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
