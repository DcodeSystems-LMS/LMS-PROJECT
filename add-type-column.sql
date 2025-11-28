-- Add missing 'type' column to assessments table
-- Run this in Supabase SQL Editor

-- Add the missing 'type' column
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('quiz', 'project', 'assignment')) DEFAULT 'quiz';

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assessments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert to verify everything works
-- (Replace with your actual course ID from the courses table)
/*
INSERT INTO public.assessments (
  title,
  description,
  course_id,
  instructor_id,
  type,
  difficulty,
  time_limit_minutes,
  passing_score,
  questions,
  status
) VALUES (
  'Test Assessment',
  'This is a test assessment',
  '5cbd507d-45fc-4faa-b38c-fa04fd91944b',  -- Use one of your course IDs
  auth.uid(),
  'quiz',
  'beginner',
  30,
  60,
  '[]'::jsonb,
  'draft'
);
*/
