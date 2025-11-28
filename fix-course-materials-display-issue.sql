-- Fix Course Materials Display Issue
-- This script addresses the issue where uploaded materials don't show up

-- Step 1: Update existing materials to ensure is_public is set correctly
UPDATE public.course_materials 
SET is_public = true 
WHERE is_public IS NULL OR is_public = false;

-- Step 2: Fix the RLS policies to ensure mentors can view their materials
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can upload materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update their materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete their materials" ON public.course_materials;

-- Step 3: Create comprehensive RLS policies

-- Policy 1: Students can view materials for courses they're enrolled in
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );

-- Policy 2: Mentors can view ALL materials for their courses (regardless of is_public)
CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Policy 3: Mentors can upload materials to their courses
CREATE POLICY "Mentors can upload materials" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

-- Policy 4: Mentors can update their materials
CREATE POLICY "Mentors can update their materials" ON public.course_materials
  FOR UPDATE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Policy 5: Mentors can delete their materials
CREATE POLICY "Mentors can delete their materials" ON public.course_materials
  FOR DELETE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT ALL ON public.course_materials TO authenticated;

-- Step 6: Verify the policies were created
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

-- Step 7: Check materials for the specific course after fix
SELECT 
  id,
  course_id,
  title,
  file_name,
  is_public,
  uploaded_by,
  created_at
FROM public.course_materials 
WHERE course_id = '233d10b6-e4dc-4471-89ca-5e6e953bde46'
ORDER BY created_at DESC;
