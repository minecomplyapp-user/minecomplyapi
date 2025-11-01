-- Profiles RLS, triggers, and auth.users sync
-- Run this in Supabase SQL editor. Safe to run multiple times.

-- Ensure table exists (restore script may already have created it)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  first_name text,
  last_name text,
  full_name text,
  position text,
  mailing_address text,
  telephone text,
  phone_number text,
  fax text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant basic privileges (RLS still applies)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles are viewable by owner'
  ) THEN
    CREATE POLICY "Profiles are viewable by owner"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END$$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row whenever a user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    mailing_address,
    phone_number,
    telephone,
    fax,
    position,
    verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'first_name',''),
    NULLIF(NEW.raw_user_meta_data->>'last_name',''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'mailing_address',''),
    NULLIF(NEW.raw_user_meta_data->>'phone_number',''),
    NULLIF(NEW.raw_user_meta_data->>'telephone',''),
    NULLIF(NEW.raw_user_meta_data->>'fax',''),
    NULLIF(NEW.raw_user_meta_data->>'position',''),
    (NEW.email_confirmed_at IS NOT NULL),
    now(),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
