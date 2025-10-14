-- Debug: Check materials uploaded during course creation
-- Run this to see what materials exist and which courses they belong to

-- 1. Check all courses and their materials
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.created_at as course_created,
  COUNT(cm.id) as material_count
FROM public.courses c
LEFT JOIN public.course_materials cm ON c.id = cm.course_id
GROUP BY c.id, c.title, c.created_at
ORDER BY c.created_at DESC;

-- 2. Check all materials with their course details
SELECT 
  cm.id,
  cm.title as material_title,
  cm.file_name,
  cm.category,
  cm.created_at as material_created,
  c.title as course_title,
  c.id as course_id
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
ORDER BY cm.created_at DESC;

-- 3. Check specifically for the ReactJS course
SELECT 
  c.id,
  c.title,
  c.created_at,
  COUNT(cm.id) as material_count
FROM public.courses c
LEFT JOIN public.course_materials cm ON c.id = cm.course_id
WHERE c.id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b'
GROUP BY c.id, c.title, c.created_at;

-- 4. Check if there are any materials for the ReactJS course
SELECT 
  cm.*,
  c.title as course_title
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
WHERE c.id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';


