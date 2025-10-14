-- Fix Mentor Role Assignment
-- Run this in your Supabase SQL Editor

-- Step 1: Update the trigger function to ensure mentor role is properly set
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

-- Step 2: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Fix any existing mentor profiles that might have wrong role
UPDATE public.profiles 
SET role = 'mentor'
WHERE email IN (
  SELECT email FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'mentor'
)
AND role != 'mentor';

-- Step 4: Verify the fix
SELECT 
  'Mentor role fix completed' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'mentor' THEN 1 END) as mentor_profiles,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_profiles
FROM public.profiles;
