-- Create Sample Enrollments
-- Run this in your Supabase SQL editor to create test enrollments

-- First, let's see what courses and students we have
SELECT 'Available Courses:' as info;
SELECT id, title, instructor_id FROM public.courses LIMIT 5;

SELECT 'Available Students:' as info;
SELECT id, name, email, role FROM public.profiles WHERE role = 'student' LIMIT 5;

-- Create sample enrollments
-- Enroll the first student in the first course
INSERT INTO public.enrollments (student_id, course_id, progress)
SELECT 
  s.id as student_id,
  c.id as course_id,
  25 as progress
FROM public.profiles s, public.courses c
WHERE s.role = 'student' 
  AND c.id = (SELECT id FROM public.courses LIMIT 1)
LIMIT 1;

-- Enroll the second student in the first course
INSERT INTO public.enrollments (student_id, course_id, progress)
SELECT 
  s.id as student_id,
  c.id as course_id,
  50 as progress
FROM public.profiles s, public.courses c
WHERE s.role = 'student' 
  AND s.id != (SELECT student_id FROM public.enrollments LIMIT 1)
  AND c.id = (SELECT id FROM public.courses LIMIT 1)
LIMIT 1;

-- Enroll students in the second course if it exists
INSERT INTO public.enrollments (student_id, course_id, progress)
SELECT 
  s.id as student_id,
  c.id as course_id,
  10 as progress
FROM public.profiles s, public.courses c
WHERE s.role = 'student' 
  AND c.id = (SELECT id FROM public.courses OFFSET 1 LIMIT 1)
LIMIT 2;

-- Verify enrollments were created
SELECT 'Enrollments Created:' as info;
SELECT 
  e.id,
  s.name as student_name,
  c.title as course_title,
  e.progress,
  e.enrolled_at
FROM public.enrollments e
JOIN public.profiles s ON e.student_id = s.id
JOIN public.courses c ON e.course_id = c.id;

-- Show enrollment count
SELECT COUNT(*) as total_enrollments FROM public.enrollments;
