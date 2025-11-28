-- Fix RLS Policies for Course Materials Upload
-- Run this in your Supabase SQL editor

-- First, let's check what RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'course_materials';

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can insert materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete materials for their courses" ON public.course_materials;

-- Create comprehensive RLS policies for course_materials

-- 1. Students can view materials for courses they're enrolled in
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );

-- 2. Mentors can view all materials for their courses
CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- 3. Mentors can insert materials for their courses
CREATE POLICY "Mentors can insert materials for their courses" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

-- 4. Mentors can update materials for their courses
CREATE POLICY "Mentors can update materials for their courses" ON public.course_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- 5. Mentors can delete materials for their courses
CREATE POLICY "Mentors can delete materials for their courses" ON public.course_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- 6. Allow authenticated users to view their own uploaded materials
CREATE POLICY "Users can view their own materials" ON public.course_materials
  FOR SELECT USING (uploaded_by = auth.uid());

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'course_materials'
ORDER BY policyname;
