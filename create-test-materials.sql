-- Create Test Materials for Download Testing
-- Run this in your Supabase SQL editor to create some test materials

-- First, let's check what courses exist
SELECT id, title FROM public.courses ORDER BY created_at DESC LIMIT 5;

-- Create test materials for the HTML course (assuming it exists)
-- Replace the course_id with an actual course ID from your database

INSERT INTO public.course_materials (
  course_id,
  title,
  description,
  file_name,
  file_path,
  file_size,
  file_type,
  file_extension,
  category,
  is_public,
  uploaded_by
) VALUES 
(
  '5cbd507d-45fc-4faa-b38c-fa04fd91944b', -- Replace with actual course ID
  'HTML Basics Handout',
  'A comprehensive guide to HTML fundamentals',
  'html-basics-handout.pdf',
  'materials/html-basics-handout.pdf',
  1024000, -- 1MB in bytes
  'application/pdf',
  'pdf',
  'handout',
  true,
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1) -- Get first mentor
),
(
  '5cbd507d-45fc-4faa-b38c-fa04fd91944b', -- Replace with actual course ID
  'CSS Flexbox Guide',
  'Complete guide to CSS Flexbox layout',
  'css-flexbox-guide.pdf',
  'materials/css-flexbox-guide.pdf',
  2048000, -- 2MB in bytes
  'application/pdf',
  'pdf',
  'reference',
  true,
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1) -- Get first mentor
),
(
  '5cbd507d-45fc-4faa-b38c-fa04fd91944b', -- Replace with actual course ID
  'JavaScript Fundamentals',
  'Introduction to JavaScript programming',
  'javascript-fundamentals.pdf',
  'materials/javascript-fundamentals.pdf',
  3072000, -- 3MB in bytes
  'application/pdf',
  'pdf',
  'slides',
  true,
  (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1) -- Get first mentor
);

-- Check if the materials were created
SELECT 
  id,
  course_id,
  title,
  file_name,
  file_path,
  file_size,
  category,
  created_at
FROM public.course_materials 
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b'
ORDER BY created_at DESC;

-- Note: After creating these database records, you'll need to actually upload
-- the corresponding files to the Supabase storage bucket 'course-materials'
-- with the paths: materials/html-basics-handout.pdf, etc.
