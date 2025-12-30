-- Add columns for guest comments, dislikes, and replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS dislikes_count INTEGER NOT NULL DEFAULT 0;

-- Create index for replies
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Update RLS to allow guest comments (no user_id required for guests)
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  (is_guest = true AND guest_name IS NOT NULL) OR 
  (is_guest = false AND auth.uid() = user_id)
);

-- Create comment_dislikes table
CREATE TABLE IF NOT EXISTS public.comment_dislikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID,
  guest_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_dislike UNIQUE (comment_id, user_id),
  CONSTRAINT unique_guest_dislike UNIQUE (comment_id, guest_id)
);

-- Enable RLS on comment_dislikes
ALTER TABLE public.comment_dislikes ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_dislikes
CREATE POLICY "Dislikes are viewable by everyone" 
ON public.comment_dislikes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can dislike comments" 
ON public.comment_dislikes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can remove their own dislikes" 
ON public.comment_dislikes 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND guest_id IS NOT NULL)
);

-- Update comment_likes to support guests
ALTER TABLE public.comment_likes 
ALTER COLUMN user_id DROP NOT NULL,
ADD COLUMN IF NOT EXISTS guest_id TEXT;

-- Drop old constraints and add new ones
ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_pkey;
ALTER TABLE public.comment_likes ADD PRIMARY KEY (id);
ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS unique_user_like;
ALTER TABLE public.comment_likes DROP CONSTRAINT IF EXISTS unique_guest_like;
ALTER TABLE public.comment_likes ADD CONSTRAINT unique_user_like UNIQUE (comment_id, user_id);
ALTER TABLE public.comment_likes ADD CONSTRAINT unique_guest_like UNIQUE (comment_id, guest_id);

-- Update RLS for comment_likes
DROP POLICY IF EXISTS "Authenticated users can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.comment_likes;

CREATE POLICY "Anyone can like comments" 
ON public.comment_likes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can remove their own likes" 
ON public.comment_likes 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND guest_id IS NOT NULL)
);

-- Update comments user_id to be nullable for guests
ALTER TABLE public.comments ALTER COLUMN user_id DROP NOT NULL;

-- Update trigger for dislikes count
CREATE OR REPLACE FUNCTION public.update_dislikes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for dislikes
DROP TRIGGER IF EXISTS update_dislikes_count_trigger ON public.comment_dislikes;
CREATE TRIGGER update_dislikes_count_trigger
AFTER INSERT OR DELETE ON public.comment_dislikes
FOR EACH ROW
EXECUTE FUNCTION public.update_dislikes_count();