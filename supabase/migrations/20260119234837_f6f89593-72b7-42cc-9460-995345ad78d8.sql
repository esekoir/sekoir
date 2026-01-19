-- Create marketplace_listings table for buy/sell posts
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  currency_code TEXT NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  price_per_unit DECIMAL(18, 2) NOT NULL,
  total_price DECIMAL(18, 2) GENERATED ALWAYS AS (amount * price_per_unit) STORED,
  description TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT true,
  wilaya TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_listings
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create marketplace_comments table for post comments
CREATE TABLE IF NOT EXISTS public.marketplace_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT,
  is_guest BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_comments ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_comments
CREATE POLICY "Anyone can view comments" ON public.marketplace_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create comments" ON public.marketplace_comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own comments" ON public.marketplace_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();