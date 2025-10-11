-- Create enum types
CREATE TYPE public.scan_type AS ENUM ('username', 'personal_details', 'both');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.removal_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'family');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'free',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scan_type scan_type NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  privacy_score INTEGER CHECK (privacy_score >= 0 AND privacy_score <= 100),
  total_sources_found INTEGER DEFAULT 0,
  high_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  low_risk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create data_sources table (data brokers found)
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  risk_level risk_level NOT NULL,
  data_found TEXT[] NOT NULL DEFAULT '{}',
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checked TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create social_profiles table
CREATE TABLE public.social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  found BOOLEAN NOT NULL DEFAULT true,
  followers TEXT,
  last_active TEXT,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create removal_requests table
CREATE TABLE public.removal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('data_broker', 'social_media')),
  source_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  status removal_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Create scan_comparisons table for before/after tracking
CREATE TABLE public.scan_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  latest_scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  improvement_percentage INTEGER,
  sources_removed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.removal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for scans
CREATE POLICY "Users can view own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON public.scans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for data_sources
CREATE POLICY "Users can view data sources from own scans"
  ON public.data_sources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = data_sources.scan_id
    AND scans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert data sources for own scans"
  ON public.data_sources FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_id
    AND scans.user_id = auth.uid()
  ));

-- RLS Policies for social_profiles
CREATE POLICY "Users can view social profiles from own scans"
  ON public.social_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = social_profiles.scan_id
    AND scans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert social profiles for own scans"
  ON public.social_profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_id
    AND scans.user_id = auth.uid()
  ));

-- RLS Policies for removal_requests
CREATE POLICY "Users can view own removal requests"
  ON public.removal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own removal requests"
  ON public.removal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own removal requests"
  ON public.removal_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for scan_comparisons
CREATE POLICY "Users can view own scan comparisons"
  ON public.scan_comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan comparisons"
  ON public.scan_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role, subscription_tier)
  VALUES (NEW.id, 'free', 'free');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX idx_data_sources_scan_id ON public.data_sources(scan_id);
CREATE INDEX idx_social_profiles_scan_id ON public.social_profiles(scan_id);
CREATE INDEX idx_removal_requests_user_id ON public.removal_requests(user_id);
CREATE INDEX idx_removal_requests_status ON public.removal_requests(status);
CREATE INDEX idx_scan_comparisons_user_id ON public.scan_comparisons(user_id);