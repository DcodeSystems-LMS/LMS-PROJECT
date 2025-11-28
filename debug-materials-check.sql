-- Debug: Check Course Materials in Database
-- Run this in your Supabase SQL Editor to see what materials exist

-- 1. Check all materials in the database
SELECT 
  id,
  course_id,
  title,
  file_name,
  category,
  is_public,
  created_at
FROM public.course_materials 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check materials for the specific course
SELECT 
  id,
  course_id,
  title,
  file_name,
  category,
  is_public,
  created_at
FROM public.course_materials 
WHERE course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b'
ORDER BY created_at DESC;

-- 3. Check all courses to see the course ID
SELECT 
  id,
  title,
  instructor_id,
  created_at
FROM public.courses 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if materials exist for any course
SELECT 
  cm.course_id,
  c.title as course_title,
  COUNT(cm.id) as material_count
FROM public.course_materials cm
LEFT JOIN public.courses c ON cm.course_id = c.id
GROUP BY cm.course_id, c.title
ORDER BY material_count DESC;


