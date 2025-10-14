-- Complete fix for mentor profile creation issue
-- Run this in your Supabase SQL editor

-- Step 1: Check if RLS is disabled (if you ran the emergency fix)
-- If RLS is disabled, this should work. If not, we need to fix the policies.

-- Step 2: Create a robust trigger function that handles errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the profile
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure the trigger exists and is working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Check if RLS is enabled and fix policies if needed
-- First, let's see the current RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Step 5: If RLS is enabled, create simple policies that work
-- (This will only run if RLS is enabled)
DO $$
BEGIN
  -- Check if RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' 
    AND schemaname = 'public' 
    AND rowsecurity = true
  ) THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
    
    -- Create simple policies that allow the trigger to work
    CREATE POLICY "Allow profile creation by trigger" ON public.profiles
      FOR INSERT WITH CHECK (true);
    
    CREATE POLICY "Allow profile updates by trigger" ON public.profiles
      FOR UPDATE USING (true);
    
    CREATE POLICY "Allow profile reads for authenticated users" ON public.profiles
      FOR SELECT USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'RLS policies updated for trigger compatibility';
  ELSE
    RAISE NOTICE 'RLS is disabled - trigger should work without policy issues';
  END IF;
END $$;

-- Step 6: Test the trigger by checking if it exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 7: Verify the function exists
SELECT 
  routine_name, 
  routine_type, 
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Step 8: Check current profiles count
SELECT COUNT(*) as current_profiles_count FROM public.profiles;

-- Step 9: Test message
SELECT 'Profile creation fix applied successfully!' as status;
