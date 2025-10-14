-- Fix Course Delete RLS Policy
-- This script adds the missing DELETE policy for courses
-- Run this in your Supabase SQL editor

-- Add DELETE policy for courses
-- Course instructors can delete their own courses
CREATE POLICY "Course instructors can delete their own courses" ON public.courses
  FOR DELETE USING (
    instructor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'courses' 
AND cmd = 'DELETE';
