-- Debug Course Materials Issue
-- Run this in your Supabase SQL Editor to diagnose the problem

-- Step 1: Check if course_materials table exists and has data
SELECT 
  COUNT(*) as total_materials,
  COUNT(CASE WHEN is_public = true THEN 1 END) as public_materials,
  COUNT(CASE WHEN is_public = false THEN 1 END) as private_materials,
  COUNT(CASE WHEN is_public IS NULL THEN 1 END) as null_public_materials
FROM public.course_materials;

-- Step 2: Check materials for the specific course
SELECT 
  id,
  course_id,
  title,
  file_name,
  is_public,
  uploaded_by,
  created_at
FROM public.course_materials 
WHERE course_id = '233d10b6-e4dc-4471-89ca-5e6e953bde46'
ORDER BY created_at DESC;

-- Step 3: Check RLS policies on course_materials table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'course_materials' 
AND schemaname = 'public'
ORDER BY policyname;

-- Step 4: Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'course_materials' 
AND schemaname = 'public';

-- Step 5: Test query that matches the frontend logic
-- This should show what the frontend is actually getting
SELECT 
  id,
  course_id,
  title,
  file_name,
  is_public,
  uploaded_by,
  created_at
FROM public.course_materials 
WHERE course_id = '233d10b6-e4dc-4471-89ca-5e6e953bde46'
AND is_public = true
ORDER BY created_at DESC;

-- Step 6: Check if the current user can see materials (run as the mentor user)
-- This will help identify RLS policy issues
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;
