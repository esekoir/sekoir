-- Create charge requests table for members to request balance charges
CREATE TABLE public.charge_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'ccp',
  payment_proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  user_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charge_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own charge requests"
ON public.charge_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create charge requests"
ON public.charge_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all charge requests"
ON public.charge_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all requests
CREATE POLICY "Admins can manage charge requests"
ON public.charge_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create verification plans table for admin to define plans
CREATE TABLE public.verification_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 6,
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active verification plans"
ON public.verification_plans
FOR SELECT
USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage verification plans"
ON public.verification_plans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create verification requests table for members to request verification
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.verification_plans(id),
  status TEXT NOT NULL DEFAULT 'pending',
  payment_proof TEXT,
  admin_note TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view their own verification requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create verification requests
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all verification requests
CREATE POLICY "Admins can manage verification requests"
ON public.verification_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default verification plans
INSERT INTO public.verification_plans (name_ar, name_en, duration_months, price, features, display_order) VALUES
('الباقة الأساسية - 6 أشهر', 'Basic Plan - 6 Months', 6, 1500, '["شارة التوثيق", "دعم فني متوسط", "أولوية في الظهور"]', 1),
('الباقة المميزة - سنة', 'Premium Plan - 1 Year', 12, 2500, '["شارة التوثيق الذهبية", "دعم فني أولوية", "أولوية قصوى في الظهور", "ميزات حصرية"]', 2);

-- Add trigger for updated_at
CREATE TRIGGER update_charge_requests_updated_at
BEFORE UPDATE ON public.charge_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_plans_updated_at
BEFORE UPDATE ON public.verification_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();