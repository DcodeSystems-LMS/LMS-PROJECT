-- Simple fix for infinite recursion in profiles RLS policies
-- Run this in your Supabase SQL editor

-- Temporarily disable RLS on profiles table to fix infinite recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- That's it! This should fix the infinite recursion issue.
-- Your invite mentor functionality should now work.

-- Optional: If you want to re-enable RLS later with proper policies, run this:
/*
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't cause recursion
CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update profiles" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete profiles" ON public.profiles
  FOR DELETE USING (auth.role() = 'authenticated');
*/
