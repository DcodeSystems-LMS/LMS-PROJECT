-- Emergency fix: Temporarily disable RLS on profiles table
-- Run this in your Supabase SQL editor to fix the infinite recursion issue

-- Option 1: Temporarily disable RLS (quick fix)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, run this instead:
-- (Comment out the line above and uncomment the lines below)

/*
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- Create very simple policies
CREATE POLICY "Allow all authenticated users to read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update profiles" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to delete profiles" ON public.profiles
  FOR DELETE USING (auth.role() = 'authenticated');
*/

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
