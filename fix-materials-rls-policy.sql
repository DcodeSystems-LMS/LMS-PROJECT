-- Fix Course Materials RLS Policy Issue
-- This script addresses the issue where students can't see course materials
-- even when they should have access

-- Option 1: Temporarily disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE public.course_materials DISABLE ROW LEVEL SECURITY;

-- Option 2: Update the RLS policy to be more permissive for testing
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;

-- Create a more permissive policy for testing
-- This allows any authenticated user to view public materials
CREATE POLICY "Authenticated users can view public materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    auth.uid() IS NOT NULL
  );

-- Option 3: Create a policy that checks both enrollment AND allows course instructors
CREATE POLICY "Students and instructors can view materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND (
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

-- Option 4: If you want to allow all authenticated users to see all public materials
-- (Use this only for testing/development)
/*
DROP POLICY IF EXISTS "Students and instructors can view materials" ON public.course_materials;
CREATE POLICY "All authenticated users can view public materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND auth.uid() IS NOT NULL
  );
*/

-- Also ensure mentors can manage their own materials
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can insert materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete materials for their courses" ON public.course_materials;

-- Create comprehensive mentor policies
CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert materials for their courses" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

CREATE POLICY "Mentors can update materials for their courses" ON public.course_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete materials for their courses" ON public.course_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Add a function to increment download count
CREATE OR REPLACE FUNCTION increment_material_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.course_materials 
  SET download_count = download_count + 1 
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_material_download_count(UUID) TO authenticated;


