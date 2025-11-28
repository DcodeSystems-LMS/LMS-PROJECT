-- Check which course you're currently viewing
-- Run this to see the course details for the ID in your URL

SELECT 
  id,
  title,
  description,
  instructor_id,
  created_at
FROM public.courses 
WHERE id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';

-- Also check the HTML course that has materials
SELECT 
  id,
  title,
  description,
  instructor_id,
  created_at
FROM public.courses 
WHERE id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';

-- Check what materials exist for the HTML course
SELECT 
  id,
  title,
  file_name,
  category,
  created_at
FROM public.course_materials 
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';


