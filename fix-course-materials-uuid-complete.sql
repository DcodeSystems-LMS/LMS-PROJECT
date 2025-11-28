-- Complete Fix for Course Materials UUID Error
-- This script fixes the "invalid input syntax for type uuid" error
-- Run this in your Supabase SQL Editor

-- Step 1: Check current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'course_materials' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Drop and recreate the course_materials table with correct schema
DROP TABLE IF EXISTS public.course_materials CASCADE;

-- Step 3: Create course_materials table with correct schema
CREATE TABLE public.course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER, -- Optional: link to specific lesson (INTEGER, not UUID)
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

-- Step 4: Create indexes for better performance
CREATE INDEX idx_course_materials_course_id ON public.course_materials(course_id);
CREATE INDEX idx_course_materials_lesson_id ON public.course_materials(lesson_id);
CREATE INDEX idx_course_materials_uploaded_by ON public.course_materials(uploaded_by);
CREATE INDEX idx_course_materials_category ON public.course_materials(category);

-- Step 5: Enable Row Level Security
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can insert materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete materials for their courses" ON public.course_materials;

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

-- Mentors can insert materials for their courses
CREATE POLICY "Mentors can insert materials for their courses" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- Mentors can update materials for their courses
CREATE POLICY "Mentors can update materials for their courses" ON public.course_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can delete materials for their courses
CREATE POLICY "Mentors can delete materials for their courses" ON public.course_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Step 8: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'course_materials' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 9: Test insert (this should work now)
-- Note: Replace with actual course_id and user_id from your system
/*
INSERT INTO public.course_materials (
  course_id,
  lesson_id,
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
) VALUES (
  'your-course-id-here',
  1,
  'Test Material',
  'Test Description',
  'test.pdf',
  'course-materials/test/test.pdf',
  1024,
  'application/pdf',
  'pdf',
  'general',
  true,
  'your-user-id-here'
);
*/

-- Step 10: Check if the table is properly created
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_name = 'course_materials' 
AND table_schema = 'public';
