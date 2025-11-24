-- Fix Course Materials UUID Error
-- This script fixes the "invalid input syntax for type uuid" error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if course_materials table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'course_materials' 
AND table_schema = 'public';

-- Step 2: Create course_materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER, -- Optional: link to specific lesson
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER NOT NULL, -- Size in bytes
  file_type TEXT NOT NULL, -- MIME type
  file_extension TEXT NOT NULL, -- e.g., 'pdf', 'docx', 'pptx'
  category TEXT DEFAULT 'general', -- e.g., 'slides', 'handout', 'code', 'reference'
  is_public BOOLEAN DEFAULT true, -- Whether students can download
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Fix the id column to have proper default value
DO $$
BEGIN
  -- Check if the id column has gen_random_uuid() as default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_materials' 
    AND table_schema = 'public' 
    AND column_name = 'id' 
    AND column_default LIKE '%gen_random_uuid%'
  ) THEN
    -- Add the default value to the id column
    ALTER TABLE public.course_materials 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    RAISE NOTICE 'Added gen_random_uuid() default to course_materials id column';
  ELSE
    RAISE NOTICE 'course_materials id column already has gen_random_uuid() default';
  END IF;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson_id ON public.course_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_uploaded_by ON public.course_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_course_materials_category ON public.course_materials(category);

-- Step 5: Enable Row Level Security
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can upload materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update their materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete their materials" ON public.course_materials;

-- Step 7: Create RLS policies
-- Students can view materials for courses they're enrolled in
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );

-- Mentors can view all materials for their courses
CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can upload materials to their courses
CREATE POLICY "Mentors can upload materials" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

-- Mentors can update their materials
CREATE POLICY "Mentors can update their materials" ON public.course_materials
  FOR UPDATE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can delete their materials
CREATE POLICY "Mentors can delete their materials" ON public.course_materials
  FOR DELETE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Step 8: Verify the configuration
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_default LIKE '%gen_random_uuid%' THEN '✅ Has UUID default'
    ELSE '❌ Missing UUID default'
  END as default_status
FROM information_schema.columns 
WHERE table_name = 'course_materials' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 9: Check RLS policies
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
