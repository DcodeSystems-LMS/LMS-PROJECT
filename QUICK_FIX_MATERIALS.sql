-- QUICK FIX: Allow Access to Course Materials
-- Run this in your Supabase SQL Editor to fix the materials download issue

-- Step 1: Drop the restrictive RLS policy
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;

-- Step 2: Create a more permissive policy that allows any authenticated user to view public materials
CREATE POLICY "Authenticated users can view public materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    auth.uid() IS NOT NULL
  );

-- Step 3: Ensure mentors can still manage their materials
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can insert materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete materials for their courses" ON public.course_materials;

-- Create mentor policies
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

-- Step 4: Add the download count increment function if it doesn't exist
CREATE OR REPLACE FUNCTION increment_material_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.course_materials 
  SET download_count = download_count + 1 
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_material_download_count(UUID) TO authenticated;

-- Test: Check if materials are now accessible
-- SELECT * FROM public.course_materials WHERE course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';


