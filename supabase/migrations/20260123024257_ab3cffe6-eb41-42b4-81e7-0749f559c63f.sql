-- Drop the overly permissive policies and create better ones
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;

-- Create proper notification insert policy (service role or triggers will create)
CREATE POLICY "Authenticated users can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create proper message insert policy
CREATE POLICY "Authenticated users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

-- Admins can view all notifications for admin dashboard
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all messages
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));