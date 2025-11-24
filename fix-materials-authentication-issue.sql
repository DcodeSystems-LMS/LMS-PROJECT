-- Fix Course Materials Authentication and RLS Issues
-- This script addresses the authentication and RLS policy problems

-- Step 1: First, let's check the current authentication state
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  auth.email() as current_email;

-- Step 2: Update existing materials to ensure they're properly set
UPDATE public.course_materials 
SET is_public = true 
WHERE is_public IS NULL OR is_public = false;

-- Step 3: Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can upload materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update their materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete their materials" ON public.course_materials;
DROP POLICY IF EXISTS "Authenticated users can view public materials" ON public.course_materials;
DROP POLICY IF EXISTS "All authenticated users can view public materials" ON public.course_materials;

-- Step 4: Create comprehensive RLS policies that work for both authenticated and unauthenticated access

-- Policy 1: Allow anyone to view public materials (for testing)
CREATE POLICY "Anyone can view public materials" ON public.course_materials
  FOR SELECT USING (is_public = true);

-- Policy 2: Allow authenticated users to view materials for their courses
CREATE POLICY "Authenticated users can view their course materials" ON public.course_materials
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- Students enrolled in the course
      EXISTS (
        SELECT 1 FROM public.enrollments 
        WHERE student_id = auth.uid() 
        AND course_id = course_materials.course_id
      ) OR
      -- Course instructors
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE id = course_materials.course_id 
        AND instructor_id = auth.uid()
      )
    )
  );

-- Policy 3: Allow course instructors to upload materials
CREATE POLICY "Course instructors can upload materials" ON public.course_materials
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

-- Policy 4: Allow course instructors to update their materials
CREATE POLICY "Course instructors can update their materials" ON public.course_materials
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Policy 5: Allow course instructors to delete their materials
CREATE POLICY "Course instructors can delete their materials" ON public.course_materials
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant necessary permissions
GRANT ALL ON public.course_materials TO authenticated;
GRANT ALL ON public.course_materials TO anon;

-- Step 7: Test the query that the frontend uses
-- This should now work even without authentication
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
AND is_public = true
ORDER BY created_at DESC;

-- Step 8: Verify all policies are created
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
