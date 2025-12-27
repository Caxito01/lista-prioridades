-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  CONSTRAINT users_id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

-- 2. Create trigger to auto-create user record when new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Copy existing users from auth.users to public.users
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy - users can only see their own record
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 6. Create RLS policy - users can update their own record
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the data was copied
SELECT COUNT(*) as total_users, COUNT(DISTINCT id) as unique_ids 
FROM public.users;