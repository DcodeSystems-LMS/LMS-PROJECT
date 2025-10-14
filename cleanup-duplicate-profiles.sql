-- SQL script to clean up duplicate profiles
-- Run this in your Supabase SQL editor

-- Step 1: Check for existing profiles with the problematic email
SELECT 
  id, 
  email, 
  name, 
  role, 
  specialty, 
  status,
  created_at
FROM public.profiles 
WHERE email = 'pinjalajeysankarsai@gmail.com'
ORDER BY created_at DESC;

-- Step 2: Show count of profiles with this email
SELECT 
  COUNT(*) as profile_count,
  email
FROM public.profiles 
WHERE email = 'pinjalajeysankarsai@gmail.com'
GROUP BY email;

-- Step 3: Delete all profiles with this email (uncomment to execute)
-- WARNING: This will delete ALL profiles with this email
-- DELETE FROM public.profiles 
-- WHERE email = 'pinjalajeysankarsai@gmail.com';

-- Step 4: Show all mentors after cleanup
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

-- Step 5: Show total profiles count
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Step 6: Show profiles by role
SELECT 
  role, 
  COUNT(*) as count
FROM public.profiles 
GROUP BY role
ORDER BY role;
