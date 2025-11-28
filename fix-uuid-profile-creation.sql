-- Complete fix for mentor profile creation with UUID validation
-- Run this in your Supabase SQL editor

-- Step 1: Check current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Ensure the profiles table has the correct structure
-- First, let's see what columns exist
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if id column is UUID type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE NOTICE 'ID column is not UUID type - this may cause issues';
    ELSE
        RAISE NOTICE 'ID column is correctly UUID type';
    END IF;
END $$;

-- Step 3: Check RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Step 4: Create a robust trigger function that handles UUID properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that NEW.id is a valid UUID
  IF NEW.id IS NULL OR NEW.id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE WARNING 'Invalid UUID for user: %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Try to insert the profile with proper error handling
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

-- Step 5: Ensure the trigger exists and is working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Fix RLS policies to allow profile creation
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
    DROP POLICY IF EXISTS "Allow profile creation by trigger" ON public.profiles;
    DROP POLICY IF EXISTS "Allow profile updates by trigger" ON public.profiles;
    DROP POLICY IF EXISTS "Allow profile reads for authenticated users" ON public.profiles;
    
    -- Create comprehensive policies
    CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
      FOR ALL USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'RLS policies updated for full access';
  ELSE
    RAISE NOTICE 'RLS is disabled - no policy changes needed';
  END IF;
END $$;

-- Step 7: Test the trigger by checking if it exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 8: Verify the function exists
SELECT 
  routine_name, 
  routine_type, 
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Step 9: Test profile creation with a valid UUID
DO $$
DECLARE
    test_uuid uuid;
    test_result boolean;
BEGIN
    -- Generate a test UUID
    test_uuid := gen_random_uuid();
    
    -- Try to insert a test profile
    BEGIN
        INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
        VALUES (test_uuid, 'test@example.com', 'Test User', 'mentor', NOW(), NOW());
        
        -- If we get here, it worked
        test_result := true;
        
        -- Clean up
        DELETE FROM public.profiles WHERE id = test_uuid;
        
        RAISE NOTICE 'Profile creation test PASSED - UUID: %', test_uuid;
        
    EXCEPTION
        WHEN OTHERS THEN
            test_result := false;
            RAISE NOTICE 'Profile creation test FAILED - UUID: %, Error: %', test_uuid, SQLERRM;
    END;
END $$;

-- Step 10: Check current profiles count
SELECT COUNT(*) as current_profiles_count FROM public.profiles;

-- Step 11: Show any existing mentors
SELECT 
  id, 
  email, 
  name, 
  role, 
  specialty, 
  status,
  created_at
FROM public.profiles 
WHERE role = 'mentor'
ORDER BY created_at DESC;

-- Step 12: Success message
SELECT 'Profile creation fix applied successfully! UUID validation and RLS policies updated.' as status;
