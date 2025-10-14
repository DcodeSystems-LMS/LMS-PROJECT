-- Simple Enrollment Fix for Course Materials Access
-- This script creates a basic enrollment to allow access to course materials

-- First, let's create the enrollments table if it doesn't exist (minimal structure)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.enrollments;

CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Function to enroll a student in a course
CREATE OR REPLACE FUNCTION enroll_student_in_course(
  p_student_id UUID,
  p_course_id UUID
)
RETURNS void AS $$
BEGIN
  -- Insert enrollment if it doesn't exist
  INSERT INTO public.enrollments (student_id, course_id)
  VALUES (p_student_id, p_course_id)
  ON CONFLICT (student_id, course_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION enroll_student_in_course(UUID, UUID) TO authenticated;

-- Check if you need to enroll a specific student
-- Replace 'YOUR_STUDENT_USER_ID' with the actual student's user ID
-- SELECT enroll_student_in_course(
--   'YOUR_STUDENT_USER_ID',
--   'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b'
-- );

-- Check current enrollments for the course
SELECT 
  e.*,
  p.name as student_name,
  p.email as student_email,
  c.title as course_title
FROM public.enrollments e
JOIN public.profiles p ON e.student_id = p.id
JOIN public.courses c ON e.course_id = c.id
WHERE e.course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';


