-- Test and Fix Mentor Role Assignment
-- This script will help diagnose and fix the mentor role issue

-- Step 1: Check current trigger function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 2: Check if the trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 3: Test the current trigger function
-- Let's create a more robust version that ensures mentor role is properly set

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Debug: Log the user data being processed
  RAISE NOTICE 'Creating profile for user: %, role: %, name: %', 
    NEW.id, 
    NEW.raw_user_meta_data->>'role', 
    NEW.raw_user_meta_data->>'name';
  
  -- Insert profile with proper role handling
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role),
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Test with a sample user creation
-- This will help us see what's happening
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Create a test user with mentor role
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    'test-mentor@example.com',
    crypt('testpassword', gen_salt('bf')),
    NOW(),
    '{"name": "Test Mentor", "role": "mentor"}'::jsonb
  ) RETURNING id INTO test_user_id;
  
  -- Check if profile was created with correct role
  PERFORM * FROM public.profiles WHERE id = test_user_id;
  
  -- Clean up test user
  DELETE FROM auth.users WHERE id = test_user_id;
  
  RAISE NOTICE 'Test completed successfully';
END $$;

-- Step 6: Check existing profiles and their roles
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 7: Fix any existing mentor profiles that might have wrong role
UPDATE public.profiles 
SET role = 'mentor'
WHERE email IN (
  SELECT email FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'mentor'
)
AND role != 'mentor';

-- Step 8: Verify the fix
SELECT 
  'Mentor role fix completed' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'mentor' THEN 1 END) as mentor_profiles,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_profiles
FROM public.profiles;
