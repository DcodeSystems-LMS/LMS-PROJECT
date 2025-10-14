-- Debug Material Downloads Issue
-- Run this in your Supabase SQL editor to check what materials exist and their file paths

-- 1. Check all materials in the database with their file paths
SELECT 
  id,
  course_id,
  title,
  file_name,
  file_path,
  file_size,
  file_type,
  category,
  is_public,
  created_at
FROM public.course_materials 
ORDER BY created_at DESC;

-- 2. Check if there are any materials with the specific file path that's failing
SELECT 
  id,
  course_id,
  title,
  file_name,
  file_path,
  file_size
FROM public.course_materials 
WHERE file_path LIKE '%html-basics-handout.pdf%'
   OR file_name LIKE '%html-basics-handout%';

-- 3. Check materials for the HTML course specifically
SELECT 
  id,
  course_id,
  title,
  file_name,
  file_path,
  file_size,
  file_type
FROM public.course_materials 
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b'
ORDER BY created_at DESC;

-- 4. Check what courses exist and their IDs
SELECT 
  id,
  title,
  created_at
FROM public.courses 
ORDER BY created_at DESC;

-- 5. Check if the course-materials storage bucket exists and what files are in it
-- Note: This requires checking in the Supabase dashboard under Storage
-- Go to Storage > course-materials bucket to see what files actually exist

-- 6. Check for any materials with missing or invalid file paths
SELECT 
  id,
  course_id,
  title,
  file_name,
  file_path,
  CASE 
    WHEN file_path IS NULL THEN 'NULL file_path'
    WHEN file_path = '' THEN 'Empty file_path'
    WHEN file_path NOT LIKE 'materials/%' THEN 'Invalid path format'
    ELSE 'Valid path'
  END as path_status
FROM public.course_materials 
WHERE file_path IS NULL 
   OR file_path = '' 
   OR file_path NOT LIKE 'materials/%';
