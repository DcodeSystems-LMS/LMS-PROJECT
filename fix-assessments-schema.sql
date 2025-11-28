-- Fix assessments table schema - Add missing columns
-- Run this in Supabase SQL Editor

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assessments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';

-- Add other potentially missing columns
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS time_limit_minutes integer;

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS passing_score integer DEFAULT 60;

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS questions jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'draft', 'paused', 'archived')) DEFAULT 'draft';

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
