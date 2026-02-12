
-- 1. Create data_brokers reference table
CREATE TABLE public.data_brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  removal_url TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_brokers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read data brokers"
  ON public.data_brokers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_data_brokers_updated_at
  BEFORE UPDATE ON public.data_brokers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create user_identity_profiles table
CREATE TABLE public.user_identity_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_identity_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own identity profiles"
  ON public.user_identity_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_identity_profiles_updated_at
  BEFORE UPDATE ON public.user_identity_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add broker columns to existing removal_requests
ALTER TABLE public.removal_requests 
  ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES public.data_brokers(id),
  ADD COLUMN IF NOT EXISTS identity_profile_id UUID REFERENCES public.user_identity_profiles(id),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Seed common data brokers
INSERT INTO public.data_brokers (name, domain, removal_url, risk_level, category, description) VALUES
  ('Spokeo', 'spokeo.com', 'https://www.spokeo.com/optout', 'high', 'People Search', 'Aggregates public records, social media, and other sources'),
  ('BeenVerified', 'beenverified.com', 'https://www.beenverified.com/app/optout/search', 'high', 'People Search', 'Background check and people search service'),
  ('Whitepages', 'whitepages.com', 'https://www.whitepages.com/suppression-requests', 'high', 'People Search', 'Phone and address directory service'),
  ('Intelius', 'intelius.com', 'https://www.intelius.com/opt-out', 'high', 'People Search', 'People search and background check provider'),
  ('MyLife', 'mylife.com', 'https://www.mylife.com/ccpa/index.pubview', 'critical', 'Reputation', 'Reputation scoring and people search'),
  ('Radaris', 'radaris.com', 'https://radaris.com/page/how-to-remove', 'high', 'People Search', 'Public records aggregator'),
  ('TruePeopleSearch', 'truepeoplesearch.com', 'https://www.truepeoplesearch.com/removal', 'medium', 'People Search', 'Free people search engine'),
  ('FastPeopleSearch', 'fastpeoplesearch.com', 'https://www.fastpeoplesearch.com/removal', 'medium', 'People Search', 'Free people search directory'),
  ('PeopleFinder', 'peoplefinder.com', 'https://www.peoplefinder.com/optout.php', 'medium', 'People Search', 'People search and public records'),
  ('USSearch', 'ussearch.com', 'https://www.ussearch.com/opt-out/submit/', 'medium', 'People Search', 'Background check and people search');
