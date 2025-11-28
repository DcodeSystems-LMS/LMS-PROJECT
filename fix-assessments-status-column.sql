-- Fix assessments table to add status column
-- This script ensures assessments have a status column for proper filtering

-- Add status column to assessments table if it doesn't exist
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'published', 'paused', 'archived')) DEFAULT 'draft';

-- Update existing assessments to have 'active' status if they don't have one
UPDATE public.assessments 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_course_id ON public.assessments(course_id);

-- Update RLS policies for assessments
DROP POLICY IF EXISTS "Students can view assessments for enrolled courses" ON public.assessments;

-- Create policy for students to view assessments for their enrolled courses
CREATE POLICY "Students can view assessments for enrolled courses" ON public.assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE course_id = assessments.course_id 
      AND student_id = auth.uid()
      AND status IN ('enrolled', 'active', 'completed')
    )
  );

-- Keep existing policies
CREATE POLICY "Anyone can view assessments" ON public.assessments
  FOR SELECT USING (true);

CREATE POLICY "Mentors can create assessments" ON public.assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

