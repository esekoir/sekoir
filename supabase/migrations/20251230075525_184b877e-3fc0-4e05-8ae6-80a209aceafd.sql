-- Update handle_new_user function to include username and wilaya
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, wilaya, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'wilaya',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;