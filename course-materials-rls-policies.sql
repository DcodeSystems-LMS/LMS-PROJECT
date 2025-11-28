-- Course Materials RLS Policies
-- Run this in your Supabase SQL Editor to create the necessary RLS policies

-- Step 1: Enable RLS on course_materials table
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can view materials for their courses" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can upload materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can update their materials" ON public.course_materials;
DROP POLICY IF EXISTS "Mentors can delete their materials" ON public.course_materials;

-- Step 3: Create RLS policies for course_materials

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

-- Policy 2: Mentors can view all materials for their courses
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

-- Step 4: Verify the policies were created
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
